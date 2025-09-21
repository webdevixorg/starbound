'use client';

import React, { useEffect, useState, useCallback, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  fetchUserOrders,
  updateOrderFulfillment,
  bulkUpdateOrderStatus,
} from '@/services/apiProducts';
import LoadingSpinner from '@/components/Common/Loading';
import ModalAlert from '@/components/Modals/ModalAlert';
import SafeImage from '@/components/UI/SafeImage';
import { getPublicImageUrl } from '@/helpers/media';

interface OrderItem {
  id: number;
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
  customer?: string; // Make optional since it might not always be present
  payment_status?: 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled';
  selected_payment_method: string;
  total?: number; // Make optional, can calculate from order_data if needed
  delivery?: string;
  items?: number; // Can calculate from order_data length
  fulfillment?:
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
  coupon_code?: string | null; // Added based on API response
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
  filterBy:
    | 'all'
    | 'pending'
    | 'paid'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled';
  searchQuery: string;
  cancellingOrder: number | null;
  selectedOrders: number[];
  showBulkActions: boolean;
  bulkProcessing: boolean;
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
  { value: 'pending', label: 'Pending Payment' },
  { value: 'paid', label: 'Paid' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
] as const;

export default function OrdersPage() {
  const router = useRouter();
  const { user, role } = useAuth();
  const isClientRole = role === 'client';
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
    selectedOrders: [],
    showBulkActions: false,
    bulkProcessing: false,
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

  // Redirect if not authorized (only admin and staff can access)
  useEffect(() => {
    if (
      state.isClient &&
      user &&
      role &&
      role !== 'admin' &&
      role !== 'staff'
    ) {
      router.push(
        '/signin?message=Access denied. Admin or staff access required.'
      );
    }
  }, [user, role, router, state.isClient]);

  // Load orders
  const loadOrders = useCallback(async () => {
    if (!state.isClient || !user) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // ✅ Using real API to fetch orders
      console.log('🔄 Fetching orders from API...');
      const response = await fetchUserOrders(user.id);

      // Handle paginated response structure
      const orders = response.results || response || [];

      console.log('✅ Orders fetched successfully:', {
        total: response.count || orders.length,
        ordersReceived: orders.length,
        response: response,
        userRole: role,
        isClientRole: isClientRole,
        userId: user?.id,
        hasNextPage: !!response.next,
        hasPrevPage: !!response.previous,
      });

      setState((prev) => ({
        ...prev,
        orders,
        loading: false,
      }));
    } catch (error) {
      console.error('❌ Error loading orders:', error);
      setState((prev) => ({
        ...prev,
        error: 'Failed to load orders. Please try again.',
        showErrorModal: true,
        loading: false,
        orders: [], // Fallback to empty array
      }));
    }
  }, [state.isClient, user, role, isClientRole]);

  // ✅ Utility functions to handle optional fields
  const calculateOrderTotal = (order: Order): number => {
    if (order.total !== undefined) return order.total;
    // Calculate from order_data if total is not provided
    return order.order_data.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  };

  const getOrderCustomer = (order: Order): string => {
    if (order.customer) return order.customer;
    // Fallback to billing data if customer field is not provided
    return (
      `${order.billing_data?.firstName || ''} ${order.billing_data?.lastName || ''}`.trim() ||
      'Unknown Customer'
    );
  };

  const getPaymentStatus = (order: Order): string => {
    return order.payment_status || 'pending';
  };

  const getFulfillmentStatus = (order: Order): string => {
    return order.fulfillment || 'pending';
  };

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
          getOrderCustomer(order)
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
        const paymentStatus = getPaymentStatus(order);
        const fulfillmentStatus = getFulfillmentStatus(order);

        switch (state.filterBy) {
          case 'pending':
            return (
              paymentStatus === 'pending' || fulfillmentStatus === 'pending'
            );
          case 'paid':
            return paymentStatus === 'paid';
          case 'processing':
            return fulfillmentStatus === 'processing';
          case 'shipped':
            return fulfillmentStatus === 'shipped';
          case 'delivered':
            return fulfillmentStatus === 'delivered';
          case 'cancelled':
            return (
              paymentStatus === 'cancelled' || fulfillmentStatus === 'cancelled'
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
          return calculateOrderTotal(b) - calculateOrderTotal(a);
        case 'total-low':
          return calculateOrderTotal(a) - calculateOrderTotal(b);
        case 'status':
          return getFulfillmentStatus(a).localeCompare(getFulfillmentStatus(b));
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
      setState((prev) => ({
        ...prev,
        sortBy: e.target.value as
          | 'newest'
          | 'oldest'
          | 'total-high'
          | 'total-low'
          | 'status',
      }));
    },
    []
  );

