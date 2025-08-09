'use client';

import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/Common/Loading';
import ModalAlert from '@/components/Modals/ModalAlert';
import Image from 'next/image';

interface OrderItem {
  id: string | number;
  image_url?: string;
  name: string;
  price: number;
  quantity: number;
  destination?: string;
  date?: string;
  duration?: string;
}

interface BillingData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface ShippingData {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface Order {
  id: number;
  customer: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled';
  selected_payment_method: string;
  total: number;
  delivery: string;
  items: number;
  fulfillment:
    | 'pending'
    | 'confirmed'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled';
  created_at: string;
  updated_at?: string;
  order_data: OrderItem[];
  billing_data: BillingData;
  shipping_data?: ShippingData;
  ship_to_different_address: boolean;
  order_number?: string;
  tracking_number?: string;
  estimated_delivery?: string;
  notes?: string;
}

interface OrdersState {
  loading: boolean;
  orders: Order[];
  filteredOrders: Order[];
  expandedOrderId: number | null;
  error: string | null;
  showErrorModal: boolean;
  isClient: boolean;
  sortBy: 'newest' | 'oldest' | 'total-high' | 'total-low' | 'status';
  filterBy: 'all' | 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  searchQuery: string;
  cancellingOrder: number | null;
}

const STATUS_CONFIG = {
  payment: {
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    paid: { label: 'Paid', color: 'bg-green-100 text-green-800' },
    failed: { label: 'Failed', color: 'bg-red-100 text-red-800' },
    refunded: { label: 'Refunded', color: 'bg-gray-100 text-gray-800' },
    cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-800' },
  },
  fulfillment: {
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
    processing: { label: 'Processing', color: 'bg-purple-100 text-purple-800' },
    shipped: { label: 'Shipped', color: 'bg-indigo-100 text-indigo-800' },
    delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800' },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
  },
} as const;

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'total-high', label: 'Highest Total' },
  { value: 'total-low', label: 'Lowest Total' },
  { value: 'status', label: 'Status' },
] as const;

const FILTER_OPTIONS = [
  { value: 'all', label: 'All Orders' },
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
] as const;

// Mock data for development
const MOCK_ORDERS: Order[] = [
  {
    id: 1001,
    customer: 'John Doe',
    payment_status: 'paid',
    selected_payment_method: 'Credit Card',
    total: 2847.5,
    delivery: 'Standard',
    items: 2,
    fulfillment: 'confirmed',
    created_at: '2024-01-15T10:30:00Z',
    order_number: 'ORD-2024-001001',
    tracking_number: 'TRK123456789',
    estimated_delivery: '2024-01-25',
    ship_to_different_address: false,
    order_data: [
      {
        id: 1,
        name: 'Santorini Adventure Package',
        price: 1299.0,
        quantity: 1,
        image_url: '/destinations/santorini.jpg',
        destination: 'Santorini, Greece',
        date: '2024-02-15',
        duration: '7 days',
      },
      {
        id: 2,
        name: 'Bali Cultural Experience',
        price: 1548.5,
        quantity: 1,
        image_url: '/destinations/bali.jpg',
        destination: 'Bali, Indonesia',
        date: '2024-03-01',
        duration: '10 days',
      },
    ],
    billing_data: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1-555-123-4567',
      address1: '123 Main Street',
      address2: 'Apt 4B',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'United States',
    },
  },
  {
    id: 1002,
    customer: 'Jane Smith',
    payment_status: 'pending',
    selected_payment_method: 'PayPal',
    total: 3240.0,
    delivery: 'Express',
    items: 1,
    fulfillment: 'pending',
    created_at: '2024-01-20T14:15:00Z',
    order_number: 'ORD-2024-001002',
    estimated_delivery: '2024-01-28',
    ship_to_different_address: true,
    order_data: [
      {
        id: 3,
        name: 'Tokyo Premium Tour',
        price: 3240.0,
        quantity: 1,
        image_url: '/destinations/tokyo.jpg',
        destination: 'Tokyo, Japan',
        date: '2024-04-10',
        duration: '14 days',
      },
    ],
    billing_data: {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      phone: '+1-555-987-6543',
      address1: '456 Oak Avenue',
      city: 'Los Angeles',
      state: 'CA',
      postalCode: '90210',
      country: 'United States',
    },
    shipping_data: {
      firstName: 'Jane',
      lastName: 'Smith',
      address1: '789 Pine Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      country: 'United States',
    },
  },
];

