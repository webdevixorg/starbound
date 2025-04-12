import React, { useEffect, useRef, useState } from 'react';
import { fetchOrders } from '../services/apiProducts';
import { formatCurrency } from '../helpers/common';

interface Order {
  ship_to_different_address: any;
  selected_payment_method: string;
  order_data: any;
  billing_data: any;
  shipping_data: any;
  created_at: string | number | Date;
  id: number;
  customer: string;
  payment_status: 'Pending' | 'Success';
  total: number;
  delivery: string;
  items: number;
  fulfillment: 'Fulfilled' | 'Unfulfilled';
}

const OrderList: React.FC = () => {
  const contentRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null); // State to track expanded orders

  useEffect(() => {
    const getOrders = async () => {
      try {
        // Replace with real API call
        const data = await fetchOrders();
        setOrders(data.results);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    getOrders();
  }, []);

  const statusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'Success':
        return 'bg-green-100 text-green-700';
      case 'Fulfilled':
        return 'bg-green-200 text-green-800';
      case 'Unfulfilled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const toggleExpanded = (orderId: number) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId)); // Toggle the expanded state
  };

  const calculateHeight = (id: string) => {
    const element = contentRefs.current[id];
    return element ? `${element.scrollHeight}px` : '0px';
  };

  return (
    <div className="p-6 bg-white">
      <h3 className="text-2xl font-bold mb-4 text-gray-900">Orders</h3>

      <table className="w-full border-collapse border-gray-200">
        <thead>
          <tr className="text-left text-gray-600 bg-gray-50">
            <th className="p-3">Order</th>
            <th className="p-3">Date</th>
            <th className="p-3">Customer</th>
            <th className="p-3">Payment</th>
            <th className="p-3">Total</th>
            <th className="p-3">Delivery</th>
            <th className="p-3">Fulfillment</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr>
              <td colSpan={7} className="p-6 text-center text-gray-500">
                No orders found.
              </td>
            </tr>
          ) : (
            orders.map((order) => (
              <React.Fragment key={order.id}>
                <tr
                  onClick={() => toggleExpanded(order.id)} // Toggle expand on row click
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="p-3">{`#${order.id}`}</td>
                  <td className="p-3">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-3">
                    {order.billing_data.firstName} {order.billing_data.lastName}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-sm font-medium ${statusColor(
                        order.selected_payment_method
                      )}`}
                    >
                      {order.selected_payment_method}
                    </span>
                  </td>
                  <td className="p-3">
                    <bdi>
                      {formatCurrency(
                        order.order_data.reduce(
                          (
                            sum: number,
                            item: { price: number; quantity: number }
                          ) => sum + item.price * item.quantity,
                          0
                        )
                      )}
                    </bdi>
                  </td>
                  <td className="p-3">{order.delivery || 'N/A'}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-sm font-medium ${statusColor(
                        order.fulfillment
                      )}`}
                    >
                      {order.fulfillment}
                    </span>
                  </td>
                </tr>

                {/* Expanded details section */}
                <tr className="bg-white border-b border-gray-100">
                  <td colSpan={7}>
                    <div
                      ref={(el) =>
                        (contentRefs.current[`order-${order.id}`] = el)
                      }
                      className={`shipping-address overflow-hidden transition-all duration-200 ease-in-out`}
                      style={{
                        maxHeight:
                          expandedOrderId === order.id
                            ? calculateHeight(`order-${order.id}`)
                            : '0px',
                        opacity: expandedOrderId === order.id ? 1 : 0,
                        marginBottom: expandedOrderId === order.id ? '1rem' : 0,
                      }}
                    >
                      {/* Order Items Section */}
                      <div className="bg-white p-4 border-b border-gray-200">
                        <h4 className="text-xl text-gray-800 mb-2">
                          Order Items
                        </h4>
                        <ul className="space-y-2">
                          {order.order_data.map(
                            (
                              item: {
                                image_url: string;
                                name: string;
                                price: number;
                                quantity: number;
                                imageUrl: string; // Assuming there's an imageUrl field
                              },
                              index: number
                            ) => (
                              <li
                                key={index}
                                className="flex items-center justify-between space-x-4"
                              >
                                {/* Item Image */}
                                <div className="flex-shrink-0">
                                  <img
                                    src={
                                      item.image_url ||
                                      'https://via.placeholder.com/50'
                                    } // Fallback to placeholder if no image
                                    alt={item.name}
                                    className="w-16 h-16 object-cover rounded"
                                  />
                                </div>

                                {/* Item Info */}
                                <div className="flex-1">
                                  <p className="text-gray-700 font-medium">
                                    {item.name}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    Price: {formatCurrency(item.price)}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    Quantity: {item.quantity}
                                  </p>
                                </div>

                                {/* Item Total Price */}
                                <div className="text-sm font-semibold text-gray-700">
                                  {formatCurrency(item.price * item.quantity)}
                                </div>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                      {/* Billing Info Section */}
                      <div className="bg-white p-4 border-b border-gray-200">
                        <h4 className="text-xl text-gray-800 mb-2">
                          Billing Info
                        </h4>
                        <p className="text-gray-700 text-sm">
                          {order.billing_data.firstName}
                          {order.billing_data.lastName}
                        </p>
                        <p className="text-gray-600 text-sm">
                          {order.billing_data.address1}
                        </p>
                        <p className="text-gray-600 text-sm">
                          {order.billing_data.address2 || 'N/A'}
                        </p>
                        <p className="text-gray-600 text-sm">
                          {order.billing_data.city || 'N/A'}
                        </p>
                        <p className="text-gray-600 text-sm">
                          {order.billing_data.state || 'N/A'}
                        </p>
                        <p className="text-gray-600 text-sm">
                          {order.billing_data.postalCode || 'N/A'}
                        </p>
                        <p className="text-gray-600 text-sm">
                          {order.billing_data.country || 'N/A'}
                        </p>
                        <p className="text-gray-600 text-sm">
                          {order.billing_data.email || 'N/A'}
                        </p>
                        <p className="text-gray-600 text-sm">
                          {order.billing_data.phone || 'N/A'}
                        </p>
                      </div>

                      {/* Check if shipping address is different from billing address */}
                      {order.ship_to_different_address && (
                        <div className="bg-white p-4 border border-gray-200">
                          <h4 className="text-xl text-gray-800 mb-2">
                            Shipping Info
                          </h4>
                          <p className="text-gray-700 text-sm">
                            {order.shipping_data.firstName}
                            {order.shipping_data.lastName}
                          </p>
                          <p className="text-gray-600 text-sm">
                            {order.shipping_data.address1}
                          </p>
                          <p className="text-gray-600 text-sm">
                            {order.shipping_data.address2 || 'N/A'}
                          </p>
                          <p className="text-gray-600 text-sm">
                            {order.shipping_data.city || 'N/A'}
                          </p>
                          <p className="text-gray-600 text-sm">
                            {order.shipping_data.state || 'N/A'}
                          </p>
                          <p className="text-gray-600 text-sm">
                            <strong>Postal Code:</strong>
                            {order.shipping_data.zipCode || 'N/A'}
                          </p>
                          <p className="text-gray-600 text-sm">
                            {order.shipping_data.country || 'N/A'}
                          </p>
                          <p className="text-gray-600 text-sm">
                            {order.shipping_data.email || 'N/A'}
                          </p>
                          <p className="text-gray-600 text-sm">
                            {order.shipping_data.phone || 'N/A'}
                          </p>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              </React.Fragment>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

const Orders: React.FC = () => {
  return <OrderList />;
};

export default Orders;