  const handleFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setState((prev) => ({
        ...prev,
        filterBy: e.target.value as
          | 'all'
          | 'pending'
          | 'paid'
          | 'processing'
          | 'shipped'
          | 'delivered'
          | 'cancelled',
      }));
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
      // Update fulfillment status to cancelled via API
      await updateOrderFulfillment(orderId, 'cancelled');

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

  // Handle fulfillment status update (for admin/staff)
  const handleUpdateFulfillment = useCallback(
    async (orderId: number, newStatus: string) => {
      if (isClientRole) {
        console.warn('Only admin and staff can update fulfillment status');
        return;
      }

      try {
        console.log(
          `🔄 Updating order ${orderId} fulfillment to: ${newStatus}`
        );

        // Update via API
        await updateOrderFulfillment(orderId, newStatus);

        // Update local state
        setState((prev) => ({
          ...prev,
          orders: prev.orders.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  fulfillment: newStatus as
                    | 'pending'
                    | 'confirmed'
                    | 'processing'
                    | 'shipped'
                    | 'delivered'
                    | 'cancelled',
                }
              : order
          ),
        }));

        console.log(`✅ Order ${orderId} fulfillment updated successfully`);
      } catch (error) {
        console.error('❌ Error updating fulfillment:', error);
        setState((prev) => ({
          ...prev,
          error: 'Failed to update order status. Please try again.',
          showErrorModal: true,
        }));
      }
    },
    [isClientRole]
  );

  // Handle order reordering (for clients)
  const handleReorder = useCallback(
    async (orderId: number) => {
      try {
        const order = state.orders.find((o) => o.id === orderId);
        if (!order) {
          console.error('Order not found');
          return;
        }

        console.log(`🔄 Reordering items from order ${orderId}`);

        // TODO: Implement reorder functionality
        // This could add items back to cart or create a new order
        alert('Reorder functionality will be implemented soon!');
      } catch (error) {
        console.error('❌ Error reordering:', error);
        setState((prev) => ({
          ...prev,
          error: 'Failed to reorder items. Please try again.',
          showErrorModal: true,
        }));
      }
    },
    [state.orders]
  );

  // Handle invoice printing/downloading
  const handlePrintInvoice = useCallback(
    async (orderId: number) => {
      try {
        console.log(`🖨️ Generating invoice for order ${orderId}`);

        const order = state.orders.find((o) => o.id === orderId);
        if (!order) {
          console.error('Order not found');
          return;
        }

        // Create printable invoice content
        const invoiceContent = generateInvoiceHTML(order);

        // Open print dialog
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        if (printWindow) {
          printWindow.document.write(invoiceContent);
          printWindow.document.close();
          printWindow.focus();
          printWindow.print();
        }
      } catch (error) {
        console.error('❌ Error generating invoice:', error);
        setState((prev) => ({
          ...prev,
          error: 'Failed to generate invoice. Please try again.',
          showErrorModal: true,
        }));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.orders]
  );

  // Generate HTML content for invoice
  const generateInvoiceHTML = useCallback((order: Order) => {
    const total = calculateOrderTotal(order);
    const date = new Date(order.created_at).toLocaleDateString();

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice - Order #${order.id}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .order-info { margin-bottom: 20px; }
          .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .items-table th, .items-table td { padding: 10px; border: 1px solid #ddd; text-align: left; }
          .items-table th { background-color: #f5f5f5; }
          .total { text-align: right; font-weight: bold; font-size: 18px; }
          .billing-info { margin-top: 30px; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>INVOICE</h1>
          <h2>Order #${order.id}</h2>
        </div>
        
        <div class="order-info">
          <p><strong>Order Date:</strong> ${date}</p>
          <p><strong>Payment Method:</strong> ${order.selected_payment_method}</p>
          <p><strong>Status:</strong> ${getFulfillmentStatus(order)}</p>
        </div>
        
        <table class="items-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.order_data
              .map(
                (item) => `
              <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>$${item.price.toFixed(2)}</td>
                <td>$${(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
        
        <div class="total">
          <p>Total: $${total.toFixed(2)}</p>
        </div>
        
        <div class="billing-info">
          <h3>Billing Information</h3>
          <p>${order.billing_data.firstName} ${order.billing_data.lastName}</p>
          <p>${order.billing_data.address1}</p>
          ${order.billing_data.address2 ? `<p>${order.billing_data.address2}</p>` : ''}
          <p>${order.billing_data.city}, ${order.billing_data.state} ${order.billing_data.postalCode}</p>
          <p>${order.billing_data.country}</p>
        </div>
        
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 1000);
          }
        </script>
      </body>
      </html>
    `;
  }, []);

  // Utility functions
  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }, []);

  // Bulk processing handlers
  const handleBulkUpdate = useCallback(
    async (status: string) => {
      if (state.selectedOrders.length === 0) {
        alert('Please select at least one order to update.');
        return;
      }

      setState((prev: OrdersState) => ({ ...prev, bulkProcessing: true }));

      try {
        await bulkUpdateOrderStatus(state.selectedOrders, status);

        setState((prevState: OrdersState) => ({
          ...prevState,
          orders: prevState.orders.map((order: Order) =>
            state.selectedOrders.includes(order.id)
              ? { ...order, status }
              : order
          ),
          filteredOrders: prevState.filteredOrders.map((order: Order) =>
            state.selectedOrders.includes(order.id)
              ? { ...order, status }
              : order
          ),
          selectedOrders: [],
          showBulkActions: false,
          bulkProcessing: false,
        }));

        alert(
          `Successfully updated ${state.selectedOrders.length} orders to ${status}`
        );
      } catch (error) {
        console.error('Error updating orders:', error);
        alert('Failed to update orders. Please try again.');
        setState((prev: OrdersState) => ({ ...prev, bulkProcessing: false }));
      }
    },
    [state.selectedOrders]
  );

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        setState((prev: OrdersState) => ({
          ...prev,
          selectedOrders: state.filteredOrders.map((order: Order) => order.id),
          showBulkActions: true,
        }));
      } else {
        setState((prev: OrdersState) => ({
          ...prev,
          selectedOrders: [],
          showBulkActions: false,
        }));
      }
    },
    [state.filteredOrders]
  );

  const handleSelectOrder = useCallback((orderId: number, checked: boolean) => {
    setState((prev: OrdersState) => {
      const newSelected = checked
        ? [...prev.selectedOrders, orderId]
        : prev.selectedOrders.filter((id: number) => id !== orderId);

      return {
        ...prev,
        selectedOrders: newSelected,
        showBulkActions: newSelected.length > 0,
      };
    });
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
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

  // Check if user is authorized (admin or staff only)
  if (user && role && role !== 'admin' && role !== 'staff') {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isClientRole ? 'My Orders' : 'All Orders'}
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                {state.filteredOrders.length} order
                {state.filteredOrders.length !== 1 ? 's' : ''} found
                {isClientRole ? '' : ' across all customers'}
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
            {/* Bulk Actions Toolbar */}
            {!isClientRole && state.showBulkActions && (
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-700">
                      {state.selectedOrders.length} order
                      {state.selectedOrders.length !== 1 ? 's' : ''} selected
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleBulkUpdate('confirmed')}
                      disabled={state.bulkProcessing}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                    >
                      Confirm Selected
                    </button>
                    <button
                      onClick={() => handleBulkUpdate('processing')}
                      disabled={state.bulkProcessing}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      Process Selected
                    </button>
                    <button
                      onClick={() => handleBulkUpdate('shipped')}
                      disabled={state.bulkProcessing}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                    >
                      Ship Selected
                    </button>
                    <button
                      onClick={() =>
                        setState((prev) => ({
                          ...prev,
                          selectedOrders: [],
                          showBulkActions: false,
                        }))
                      }
                      className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {!isClientRole && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          checked={
                            state.selectedOrders.length ===
                              state.filteredOrders.length &&
                            state.filteredOrders.length > 0
                          }
                          onChange={(e) => handleSelectAll(e.target.checked)}
                        />
                      </th>
                    )}
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
                        {!isClientRole && (
                          <td
                            className="px-6 py-4 whitespace-nowrap"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="checkbox"
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                              checked={state.selectedOrders.includes(order.id)}
                              onChange={(e) =>
                                handleSelectOrder(order.id, e.target.checked)
                              }
                            />
                          </td>
                        )}
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
                            {getOrderCustomer(order)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.billing_data.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-xs text-gray-500 mt-1">
                            {order.selected_payment_method.toUpperCase()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(calculateOrderTotal(order))}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              getStatusConfig(
                                'fulfillment',
                                getFulfillmentStatus(order)
                              ).color
                            }`}
                          >
                            {
                              getStatusConfig(
                                'fulfillment',
                                getFulfillmentStatus(order)
                              ).label
                            }
                          </span>
                          {order.tracking_number && (
                            <div className="text-xs text-gray-500 mt-1">
                              Track: {order.tracking_number}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            {/* Order Processing Options */}
                            {!isClientRole ? (
                              // Admin/Staff Processing Options
                              <div className="flex items-center space-x-1">
                                {/* Quick Action Buttons */}
                                {order.fulfillment === 'pending' && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleUpdateFulfillment(
                                        order.id,
                                        'confirmed'
                                      );
                                    }}
                                    className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 border border-blue-200 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    title="Confirm Order"
                                  >
                                    ✓ Confirm
                                  </button>
                                )}

                                {order.fulfillment === 'confirmed' && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleUpdateFulfillment(
                                        order.id,
                                        'processing'
                                      );
                                    }}
                                    className="inline-flex items-center px-2 py-1 text-xs font-medium text-purple-700 bg-purple-100 border border-purple-200 rounded-md hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    title="Start Processing"
                                  >
                                    ⚙️ Process
                                  </button>
                                )}

                                {order.fulfillment === 'processing' && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleUpdateFulfillment(
                                        order.id,
                                        'shipped'
                                      );
                                    }}
                                    className="inline-flex items-center px-2 py-1 text-xs font-medium text-indigo-700 bg-indigo-100 border border-indigo-200 rounded-md hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    title="Mark as Shipped"
                                  >
                                    🚚 Ship
                                  </button>
                                )}

                                {order.fulfillment === 'shipped' && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleUpdateFulfillment(
                                        order.id,
                                        'delivered'
                                      );
                                    }}
                                    className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-100 border border-green-200 rounded-md hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    title="Mark as Delivered"
                                  >
                                    ✅ Deliver
                                  </button>
                                )}

                                {/* Print/Export Options */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePrintInvoice(order.id);
                                  }}
                                  className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                  title="Print Invoice"
                                >
                                  🖨️ Print
                                </button>
                              </div>
                            ) : (
                              // Client Options
                              <div className="flex items-center space-x-1">
                                {order.fulfillment === 'delivered' && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleReorder(order.id);
                                    }}
                                    className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 border border-blue-200 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    title="Reorder Items"
                                  >
                                    🔄 Reorder
                                  </button>
                                )}

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePrintInvoice(order.id);
                                  }}
                                  className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                  title="Download Invoice"
                                >
                                  📄 Invoice
                                </button>
                              </div>
                            )}

                            {/* Cancel Button (for eligible orders) */}
                            {(order.fulfillment === 'pending' ||
                              order.fulfillment === 'confirmed') && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelOrder(order.id);
                                }}
                                disabled={state.cancellingOrder === order.id}
                                className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 bg-red-100 border border-red-200 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                                title="Cancel Order"
                              >
                                {state.cancellingOrder === order.id
                                  ? '⏳ Cancelling...'
                                  : '❌ Cancel'}
                              </button>
                            )}
                          </div>
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
                                          <SafeImage
                                            alt={item.name}
                                            className="w-20 h-15 object-cover rounded-lg"
                                            images={[
                                              {
                                                image_path: getPublicImageUrl(
                                                  'products',
                                                  item.id,
                                                  item.image_url
                                                ),
                                              },
                                            ]}
                                            width={80}
                                            height={60}
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
                                            Quantity: {item.quantity} ×
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
                                      {order.billing_data.firstName}
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
                                        {order.billing_data.city},
                                        {order.billing_data.state}
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
                                        {order.shipping_data.firstName}
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
                                          {order.shipping_data.city},
                                          {order.shipping_data.state}
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
                                        </span>
                                        {order.delivery}
                                      </p>
                                      {order.estimated_delivery && (
                                        <p className="text-gray-600">
                                          <span className="font-medium">
                                            Estimated Delivery:
                                          </span>
                                          {formatDate(order.estimated_delivery)}
                                        </p>
                                      )}
                                      {order.tracking_number && (
                                        <p className="text-gray-600">
                                          <span className="font-medium">
                                            Tracking Number:
                                          </span>
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
