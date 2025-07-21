import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../helpers/common';
import { useCart } from '../context/CartContext';
import { createOrder } from '../services/apiProducts';
import BreadcrumbsComponent from '../components/Common/Breadcrumbs';
import { countries } from '../modules/country';

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const contentRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const { state } = useCart();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [createAccount, setCreateAccount] = useState<boolean>(false);
  const [shipToDifferentAddress, setShipToDifferentAddress] =
    useState<boolean>(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>('bank');
  const [couponCode, setCouponCode] = useState('');

  const handleCreateAccountChange = () => {
    setCreateAccount(!createAccount);
  };

  const [billingData, setBillingData] = useState({
    firstName: '',
    lastName: '',
    companyName: '',
    address1: '',
    address2: '',
    city: '',
    zipCode: '',
    state: '',
    country: '',
    phone: '',
    email: '',
  });

  const [billingErrors, setBillingErrors] = useState({
    firstName: '',
    lastName: '',
    address1: '',
    city: '',
    zipCode: '',
    state: '',
    country: '',
    phone: '',
    email: '',
  });

  const [shippingData, setShippingData] = useState({
    shippingFirstName: '',
    shippingLastName: '',
    shippingCompanyName: '',
    shippingAddress1: '',
    shippingAddress2: '',
    shippingCity: '',
    shippingZipCode: '',
    shippingState: '',
    shippingCountry: '',
    shippingPhone: '',
    shippingEmail: '',
  });

  const [shippingErrors, setShippingErrors] = useState({
    shippingFirstName: '',
    shippingLastName: '',
    shippingAddress1: '',
    shippingCity: '',
    shippingZipCode: '',
    shippingState: '',
    shippingCountry: '',
    shippingPhone: '',
    shippingEmail: '',
  });

  const validateBillingData = () => {
    const requiredFields = [
      'firstName',
      'lastName',
      'address1',
      'city',
      'zipCode',
      'country',
      'phone',
      'email',
    ];

    let isValid = true;
    const newBillingErrors = { ...billingErrors };

    for (const field of requiredFields) {
      if (!billingData[field as keyof typeof billingData]) {
        newBillingErrors[field as keyof typeof billingErrors] =
          'This field is required';
        isValid = false;
      } else {
        newBillingErrors[field as keyof typeof billingErrors] = '';
      }
    }

    setBillingErrors(newBillingErrors);
    return isValid;
  };

  const validateShippingData = () => {
    const requiredFields = [
      'shippingFirstName',
      'shippingLastName',
      'shippingAddress1',
      'shippingCity',
      'shippingZipCode',
      'shippingCountry',
      'shippingPhone',
      'shippingEmail',
    ];

    let isValid = true;
    const newShippingErrors = { ...shippingErrors };

    for (const field of requiredFields) {
      if (!shippingData[field as keyof typeof shippingData]) {
        newShippingErrors[field as keyof typeof shippingErrors] =
          'This field is required';
        isValid = false;
      } else {
        newShippingErrors[field as keyof typeof shippingErrors] = '';
      }
    }

    console.log('Shipping Errors:', newShippingErrors); // Debugging log
    setShippingErrors(newShippingErrors);
    return isValid;
  };

  const [subtotal, setSubtotal] = useState(0.0);
  const [discount, setDiscount] = useState(0.0);
  const [shipping] = useState(10.0);
  const [total, setTotal] = useState(0.0);

  useEffect(() => {
    const calculateSubtotal = () => {
      const storedCart = localStorage.getItem('cart');
      const cartItems = storedCart ? JSON.parse(storedCart) : [];
      const subtotal = cartItems.reduce(
        (sum: number, item: { price: number; quantity: number }) =>
          sum + item.price * item.quantity,
        0
      );
      setSubtotal(subtotal);
    };

    const calculateDiscount = () => {
      // Example discount logic: 10% discount
      const discount = subtotal * 0.1;
      setDiscount(discount);
    };

    const calculateTotal = () => {
      const total = subtotal + shipping - discount;
      setTotal(total);
    };

    calculateSubtotal();
    calculateDiscount();
    calculateTotal();
  }, [subtotal, shipping, discount]);

  const handleInputChange =
    (setter: React.Dispatch<React.SetStateAction<any>>) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setter((prevData: any) => ({
        ...prevData,
        [name]: value,
      }));
    };

  const handleshipToDifferentAddressChange = () => {
    setShipToDifferentAddress(!shipToDifferentAddress);
  };

  const handleCouponCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCouponCode(e.target.value);
  };

  const handlePaymentMethodChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSelectedPaymentMethod(e.target.value);
  };

  const calculateHeight = (id: string) => {
    const element = contentRefs.current[id];
    return element ? `${element.scrollHeight}px` : '0px';
  };

  const paymentMethods = [
    {
      id: 'bank',
      label: 'Direct bank transfer',
      details:
        'Make your payment directly into our bank account. Please use your Order ID as the payment reference. Your order will not be shipped until the funds have cleared in our account.',
    },
    {
      id: 'cc',
      label: 'Credit Card payments',
      details:
        'Please make a payment using your credit card. Enter your card details at checkout to complete the transaction securely.',
    },
    {
      id: 'cod',
      label: 'Cash on delivery',
      details: 'Pay with cash upon delivery.',
    },
  ];

  const handlePlaceOrder = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!termsAccepted) {
      setErrorMessage(
        'Please accept the terms and conditions before placing the order.'
      );
      return;
    }

    const isBillingValid = validateBillingData();
    const isShippingValid = shipToDifferentAddress
      ? validateShippingData()
      : true;

    if (!isBillingValid || !isShippingValid) {
      setErrorMessage('Please fill out all required billing information.');

      return;
    }
    const storedCart = localStorage.getItem('cart');
    const orderData = storedCart ? JSON.parse(storedCart) : [];

    const simplifiedOrderData = orderData.map(
      (item: { id: number; quantity: number }) => ({
        id: item.id.toString(),
        quantity: item.quantity,
      })
    );

    const transactionData = {
      billing_data: billingData,
      ...(shipToDifferentAddress && { shippingData }),
      order_data: simplifiedOrderData,
      selected_payment_method: selectedPaymentMethod,
      shipToDifferentAddress,
      ...(couponCode && { couponCode }),
    };

    console.log('Transaction Data:', transactionData);

    try {
      const result = await createOrder(transactionData);
      console.log('Order placed successfully! Order ID: ' + result.order_id);

      // Clear the cart from localStorage
      localStorage.removeItem('cart');

      // Navigate to the OrderReceived page
      navigate(`/checkout/order-received/${result.id}`);
    } catch (error) {
      console.error('Error:', error);
      if (error instanceof Error) {
        console.log(error.message);
      } else {
        console.log('An unknown error occurred.');
      }
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mx-auto mt-6">
        <BreadcrumbsComponent />
      </div>
      {/* Title */}
      <div className="mx-auto mt-6">
        <h1 className="font-normal text-gray-900 dark:text-gray-100 mb-6 mt-6 text-left text-4xl leading-tight font-gliko">
          Check Out
        </h1>
      </div>

      <div className="flex flex-wrap lg:flex-nowrap gap-8">
        {/* Left Column: Shipping Information */}
        <div className="w-full lg:w-2/3 bg-white">
          {/* Billing Section */}
          <div className="billing-fields mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Billing Information
            </h2>

            <div className="billing-fields-field-wrapper space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    First Name
                    <abbr className="text-red-500 ml-1">*</abbr>
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={billingData.firstName}
                    onChange={handleInputChange(setBillingData)}
                    className="mt-2 p-2 border border-gray-300 rounded w-full"
                    placeholder="First name"
                    required
                  />

                  {billingErrors.firstName && (
                    <p className="text-red-600">{billingErrors.firstName}</p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Last Name
                    <abbr className="text-red-500 ml-1">*</abbr>
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={billingData.lastName}
                    onChange={handleInputChange(setBillingData)}
                    className="mt-2 p-2 border border-gray-300 rounded w-full"
                    placeholder="Last name"
                    required
                  />

                  {billingErrors.lastName && (
                    <p className="text-red-600">{billingErrors.lastName}</p>
                  )}
                </div>
              </div>
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email Address <abbr className="text-red-500 ml-1">*</abbr>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={billingData.email}
                  onChange={handleInputChange(setBillingData)}
                  className="mt-2 p-2 border border-gray-300 rounded w-full"
                  placeholder="Email address"
                  required
                />
                {billingErrors.email && (
                  <p className="text-red-600">{billingErrors.email}</p>
                )}
              </div>
              <div className="mb-4">
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Phone Number
                  <abbr className="text-red-500 ml-1">*</abbr>
                </label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={billingData.phone}
                  onChange={handleInputChange(setBillingData)}
                  className="mt-2 p-2 border border-gray-300 rounded w-full"
                  placeholder="Phone number"
                  required
                />
                {billingErrors.phone && (
                  <p className="text-red-600">{billingErrors.phone}</p>
                )}
              </div>
              <div className="mb-4">
                <label
                  htmlFor="companyName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Company Name (Optional)
                </label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={billingData.companyName}
                  onChange={handleInputChange(setBillingData)}
                  className="mt-2 p-2 border border-gray-300 rounded w-full"
                  placeholder="Company name"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="address1"
                  className="block text-sm font-medium text-gray-700"
                >
                  Address Line 1<abbr className="text-red-500 ml-1">*</abbr>
                </label>
                <input
                  type="text"
                  id="address1"
                  name="address1"
                  value={billingData.address1}
                  onChange={handleInputChange(setBillingData)}
                  className="mt-2 p-2 border border-gray-300 rounded w-full"
                  placeholder="Address Line 1"
                  required
                />
                {billingErrors.address1 && (
                  <p className="text-red-600">{billingErrors.address1}</p>
                )}
              </div>
              <div className="mb-4">
                <label
                  htmlFor="baddress2"
                  className="block text-sm font-medium text-gray-700"
                >
                  Address Line 2 (Optional)
                </label>
                <input
                  type="text"
                  id="address2"
                  name="address2"
                  value={billingData.address2}
                  onChange={handleInputChange(setBillingData)}
                  className="mt-2 p-2 border border-gray-300 rounded w-full"
                  placeholder="Apartment, suite, unit, etc."
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="city"
                  className="block text-sm font-medium text-gray-700"
                >
                  City
                  <abbr className="text-red-500 ml-1">*</abbr>
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={billingData.city}
                  onChange={handleInputChange(setBillingData)}
                  className="mt-2 p-2 border border-gray-300 rounded w-full"
                  placeholder="City"
                  required
                />
                {billingErrors.city && (
                  <p className="text-red-600">{billingErrors.city}</p>
                )}
              </div>
              <div className="mb-4">
                <label
                  htmlFor="state"
                  className="block text-sm font-medium text-gray-700"
                >
                  State/Province
                  <abbr className="text-red-500 ml-1">*</abbr>
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={billingData.state}
                  onChange={handleInputChange(setBillingData)}
                  className="mt-2 p-2 border border-gray-300 rounded w-full"
                  placeholder="State or Province"
                  required
                />
                {billingErrors.state && (
                  <p className="text-red-600">{billingErrors.state}</p>
                )}
              </div>
              <div className="mb-4">
                <label
                  htmlFor="zipCode"
                  className="block text-sm font-medium text-gray-700"
                >
                  ZIP/Postal Code
                  <abbr className="text-red-500 ml-1">*</abbr>
                </label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  value={billingData.zipCode}
                  onChange={handleInputChange(setBillingData)}
                  className="mt-2 p-2 border border-gray-300 rounded w-full"
                  placeholder="ZIP or Postal Code"
                  required
                />
                {billingErrors.zipCode && (
                  <p className="text-red-600">{billingErrors.zipCode}</p>
                )}
              </div>
              <div className="mb-4">
                <label
                  htmlFor="country"
                  className="block text-sm font-medium text-gray-700"
                >
                  Country
                  <abbr className="text-red-500 ml-1">*</abbr>
                </label>
                <select
                  id="country"
                  name="country"
                  value={billingData.country}
                  onChange={handleInputChange(setBillingData)}
                  className="mt-2 p-2 border border-gray-300 rounded w-full"
                  required
                >
                  <option value="">Select Country</option>
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="GB">United Kingdom</option>
                  {/* Add other countries as needed */}
                </select>
                {billingErrors.country && (
                  <p className="text-red-600">{billingErrors.country}</p>
                )}
              </div>
            </div>
          </div>

          {/* Account Creation Section */}
          <div className="account-fields">
            <p className="create-account form-row form-row-wide sb-validated mb-2">
              <label className="form-label form-label-for-checkbox checkbox">
                <input
                  className="form-input form-input-checkbox input-checkbox"
                  id="createaccount"
                  type="checkbox"
                  name="createaccount"
                  value="1"
                  checked={createAccount}
                  onChange={handleCreateAccountChange}
                />
                <span className="font-bold ml-2">Create an account?</span>
              </label>
            </p>

            <div
              ref={(el) => (contentRefs.current['createAccount'] = el)}
              className={`create-account overflow-hidden transition-all duration-200 ease-in-out`}
              style={{
                maxHeight: createAccount
                  ? calculateHeight('createAccount')
                  : '0px',
                marginBottom: createAccount ? '1rem' : '0px', // Adjust margin bottom
                opacity: createAccount ? 1 : 0,
              }}
            >
              <p
                className="form-row validate-required"
                id="account-username-field"
                data-priority=""
              >
                <label htmlFor="account-username" className="">
                  Account username&nbsp;
                  <abbr className="text-red-500 ml-1">*</abbr>
                </label>
                <span className="input-wrapper">
                  <input
                    type="text"
                    className="input-text mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    name="account-username"
                    id="account-username"
                    placeholder="Username"
                    value=""
                    aria-required="true"
                    autoComplete="username"
                  />
                </span>
              </p>
              <p
                className="form-row validate-required sb-invalid sb-invalid-required-field"
                id="account-password-field"
                data-priority=""
              >
                <label htmlFor="account-password" className="">
                  Create account password&nbsp;
                  <abbr className="text-red-500 ml-1">*</abbr>
                </label>
                <span className="input-wrapper password-input">
                  <input
                    type="password"
                    className="input-text mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    name="account-password"
                    id="account-password"
                    placeholder="Password"
                    value=""
                    aria-required="true"
                    autoComplete="new-password"
                  />
                  <span className="show-password-input"></span>
                </span>
              </p>
              <div className="clear"></div>
            </div>
          </div>

          {/* Shipping Section */}
          <div className="shipping-fields mb-5">
            <p className="ship-to-different-address form-row form-row-wide sb-validated mb-2">
              <label className="form-label form-label-for-checkbox checkbox">
                <input
                  id="ship-to-different-address-checkbox"
                  className="form-input form-input-checkbox input-checkbox"
                  type="checkbox"
                  name="ship-to-different-address"
                  value="1"
                  checked={shipToDifferentAddress}
                  onChange={handleshipToDifferentAddressChange}
                />
                <span className="font-bold ml-2">
                  Ship to a different address?
                </span>
              </label>
            </p>

            <div
              ref={(el) => (contentRefs.current['shippingAddressSection'] = el)}
              className={`shipping-address overflow-hidden transition-all duration-200 ease-in-out`}
              style={{
                maxHeight: shipToDifferentAddress
                  ? calculateHeight('shippingAddressSection')
                  : '0px',
                opacity: shipToDifferentAddress ? 1 : 0,
              }}
            >
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Shipping Information
              </h2>

              <div className="shipping-fields-field-wrapper space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label
                      htmlFor="shippingFirstName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      First Name
                      <abbr className="text-red-500 ml-1">*</abbr>
                    </label>
                    <input
                      type="text"
                      id="shippingFirstName"
                      name="shippingFirstName"
                      value={shippingData.shippingFirstName}
                      onChange={handleInputChange(setShippingData)}
                      className="mt-2 p-2 border border-gray-300 rounded w-full"
                      placeholder="First name"
                      required
                    />

                    {shippingErrors.shippingFirstName && (
                      <p className="text-red-600">
                        {shippingErrors.shippingFirstName}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="shippingLastName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Last Name
                      <abbr className="text-red-500 ml-1">*</abbr>
                    </label>
                    <input
                      type="text"
                      id="shippingLastName"
                      name="shippingLastName"
                      value={shippingData.shippingLastName}
                      onChange={handleInputChange(setShippingData)}
                      className="mt-2 p-2 border border-gray-300 rounded w-full"
                      placeholder="Last name"
                      required
                    />
                    {shippingErrors.shippingLastName && (
                      <p className="text-red-600">
                        {shippingErrors.shippingLastName}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="shippingCompanyName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Company Name (Optional)
                  </label>
                  <input
                    type="text"
                    id="shippingCompanyName"
                    name="shippingCompanyName"
                    value={shippingData.shippingCompanyName}
                    onChange={handleInputChange(setShippingData)}
                    className="mt-2 p-2 border border-gray-300 rounded w-full"
                    placeholder="Company name"
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="shippingAddress1"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Address Line 1<abbr className="text-red-500 ml-1">*</abbr>
                  </label>
                  <input
                    type="text"
                    id="shippingAddress1"
                    name="shippingAddress1"
                    value={shippingData.shippingAddress1}
                    onChange={handleInputChange(setShippingData)}
                    className="mt-2 p-2 border border-gray-300 rounded w-full"
                    placeholder="Address Line 1"
                    required
                  />
                  {shippingErrors.shippingAddress1 && (
                    <p className="text-red-600">
                      {shippingErrors.shippingAddress1}
                    </p>
                  )}
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="shippingAddress2"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Address Line 2 (Optional)
                  </label>
                  <input
                    type="text"
                    id="shippingAddress2"
                    name="shippingAddress2"
                    value={shippingData.shippingAddress2}
                    onChange={handleInputChange(setShippingData)}
                    className="mt-2 p-2 border border-gray-300 rounded w-full"
                    placeholder="Apartment, suite, unit, etc."
                  />
                </div>
                <div className="mb-4">
                  <div>
                    <label
                      htmlFor="shippingCity"
                      className="block text-sm font-medium text-gray-700"
                    >
                      City
                      <abbr className="text-red-500 ml-1">*</abbr>
                    </label>
                    <input
                      type="text"
                      id="shippingCity"
                      name="shippingCity"
                      value={shippingData.shippingCity}
                      onChange={handleInputChange(setShippingData)}
                      className="mt-2 p-2 border border-gray-300 rounded w-full"
                      placeholder="City"
                      required
                    />
                    {shippingErrors.shippingCity && (
                      <p className="text-red-600">
                        {shippingErrors.shippingCity}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="shippingState"
                    className="block text-sm font-medium text-gray-700"
                  >
                    State/Province
                    <abbr className="text-red-500 ml-1">*</abbr>
                  </label>
                  <input
                    type="text"
                    id="shippingState"
                    name="shippingState"
                    value={shippingData.shippingState}
                    onChange={handleInputChange(setShippingData)}
                    className="mt-2 p-2 border border-gray-300 rounded w-full"
                    placeholder="State or Province"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="shippingZipCode"
                    className="block text-sm font-medium text-gray-700"
                  >
                    ZIP/Postal Code
                    <abbr className="text-red-500 ml-1">*</abbr>
                  </label>
                  <input
                    type="text"
                    id="shippingZipCode"
                    name="shippingZipCode"
                    value={shippingData.shippingZipCode}
                    onChange={handleInputChange(setShippingData)}
                    className="mt-2 p-2 border border-gray-300 rounded w-full"
                    placeholder="ZIP or Postal Code"
                    required
                  />
                  {shippingErrors.shippingZipCode && (
                    <p className="text-red-600">
                      {shippingErrors.shippingZipCode}
                    </p>
                  )}
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="shippingCountry"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Country
                    <abbr className="text-red-500 ml-1">*</abbr>
                  </label>
                  <select
                    id="shippingCountry"
                    name="shippingCountry"
                    value={shippingData.shippingCountry}
                    onChange={handleInputChange(setShippingData)} // Add onChange handler
                    className="mt-2 p-2 border border-gray-300 rounded w-full"
                    required
                  >
                    <option value="">Select Country</option>
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                  {shippingErrors.shippingCountry && (
                    <p className="text-red-600">
                      {shippingErrors.shippingCountry}
                    </p>
                  )}
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="shippingPhone"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Phone Number
                    <abbr className="text-red-500 ml-1">*</abbr>
                  </label>
                  <input
                    type="text"
                    id="shippingPhone"
                    name="shippingPhone"
                    value={shippingData.shippingPhone}
                    onChange={handleInputChange(setShippingData)}
                    className="mt-2 p-2 border border-gray-300 rounded w-full"
                    placeholder="Phone number"
                    required
                  />
                  {shippingErrors.shippingPhone && (
                    <p className="text-red-600">
                      {shippingErrors.shippingPhone}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="block my-4">
            <h3 className="text-xl font-semibold text-gray-900">Note</h3>
            <p className="text-sm text-gray-600">
              Add special instructions for your seller...
            </p>
            <textarea
              className="mt-2 p-3 border border-gray-300 rounded-lg w-full"
              placeholder="Enter special instructions here..."
            ></textarea>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="w-full h-fit lg:w-1/3 bg-white p-6 border rounded-lg">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Order Summary
          </h2>

          {state.items.map((item) => (
            <div key={item.id} className="flex p-2 border-b items-center mb-8">
              {/* Product image and name */}
              <div className="flex items-center mr-4">
                <div className="flex-shrink-0 h-20 w-20 relative">
                  <img
                    className="h-20 w-20 rounded-full"
                    src={item.image}
                    alt={item.name}
                  />
                  <div className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                    {item.quantity}
                  </div>
                </div>
              </div>
              <div className="flex-1 text-sm font-medium text-gray-900">
                {item.name}
              </div>
              {/* Total price */}
              <div className="flex-1 text-right text-sm text-gray-900">
                {formatCurrency(item.price * item.quantity)}
              </div>
            </div>
          ))}

          <div className="coupon flex items-center mb-5 pb-5 border-b">
            <input
              type="text"
              name="couponCode"
              className="input-text p-2 border border-gray-300 rounded w-full"
              id="couponCode"
              placeholder="Coupon code"
              value={couponCode}
              onChange={handleCouponCodeChange}
            />
            <button
              type="submit"
              className="button ml-6"
              name="applyCoupon"
              value="Apply coupon"
            >
              Apply
            </button>
          </div>

          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-400">
                Subtotal
              </span>
              <span className="text-sm font-medium text-gray-900">
                {formatCurrency(subtotal)}
              </span>
            </div>

            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-400">
                Discount
              </span>
              <span className="text-sm font-medium text-gray-900">
                {formatCurrency(discount)}
              </span>
            </div>

            <div className="flex justify-between mb-2 pb-2 border-b">
              <span className="text-sm font-medium text-gray-400">
                Shipping
              </span>
              <span className="text-sm font-medium text-gray-900">
                {formatCurrency(shipping)}
              </span>
            </div>
            <div className="flex justify-between mb-4">
              <span className="text-sm font-bold text-gray-700">Total</span>
              <span className="text-sm font-bold text-gray-900">
                {formatCurrency(total)}
              </span>
            </div>
          </div>

          <div id="payment" className="checkout-payment space-y-4">
            {/* Payment Methods List */}
            <ul className="payment-methods-list space-y-4">
              {paymentMethods.map((method) => {
                const isSelected = selectedPaymentMethod === method.id;
                return (
                  <li key={method.id} className={`payment-method-${method.id}`}>
                    <div className="flex">
                      <input
                        id={`payment-method-${method.id}`}
                        type="radio"
                        className="payment-radio mr-2"
                        name="payment-method"
                        value={method.id}
                        checked={isSelected}
                        onChange={handlePaymentMethodChange}
                      />
                      <label
                        htmlFor={`payment-method-${method.id}`}
                        className="label font-medium text-gray-900"
                      >
                        {method.label}
                      </label>
                    </div>
                    <div
                      ref={(el) => (contentRefs.current[method.id] = el)}
                      className={`overflow-hidden transition-all duration-200 ease-in-out`}
                      style={{
                        maxHeight: isSelected
                          ? calculateHeight(method.id)
                          : '0px',
                        opacity: isSelected ? 1 : 0,
                      }}
                    >
                      <p className="text-sm text-gray-700 mt-2">
                        {method.details}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="terms-and-conditions-wrapper">
              <p className="text-sm text-gray-700 mt-2">
                Your personal data will be used to process your order, support
                your experience throughout this website, and for other purposes
                described in our
                <a
                  href=""
                  className="privacy-policy-link ml-1 text-blue-500 hover:underline"
                  target="_blank"
                >
                  privacy policy
                </a>
                .
              </p>
            </div>
            {/* Terms and Conditions Checkbox */}
            <div className="terms-row validate-required">
              <label className="terms-label flex items-center text-sm">
                <input
                  type="checkbox"
                  id="terms"
                  name="terms"
                  className="mr-1"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                />

                <label htmlFor="terms">
                  I accept the
                  <a
                    href="/terms-and-conditions"
                    className="terms-link text-blue-500 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    terms and conditions
                  </a>
                </label>

                <abbr className="required text-red-600">*</abbr>
              </label>
            </div>
            {/* Error Message */}
            {errorMessage && <p className="text-red-600">{errorMessage}</p>}

            {/* Place Order Button */}
            <div className="place-order-row mt-4">
              <button
                type="submit"
                className="place-order-btn alt bg-blue-500 text-white font-medium py-2 px-6 rounded shadow hover:bg-blue-600"
                name="sb-checkout-place-order"
                id="place-order"
                value="Place order"
                onClick={handlePlaceOrder}
              >
                Place order
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
