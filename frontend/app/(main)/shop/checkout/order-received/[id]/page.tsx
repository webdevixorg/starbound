'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/helpers/common';
import { useCart } from '@/context/CartContext';
import { createOrder } from '@/services/apiProducts';
import BreadcrumbsComponent from '@/components/Common/Breadcrumbs';
import { countries } from '@/modules/country';

const CheckoutPage: React.FC = () => {
  const router = useRouter();
  const { state, dispatch } = useCart();
  const [isClient, setIsClient] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Prevent hydration mismatch by ensuring client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

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

  const subtotal = state.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = 10.0;
  const total = subtotal + shipping;

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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setBillingData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!termsAccepted) {
      setErrorMessage(
        'Please accept the terms and conditions before placing the order.'
      );
      return;
    }

    if (!validateBillingData()) {
      setErrorMessage('Please fill out all required billing information.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const orderItems = state.items.map((item) => ({
        id: item.id.toString(),
        quantity: item.quantity,
      }));

      const transactionData = {
        billing_data: billingData,
        order_data: orderItems,
        selected_payment_method: 'bank',
      };

      const result = await createOrder(transactionData);

      // Clear cart
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cart');
      }
      dispatch({ type: 'CLEAR_CART', payload: {} });

      // Navigate to success page
      router.push(`/shop/checkout/order-received/${result.id}`);
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage(
        error instanceof Error ? error.message : 'An error occurred'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading skeleton until client-side hydration
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

  // Redirect if cart is empty
  if (state.items.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Your cart is empty
          </h1>
          <p className="text-gray-600 mb-6">
            Add some items to your cart before proceeding to checkout.
          </p>
          <button
            onClick={() => router.push('/shop')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mx-auto mt-6">
        <BreadcrumbsComponent />
      </div>

      <div className="mx-auto mt-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Checkout</h1>
      </div>

      <form onSubmit={handlePlaceOrder}>
        <div className="flex flex-wrap lg:flex-nowrap gap-8">
          {/* Billing Information */}
          <div className="w-full lg:w-2/3 bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Billing Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700"
                >
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={billingData.firstName}
                  onChange={handleInputChange}
                  className="mt-2 p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={billingData.lastName}
                  onChange={handleInputChange}
                  className="mt-2 p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={billingData.email}
                onChange={handleInputChange}
                className="mt-2 p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={billingData.phone}
                onChange={handleInputChange}
                className="mt-2 p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                htmlFor="address1"
                className="block text-sm font-medium text-gray-700"
              >
                Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="address1"
                name="address1"
                value={billingData.address1}
                onChange={handleInputChange}
                className="mt-2 p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Street address"
                required
              />
              {billingErrors.address1 && (
                <p className="text-red-600 text-sm mt-1">
                  {billingErrors.address1}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label
                  htmlFor="city"
                  className="block text-sm font-medium text-gray-700"
                >
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={billingData.city}
                  onChange={handleInputChange}
                  className="mt-2 p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={billingData.state}
                  onChange={handleInputChange}
                  className="mt-2 p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="State"
                  required
                />
                {billingErrors.state && (
                  <p className="text-red-600 text-sm mt-1">
                    {billingErrors.state}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="zipCode"
                  className="block text-sm font-medium text-gray-700"
                >
                  ZIP Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  value={billingData.zipCode}
                  onChange={handleInputChange}
                  className="mt-2 p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ZIP Code"
                  required
                />
                {billingErrors.zipCode && (
                  <p className="text-red-600 text-sm mt-1">
                    {billingErrors.zipCode}
                  </p>
                )}
              </div>
            </div>

            <div className="mb-6">
              <label
                htmlFor="country"
                className="block text-sm font-medium text-gray-700"
              >
                Country <span className="text-red-500">*</span>
              </label>
              <select
                id="country"
                name="country"
                value={billingData.country}
                onChange={handleInputChange}
                className="mt-2 p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

          {/* Order Summary */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white p-6 rounded-lg shadow-sm border sticky top-4">
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

              {/* Order Totals */}
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {formatCurrency(shipping)}
                  </span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="mb-4">
                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    id="terms"
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
                    <span className="text-red-500">*</span>
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
                disabled={!termsAccepted || isLoading}
                className="w-full bg-blue-600 text-white font-medium py-3 px-6 rounded-lg shadow hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading
                  ? 'Processing...'
                  : `Place Order - ${formatCurrency(total)}`}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
