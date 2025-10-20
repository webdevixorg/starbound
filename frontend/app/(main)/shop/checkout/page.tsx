'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/helpers/common';
import { useCart } from '@/context/CartContext';
import { createOrder } from '@/services/apiProducts';
import BreadcrumbsComponent from '@/components/Common/Breadcrumbs';
import { countries } from '@/modules/country';

const CheckoutPage: React.FC = () => {
  const router = useRouter();
  const contentRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const { state, dispatch } = useCart();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [createAccount, setCreateAccount] = useState<boolean>(false);
  const [shipToDifferentAddress, setShipToDifferentAddress] =
    useState<boolean>(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>('bank');
  const [couponCode, setCouponCode] = useState('');
  const [isClient, setIsClient] = useState(false);

  // Ensure we're on the client side to prevent hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);

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

    setShippingErrors(newShippingErrors);
    return isValid;
  };

  const [subtotal, setSubtotal] = useState(0.0);
  const [discount, setDiscount] = useState(0.0);
  const [shipping] = useState(10.0);
  const [total, setTotal] = useState(0.0);

  useEffect(() => {
    const calculateSubtotal = () => {
      const cartSubtotal = state.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      setSubtotal(cartSubtotal);
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
  }, [state.items, subtotal, shipping, discount]);

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

    const orderItems = state.items.map((item) => ({
      id: item.id.toString(),
      quantity: item.quantity,
    }));

    const transactionData = {
      billing_data: billingData,
      ...(shipToDifferentAddress && { shippingData }),
      order_data: orderItems,
      selected_payment_method: selectedPaymentMethod,
      shipToDifferentAddress,
      ...(couponCode && { couponCode }),
    };

    try {
      const result = await createOrder(transactionData);
      console.log('Order placed successfully! Order ID: ' + result.order_id);

      // Clear the cart from localStorage (client-side only)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cart');
      }

      // Clear cart from context
      dispatch({ type: 'CLEAR_CART', payload: {} });

      // Navigate to the OrderReceived page using Next.js router
      router.push(`/shop/checkout/order-received/${result.id}`);
    } catch (error) {
      console.error('Error:', error);
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('An unknown error occurred.');
      }
    }
  };

  // Don't render until we're on the client (prevents hydration mismatch)
  if (!isClient) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="flex flex-wrap lg:flex-nowrap gap-8">
            <div className="w-full lg:w-2/3 space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
            <div className="w-full lg:w-1/3">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
        {/* Left Column: Billing & Shipping Information */}
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
                    First Name <abbr className="text-red-500 ml-1">*</abbr>
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={billingData.firstName}
                    onChange={handleInputChange(setBillingData)}
                    className="mt-2 p-2 border border-gray-300 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="First name"
                    required
                  />
                  {billingErrors.firstName && (
                    <p className="text-red-600 text-sm mt-1">
                      {billingErrors.firstName}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Last Name <abbr className="text-red-500 ml-1">*</abbr>
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={billingData.lastName}
                    onChange={handleInputChange(setBillingData)}
                    className="mt-2 p-2 border border-gray-300 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Last name"
                    required
                  />
                  {billingErrors.lastName && (
                    <p className="text-red-600 text-sm mt-1">
                      {billingErrors.lastName}
                    </p>
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
                  className="mt-2 p-2 border border-gray-300 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Email address"
                  required
                />
                {billingErrors.email && (
                  <p className="text-red-600 text-sm mt-1">
                    {billingErrors.email}
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Phone Number <abbr className="text-red-500 ml-1">*</abbr>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={billingData.phone}
                  onChange={handleInputChange(setBillingData)}
                  className="mt-2 p-2 border border-gray-300 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Phone number"
                  required
                />
                {billingErrors.phone && (
                  <p className="text-red-600 text-sm mt-1">
                    {billingErrors.phone}
                  </p>
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
                  className="mt-2 p-2 border border-gray-300 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Company name"
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="address1"
                  className="block text-sm font-medium text-gray-700"
                >
                  Address Line 1 <abbr className="text-red-500 ml-1">*</abbr>
                </label>
                <input
                  type="text"
                  id="address1"
                  name="address1"
                  value={billingData.address1}
                  onChange={handleInputChange(setBillingData)}
                  className="mt-2 p-2 border border-gray-300 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Address Line 1"
                  required
                />
                {billingErrors.address1 && (
                  <p className="text-red-600 text-sm mt-1">
                    {billingErrors.address1}
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label
                  htmlFor="address2"
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
                  className="mt-2 p-2 border border-gray-300 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Apartment, suite, unit, etc."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label
                    htmlFor="city"
                    className="block text-sm font-medium text-gray-700"
                  >
                    City <abbr className="text-red-500 ml-1">*</abbr>
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={billingData.city}
                    onChange={handleInputChange(setBillingData)}
                    className="mt-2 p-2 border border-gray-300 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="City"
                    required
                  />
                  {billingErrors.city && (
                    <p className="text-red-600 text-sm mt-1">
                      {billingErrors.city}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="state"
                    className="block text-sm font-medium text-gray-700"
                  >
                    State/Province <abbr className="text-red-500 ml-1">*</abbr>
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={billingData.state}
                    onChange={handleInputChange(setBillingData)}
                    className="mt-2 p-2 border border-gray-300 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="State or Province"
                    required
                  />
                  {billingErrors.state && (
                    <p className="text-red-600 text-sm mt-1">
                      {billingErrors.state}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label
                    htmlFor="zipCode"
                    className="block text-sm font-medium text-gray-700"
                  >
                    ZIP/Postal Code <abbr className="text-red-500 ml-1">*</abbr>
                  </label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    value={billingData.zipCode}
                    onChange={handleInputChange(setBillingData)}
                    className="mt-2 p-2 border border-gray-300 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="ZIP or Postal Code"
                    required
                  />
                  {billingErrors.zipCode && (
                    <p className="text-red-600 text-sm mt-1">
                      {billingErrors.zipCode}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="country"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Country <abbr className="text-red-500 ml-1">*</abbr>
                  </label>
                  <select
                    id="country"
                    name="country"
                    value={billingData.country}
                    onChange={handleInputChange(setBillingData)}
                    className="mt-2 p-2 border border-gray-300 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Country</option>
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                  {billingErrors.country && (
                    <p className="text-red-600 text-sm mt-1">
                      {billingErrors.country}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Account Creation Section */}
          <div className="account-fields mb-6">
            <div className="flex items-center mb-4">
              <input
                className="mr-2"
                id="createaccount"
                type="checkbox"
                name="createaccount"
                checked={createAccount}
                onChange={handleCreateAccountChange}
              />
              <label
                htmlFor="createaccount"
                className="text-sm font-medium text-gray-700"
              >
                Create an account?
              </label>
            </div>

            <div
              ref={(el) => {
                contentRefs.current['createAccount'] = el;
              }}
              className="overflow-hidden transition-all duration-200 ease-in-out"
              style={{
                maxHeight: createAccount
                  ? calculateHeight('createAccount')
                  : '0px',
                opacity: createAccount ? 1 : 0,
              }}
            >
              <div className="space-y-4 p-4 bg-gray-50 rounded">
                <div>
                  <label
                    htmlFor="account-username"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Account username{' '}
                    <abbr className="text-red-500 ml-1">*</abbr>
                  </label>
                  <input
                    type="text"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    name="account-username"
                    id="account-username"
                    placeholder="Username"
                    autoComplete="username"
                  />
                </div>
                <div>
                  <label
                    htmlFor="account-password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Create account password{' '}
                    <abbr className="text-red-500 ml-1">*</abbr>
                  </label>
                  <input
                    type="password"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    name="account-password"
                    id="account-password"
                    placeholder="Password"
                    autoComplete="new-password"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Section */}
          <div className="shipping-fields mb-6">
            <div className="flex items-center mb-4">
              <input
                id="ship-to-different-address-checkbox"
                type="checkbox"
                name="ship-to-different-address"
                checked={shipToDifferentAddress}
                onChange={handleshipToDifferentAddressChange}
                className="mr-2"
              />
              <label
                htmlFor="ship-to-different-address-checkbox"
                className="text-sm font-medium text-gray-700"
              >
                Ship to a different address?
              </label>
            </div>

            <div
              ref={(el) => {
                contentRefs.current['shippingAddressSection'] = el;
              }}
              className="overflow-hidden transition-all duration-200 ease-in-out"
              style={{
                maxHeight: shipToDifferentAddress
                  ? calculateHeight('shippingAddressSection')
                  : '0px',
                opacity: shipToDifferentAddress ? 1 : 0,
              }}
            >
              <div className="p-4 bg-gray-50 rounded space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Shipping Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="shippingFirstName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      First Name <abbr className="text-red-500 ml-1">*</abbr>
                    </label>
                    <input
                      type="text"
                      id="shippingFirstName"
                      name="shippingFirstName"
                      value={shippingData.shippingFirstName}
                      onChange={handleInputChange(setShippingData)}
                      className="mt-2 p-2 border border-gray-300 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="First name"
                      required
                    />
                    {shippingErrors.shippingFirstName && (
                      <p className="text-red-600 text-sm mt-1">
                        {shippingErrors.shippingFirstName}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="shippingLastName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Last Name <abbr className="text-red-500 ml-1">*</abbr>
                    </label>
                    <input
                      type="text"
                      id="shippingLastName"
                      name="shippingLastName"
                      value={shippingData.shippingLastName}
                      onChange={handleInputChange(setShippingData)}
                      className="mt-2 p-2 border border-gray-300 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Last name"
                      required
                    />
                    {shippingErrors.shippingLastName && (
                      <p className="text-red-600 text-sm mt-1">
                        {shippingErrors.shippingLastName}
                      </p>
                    )}
                  </div>
                </div>

                {/* Add remaining shipping fields with similar pattern */}
                <div>
                  <label
                    htmlFor="shippingAddress1"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Address Line 1 <abbr className="text-red-500 ml-1">*</abbr>
                  </label>
                  <input
                    type="text"
                    id="shippingAddress1"
                    name="shippingAddress1"
                    value={shippingData.shippingAddress1}
                    onChange={handleInputChange(setShippingData)}
                    className="mt-2 p-2 border border-gray-300 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Address Line 1"
                    required
                  />
                  {shippingErrors.shippingAddress1 && (
                    <p className="text-red-600 text-sm mt-1">
                      {shippingErrors.shippingAddress1}
                    </p>
                  )}
                </div>

                {/* Continue with other shipping fields... */}
              </div>
            </div>
          </div>

          {/* Order Notes */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Order Notes
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              Add special instructions for your seller...
            </p>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              placeholder="Enter special instructions here..."
            />
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="w-full lg:w-1/3 h-fit">
          <div className="bg-white p-6 border rounded-lg sticky top-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Order Summary
            </h2>

            {/* Cart Items */}
            <div className="space-y-4 mb-6">
              {state.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center space-x-3 pb-4 border-b"
                >
                  <div className="relative">
                    <img
                      className="h-12 w-12 rounded object-cover"
                      src={item.image}
                      alt={item.name}
                    />
                    <span className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.name}
                    </p>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon Code */}
            <div className="mb-6">
              <div className="flex space-x-2">
                <input
                  type="text"
                  name="couponCode"
                  className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Coupon code"
                  value={couponCode}
                  onChange={handleCouponCodeChange}
                />
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Order Totals */}
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Discount</span>
                <span className="font-medium">-{formatCurrency(discount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">{formatCurrency(shipping)}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="space-y-4 mb-6">
              <h3 className="font-medium text-gray-900">Payment Method</h3>
              {paymentMethods.map((method) => {
                const isSelected = selectedPaymentMethod === method.id;
                return (
                  <div key={method.id} className="space-y-2">
                    <div className="flex items-center">
                      <input
                        id={`payment-method-${method.id}`}
                        type="radio"
                        className="mr-2"
                        name="payment-method"
                        value={method.id}
                        checked={isSelected}
                        onChange={handlePaymentMethodChange}
                      />
                      <label
                        htmlFor={`payment-method-${method.id}`}
                        className="text-sm font-medium"
                      >
                        {method.label}
                      </label>
                    </div>
                    <div
                      ref={(el) => {
                        contentRefs.current[method.id] = el;
                      }}
                      className="overflow-hidden transition-all duration-200 ease-in-out"
                      style={{
                        maxHeight: isSelected
                          ? calculateHeight(method.id)
                          : '0px',
                        opacity: isSelected ? 1 : 0,
                      }}
                    >
                      <p className="text-xs text-gray-600 ml-6 p-2 bg-gray-50 rounded">
                        {method.details}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Privacy Policy */}
            <div className="mb-4">
              <p className="text-xs text-gray-600">
                Your personal data will be used to process your order, support
                your experience throughout this website, and for other purposes
                described in our{' '}
                <a
                  href="/privacy-policy"
                  className="text-blue-500 hover:underline"
                >
                  privacy policy
                </a>
                .
              </p>
            </div>

            {/* Terms and Conditions */}
            <div className="mb-4">
              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="terms"
                  name="terms"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-1"
                />
                <label htmlFor="terms" className="text-xs text-gray-600">
                  I accept the{' '}
                  <a
                    href="/terms-and-conditions"
                    className="text-blue-500 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    terms and conditions
                  </a>{' '}
                  <abbr className="text-red-500">*</abbr>
                </label>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                {errorMessage}
              </div>
            )}

            {/* Place Order Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-medium py-3 px-6 rounded-lg shadow hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handlePlaceOrder}
              disabled={!termsAccepted}
            >
              Place Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