export default function OrdersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const contentRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const [state, setState] = useState<OrdersState>({
    loading: true,
    orders: [],
    filteredOrders: [],
    expandedOrderId: null,
    error: null,
    showErrorModal: false,
    isClient: false,
    sortBy: 'newest',
    filterBy: 'all',
    searchQuery: '',
    cancellingOrder: null,
  });

  // Ensure client-side rendering
  useEffect(() => {
    setState((prev) => ({ ...prev, isClient: true }));
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (state.isClient && !user) {
      router.push('/auth/login');
    }
  }, [user, router, state.isClient]);

  // Load orders
  const loadOrders = useCallback(async () => {
    if (!state.isClient || !user) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // TODO: Replace with actual API call
      // For now, using mock data
      const orders = MOCK_ORDERS;

      // Uncomment when API is ready:
      // const response = await fetch('/api/orders', {
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json',
      //   },
      // });

      // if (!response.ok) {
      //   throw new Error('Failed to fetch orders');
      // }

      // const data = await response.json();
      // const orders = data.results || data;

      setState((prev) => ({
        ...prev,
        orders,
        loading: false,
      }));
    } catch (error) {
      console.error('Error loading orders:', error);
      setState((prev) => ({
        ...prev,
        error: 'Failed to load your orders. Please try again.',
        showErrorModal: true,
        loading: false,
      }));
    }
  }, [state.isClient, user]);

  // Initial load
  useEffect(() => {
    if (state.isClient && user) {
      loadOrders();
    }
  }, [loadOrders, state.isClient, user]);

  // Filter and sort orders
  useEffect(() => {
    let filtered = state.orders;

    // Apply search filter
    if (state.searchQuery) {
      filtered = filtered.filter(
        (order) =>
          order.order_number
            ?.toLowerCase()
            .includes(state.searchQuery.toLowerCase()) ||
          order.id.toString().includes(state.searchQuery) ||
          order.customer
            .toLowerCase()
            .includes(state.searchQuery.toLowerCase()) ||
          order.order_data.some((item) =>
            item.name.toLowerCase().includes(state.searchQuery.toLowerCase())
          )
      );
    }

    // Apply status filter
    if (state.filterBy !== 'all') {
      filtered = filtered.filter((order) => {
        switch (state.filterBy) {
          case 'pending':
            return (
              order.payment_status === 'pending' ||
              order.fulfillment === 'pending'
            );
          case 'paid':
            return order.payment_status === 'paid';
          case 'shipped':
            return order.fulfillment === 'shipped';
          case 'delivered':
            return order.fulfillment === 'delivered';
          case 'cancelled':
            return (
              order.payment_status === 'cancelled' ||
              order.fulfillment === 'cancelled'
            );
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (state.sortBy) {
        case 'oldest':
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        case 'total-high':
          return b.total - a.total;
        case 'total-low':
          return a.total - b.total;
        case 'status':
          return a.fulfillment.localeCompare(b.fulfillment);
        case 'newest':
        default:
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
      }
    });

    setState((prev) => ({ ...prev, filteredOrders: filtered }));
  }, [state.orders, state.searchQuery, state.filterBy, state.sortBy]);

  // Handle order expansion
  const toggleExpanded = useCallback((orderId: number) => {
    setState((prev) => ({
      ...prev,
      expandedOrderId: prev.expandedOrderId === orderId ? null : orderId,
    }));
  }, []);

  const calculateHeight = useCallback((id: string) => {
    const element = contentRefs.current[id];
    return element ? `${element.scrollHeight}px` : '0px';
  }, []);

  // Handle search and filters
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setState((prev) => ({ ...prev, searchQuery: e.target.value }));
    },
    []
  );

  const handleSortChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setState((prev) => ({ ...prev, sortBy: e.target.value as any }));
    },
    []
  );

  const handleFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setState((prev) => ({ ...prev, filterBy: e.target.value as any }));
    },
    []
  );

  // Handle order cancellation
  const handleCancelOrder = useCallback(async (orderId: number) => {
    const confirmed = window.confirm(
      'Are you sure you want to cancel this order? This action may not be reversible depending on the order status.'
    );

    if (!confirmed) return;

    setState((prev) => ({ ...prev, cancellingOrder: orderId }));

    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

      setState((prev) => ({
        ...prev,
        orders: prev.orders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                fulfillment: 'cancelled' as const,
                payment_status: 'cancelled' as const,
              }
            : order
        ),
        cancellingOrder: null,
      }));
    } catch (error) {
      console.error('Error cancelling order:', error);
      setState((prev) => ({
        ...prev,
        error: 'Failed to cancel order. Please contact support.',
        showErrorModal: true,
        cancellingOrder: null,
      }));
    }
  }, []);

  // Utility functions
  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }, []);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, []);

  const getStatusConfig = useCallback(
    (type: 'payment' | 'fulfillment', status: string) => {
      return (
        STATUS_CONFIG[type][
          status as keyof (typeof STATUS_CONFIG)[typeof type]
        ] || { label: status, color: 'bg-gray-100 text-gray-800' }
      );
    },
    []
  );

  // Loading skeleton for SSR compatibility
  if (!state.isClient) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b border-gray-200">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-4 border-b border-gray-200">
                  <div className="flex space-x-4">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (state.loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
              <p className="mt-1 text-sm text-gray-600">
                {state.filteredOrders.length} order
                {state.filteredOrders.length !== 1 ? 's' : ''} found
              </p>
            </div>

            <button
              onClick={() => router.push('/profile')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Profile
            </button>
          </div>
        </div>

        {state.orders.length > 0 && (
          /* Controls */
          <div className="bg-white rounded-lg shadow mb-6 p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              {/* Search */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={state.searchQuery}
                    onChange={handleSearchChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* Filter */}
                <select
                  value={state.filterBy}
                  onChange={handleFilterChange}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {FILTER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                {/* Sort */}
                <select
                  value={state.sortBy}
                  onChange={handleSortChange}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {state.filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {state.searchQuery ? 'No orders found' : 'No orders yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {state.searchQuery
                ? `No orders match "${state.searchQuery}". Try a different search term.`
                : 'Start planning your next adventure!'}
            </p>
            {!state.searchQuery && (
              <button
                onClick={() => router.push('/destinations')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                Explore Destinations
              </button>
            )}
          </div>
        ) : (
          /* Orders Table */
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {state.filteredOrders.map((order) => (
                    <React.Fragment key={order.id}>
                      <tr
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => toggleExpanded(order.id)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {order.order_number || `#${order.id}`}
                              </div>
                              <div className="text-sm text-gray-500">
                                {order.items} item{order.items !== 1 ? 's' : ''}
                              </div>
                            </div>
                            <div className="ml-4">
                              <svg
                                className={`w-5 h-5 text-gray-400 transition-transform ${
                                  state.expandedOrderId === order.id
                                    ? 'rotate-180'
                                    : ''
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(order.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {order.customer}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.billing_data.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              getStatusConfig('payment', order.payment_status)
                                .color
                            }`}
                          >
                            {
                              getStatusConfig('payment', order.payment_status)
                                .label
                            }
                          </span>
                          <div className="text-xs text-gray-500 mt-1">
                            {order.selected_payment_method}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(order.total)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              getStatusConfig('fulfillment', order.fulfillment)
                                .color
                            }`}
                          >
                            {
                              getStatusConfig('fulfillment', order.fulfillment)
                                .label
                            }
                          </span>
                          {order.tracking_number && (
                            <div className="text-xs text-gray-500 mt-1">
                              Track: {order.tracking_number}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {(order.fulfillment === 'pending' ||
                            order.fulfillment === 'confirmed') && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancelOrder(order.id);
                              }}
                              disabled={state.cancellingOrder === order.id}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            >
                              {state.cancellingOrder === order.id
                                ? 'Cancelling...'
                                : 'Cancel'}
                            </button>
                          )}
                        </td>
                      </tr>

                      {/* Expanded Details */}
                      <tr>
                        <td colSpan={7} className="px-0 py-0">
                          <div
                            ref={(el) => {
                              contentRefs.current[`order-${order.id}`] = el;
                            }}
                            className="overflow-hidden transition-all duration-300 ease-in-out"
                            style={{
                              maxHeight:
                                state.expandedOrderId === order.id
                                  ? calculateHeight(`order-${order.id}`)
                                  : '0px',
                              opacity:
                                state.expandedOrderId === order.id ? 1 : 0,
                            }}
                          >
                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                              {/* Order Items */}
                              <div className="mb-6">
                                <h4 className="text-lg font-medium text-gray-900 mb-4">
                                  Order Items
                                </h4>
                                <div className="space-y-4">
                                  {order.order_data.map((item, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center space-x-4 bg-white p-4 rounded-lg"
                                    >
                                      <div className="flex-shrink-0">
                                        {item.image_url ? (
                                          <Image
                                            src={item.image_url}
                                            alt={item.name}
                                            width={80}
                                            height={60}
                                            className="w-20 h-15 object-cover rounded-lg"
                                          />
                                        ) : (
                                          <div className="w-20 h-15 bg-gray-200 rounded-lg flex items-center justify-center">
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
                                        )}
                                      </div>

                                      <div className="flex-1">
                                        <h5 className="text-sm font-medium text-gray-900">
                                          {item.name}
                                        </h5>
                                        {item.destination && (
                                          <p className="text-sm text-gray-600">
                                            {item.destination}
                                          </p>
                                        )}
                                        {item.date && (
                                          <p className="text-sm text-gray-500">
                                            Travel Date: {formatDate(item.date)}
                                            {item.duration &&
                                              ` • Duration: ${item.duration}`}
                                          </p>
                                        )}
                                        <div className="flex items-center justify-between mt-2">
                                          <span className="text-sm text-gray-500">
                                            Quantity: {item.quantity} ×{' '}
                                            {formatCurrency(item.price)}
                                          </span>
                                          <span className="text-sm font-medium text-gray-900">
                                            {formatCurrency(
                                              item.price * item.quantity
                                            )}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Billing Information */}
                                <div className="bg-white p-4 rounded-lg">
                                  <h4 className="text-lg font-medium text-gray-900 mb-3">
                                    Billing Information
                                  </h4>
                                  <div className="space-y-2 text-sm">
                                    <p className="font-medium">
                                      {order.billing_data.firstName}{' '}
                                      {order.billing_data.lastName}
                                    </p>
                                    <p className="text-gray-600">
                                      {order.billing_data.email}
                                    </p>
                                    <p className="text-gray-600">
                                      {order.billing_data.phone}
                                    </p>
                                    <div className="pt-2 border-t border-gray-200">
                                      <p className="text-gray-600">
                                        {order.billing_data.address1}
                                      </p>
                                      {order.billing_data.address2 && (
                                        <p className="text-gray-600">
                                          {order.billing_data.address2}
                                        </p>
                                      )}
                                      <p className="text-gray-600">
                                        {order.billing_data.city},{' '}
                                        {order.billing_data.state}{' '}
                                        {order.billing_data.postalCode}
                                      </p>
                                      <p className="text-gray-600">
                                        {order.billing_data.country}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* Shipping Information */}
                                {order.ship_to_different_address &&
                                order.shipping_data ? (
                                  <div className="bg-white p-4 rounded-lg">
                                    <h4 className="text-lg font-medium text-gray-900 mb-3">
                                      Shipping Information
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                      <p className="font-medium">
                                        {order.shipping_data.firstName}{' '}
                                        {order.shipping_data.lastName}
                                      </p>
                                      {order.shipping_data.email && (
                                        <p className="text-gray-600">
                                          {order.shipping_data.email}
                                        </p>
                                      )}
                                      {order.shipping_data.phone && (
                                        <p className="text-gray-600">
                                          {order.shipping_data.phone}
                                        </p>
                                      )}
                                      <div className="pt-2 border-t border-gray-200">
                                        <p className="text-gray-600">
                                          {order.shipping_data.address1}
                                        </p>
                                        {order.shipping_data.address2 && (
                                          <p className="text-gray-600">
                                            {order.shipping_data.address2}
                                          </p>
                                        )}
                                        <p className="text-gray-600">
                                          {order.shipping_data.city},{' '}
                                          {order.shipping_data.state}{' '}
                                          {order.shipping_data.zipCode}
                                        </p>
                                        <p className="text-gray-600">
                                          {order.shipping_data.country}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="bg-white p-4 rounded-lg">
                                    <h4 className="text-lg font-medium text-gray-900 mb-3">
                                      Delivery Information
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                      <p className="text-gray-600">
                                        <span className="font-medium">
                                          Delivery Method:
                                        </span>{' '}
                                        {order.delivery}
                                      </p>
                                      {order.estimated_delivery && (
                                        <p className="text-gray-600">
                                          <span className="font-medium">
                                            Estimated Delivery:
                                          </span>{' '}
                                          {formatDate(order.estimated_delivery)}
                                        </p>
                                      )}
                                      {order.tracking_number && (
                                        <p className="text-gray-600">
                                          <span className="font-medium">
                                            Tracking Number:
                                          </span>{' '}
                                          {order.tracking_number}
                                        </p>
                                      )}
                                      <p className="text-gray-600">
                                        <em>Same as billing address</em>
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {order.notes && (
                                <div className="mt-6 bg-white p-4 rounded-lg">
                                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                                    Order Notes
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    {order.notes}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Error Modal */}
      <ModalAlert
        isOpen={state.showErrorModal}
        title="Error"
        message={state.error || 'An unexpected error occurred.'}
        onClose={() =>
          setState((prev) => ({ ...prev, showErrorModal: false, error: null }))
        }
        onConfirm={() =>
          setState((prev) => ({ ...prev, showErrorModal: false, error: null }))
        }
        confirmText="OK"
        cancelText=""
      />
    </div>
  );
}
