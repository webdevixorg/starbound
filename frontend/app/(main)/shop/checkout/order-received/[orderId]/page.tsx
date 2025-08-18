'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { fetchOrder } from '@/services/apiProducts';
import { formatCurrency } from '@/helpers/common';

interface OrderItem {
  id: string;
  quantity: number;
  image_url?: string;
  name: string;
  price: number;
}

interface AddressData {
  firstName: string;
  lastName: string;
  companyName?: string;
  address1: string;
  address2?: string;
  city: string;
  zipCode: string;
  state: string;
  country: string;
  phone: string;
  email: string;
}

interface Order {
  id: number;
  billing_data: AddressData;
  shipping_data?: AddressData;
  order_data: OrderItem[];
  selected_payment_method: string;
  coupon_code?: string | null;
  ship_to_different_address: boolean;
  created_at: string;
}

export default function OrderReceived() {
  const params = useParams();
  const orderId = params?.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError('Order ID not provided');
      setLoading(false);
      return;
    }

    const loadOrder = async () => {
      try {
        const orderData = await fetchOrder(Number(orderId));
        setOrder(orderData);
      } catch (err) {
        setError('Failed to load order details');
        console.error('Error fetching order:', err);
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-600">{error || 'Order not found'}</p>
            <Link
              href="/shop"
              className="mt-4 inline-block bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              Return to Shop
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const orderTotal = order.order_data.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const orderDate = new Date(order.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Order Received!
          </h1>
          <p className="text-gray-600">
            Thank you for your purchase. Your order is being processed.
          </p>
        </div>

        {/* Order Summary Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Order Summary
            </h2>
          </div>
          <div className="px-6 py-4">
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Order Number
                </dt>
                <dd className="mt-1 text-sm text-gray-900">#{order.id}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Date</dt>
                <dd className="mt-1 text-sm text-gray-900">{orderDate}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Total</dt>
                <dd className="mt-1 text-sm font-semibold text-green-600">
                  {formatCurrency(orderTotal)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Payment Method
                </dt>
                <dd className="mt-1 text-sm text-gray-900 capitalize">
                  {order.selected_payment_method}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Order Items</h2>
          </div>
          <div className="px-6 py-4">
            <div className="space-y-4">
              {order.order_data.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatCurrency(item.price)} each
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Addresses */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 mb-8">
          {/* Billing Address */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Billing Address
              </h2>
            </div>
            <div className="px-6 py-4">
              <address className="not-italic text-sm text-gray-900">
                <div className="font-medium">
                  {order.billing_data.firstName} {order.billing_data.lastName}
                </div>
                {order.billing_data.companyName && (
                  <div>{order.billing_data.companyName}</div>
                )}
                <div>{order.billing_data.address1}</div>
                {order.billing_data.address2 && (
                  <div>{order.billing_data.address2}</div>
                )}
                <div>
                  {order.billing_data.city}, {order.billing_data.state}{' '}
                  {order.billing_data.zipCode}
                </div>
                <div>{order.billing_data.country}</div>
                <div className="mt-2">
                  <div>{order.billing_data.phone}</div>
                  <div>{order.billing_data.email}</div>
                </div>
              </address>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Shipping Address
              </h2>
            </div>
            <div className="px-6 py-4">
              {order.ship_to_different_address && order.shipping_data ? (
                <address className="not-italic text-sm text-gray-900">
                  <div className="font-medium">
                    {order.shipping_data.firstName}{' '}
                    {order.shipping_data.lastName}
                  </div>
                  {order.shipping_data.companyName && (
                    <div>{order.shipping_data.companyName}</div>
                  )}
                  <div>{order.shipping_data.address1}</div>
                  {order.shipping_data.address2 && (
                    <div>{order.shipping_data.address2}</div>
                  )}
                  <div>
                    {order.shipping_data.city}, {order.shipping_data.state}{' '}
                    {order.shipping_data.zipCode}
                  </div>
                  <div>{order.shipping_data.country}</div>
                </address>
              ) : (
                <p className="text-sm text-gray-500">Same as billing address</p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => window.print()}
            className="px-6 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-gray-700 hover:bg-gray-50 font-medium"
          >
            Print Order
          </button>
          <Link
            href="/profile/orders"
            className="px-6 py-3 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 font-medium text-center"
          >
            View All Orders
          </Link>
          <Link
            href="/shop"
            className="px-6 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-gray-700 hover:bg-gray-50 font-medium text-center"
          >
            Continue Shopping
          </Link>
        </div>

        {/* Contact Info */}
        <div className="text-center mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Questions about your order? Contact us at{' '}
            <a
              href="mailto:support@starbound.com"
              className="text-indigo-600 hover:underline"
            >
              support@starbound.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
