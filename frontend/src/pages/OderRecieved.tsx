import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import BreadcrumbsComponent from '../components/Common/Breadcrumbs';
import { fetchOrder } from '../services/apiProducts'; // Ensure the module exists at this path or adjust the path accordingly
import { formatCurrency } from '../helpers/common';

interface Order {
  id: number;
  billing_data: {
    firstName: string;
    lastName: string;
    companyName: string;
    address1: string;
    address2: string;
    city: string;
    zipCode: string;
    state: string;
    country: string;
    phone: string;
    email: string;
  };
  shipping_data: {
    firstName: string;
    lastName: string;
    companyName: string;
    address1: string;
    address2: string;
    city: string;
    zipCode: string;
    state: string;
    country: string;
    phone: string;
    email: string;
  };
  order_data: {
    id: string;
    quantity: number;
    image_url: string;
    name: string;
    price: number;
  }[];
  selected_payment_method: string;
  coupon_code: string | null;
  ship_to_different_address: boolean;
  created_at: string;
}

const OrderReceived: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const orderData = await fetchOrder(Number(orderId)); // Replace 1 with the actual order ID if needed
        setOrder(orderData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching order:', error);
        setLoading(false);
      }
    };

    if (orderId) {
      loadOrder();
    }
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!order) {
    return <div>Order not found.</div>;
  }

  const addressData = order.shipping_data || order.billing_data;

  return (
    <div className="container mx-auto p-6">
      <div className="mx-auto px-4 mt-6">
        <BreadcrumbsComponent optional="Order Received" />
      </div>
      {/* Title */}
      <div className="mx-auto px-4 mt-6">
        <h1 className="font-normal text-gray-900 dark:text-gray-100 mb-6 mt-6 text-left text-4xl leading-tight font-gliko">
          Order Received
        </h1>
      </div>
      <div className="bg-white p-6">
        <p className="text-green-600 text-lg font-semibold mb-4">
          Thank you. Your order has been received.
        </p>

        <ul className="mb-6">
          <li className="mb-2">
            <span className="font-semibold">Order number:</span>
            <strong>{order.id}</strong>
          </li>
          <li className="mb-2">
            <span className="font-semibold">Date:</span>
            <strong>{new Date(order.created_at).toLocaleDateString()}</strong>
          </li>
          <li className="mb-2">
            <span className="font-semibold">Total:</span>
            <strong>
              <span className="text-gray-900">
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
              </span>
            </strong>
          </li>
          <li className="mb-2">
            <span className="font-semibold">Payment method:</span>
            <strong>{order.selected_payment_method}</strong>
          </li>
        </ul>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Order details</h2>
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Product</th>
                <th className="py-2 px-4 border-b">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.order_data.map(
                (item: {
                  id: string;
                  name: string;
                  image_url: string;
                  price: number;
                  quantity: number;
                }) => (
                  <tr key={item.id}>
                    <td className="py-2 px-4 border-b flex items-center justify-between">
                      <div className="flex items-center">
                        <img
                          className="h-20 w-20 rounded-full"
                          src={item.image_url}
                          alt={item.name}
                        />
                        <div className="ml-4">
                          <a
                            href={item.name}
                            className="text-blue-600 font-bold hover:underline"
                          >
                            {item.name}
                          </a>
                          <strong className="block">× {item.quantity}</strong>
                        </div>
                      </div>
                    </td>
                    <td className="py-2 px-4 border-b">
                      <span className="text-gray-900">
                        <bdi>
                          <span className="text-gray-900">$</span>
                          {formatCurrency(item.price * item.quantity)}
                        </bdi>
                      </span>
                    </td>
                  </tr>
                )
              )}
            </tbody>
            <tfoot>
              <tr>
                <th className="py-2 px-4 border-b text-left">Subtotal</th>
                <td className="py-2 px-4 border-b">
                  <span className="text-gray-900">
                    {formatCurrency(
                      order.order_data.reduce(
                        (
                          sum: number,
                          item: { price: number; quantity: number }
                        ) => sum + item.price * item.quantity,
                        0
                      )
                    )}
                  </span>
                </td>
              </tr>
              <tr>
                <th className="py-2 px-4 border-b text-left">Shipping</th>
                <td className="py-2 px-4 border-b">Free shipping</td>
              </tr>
              <tr>
                <th className="py-2 px-4 border-b text-left">Payment method</th>
                <td className="py-2 px-4 border-b">
                  {order.selected_payment_method}
                </td>
              </tr>
              <tr>
                <th className="py-2 px-4 border-b text-left font-bold">
                  Total
                </th>
                <td className="py-2 px-4 border-b">
                  <span className="text-gray-900 font-bold">
                    {formatCurrency(
                      order.order_data.reduce(
                        (
                          sum: number,
                          item: { price: number; quantity: number }
                        ) => sum + item.price * item.quantity,
                        0
                      )
                    )}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Billing address</h2>
            <address className="not-italic mb-4">
              {order.billing_data.firstName} {order.billing_data.lastName}
              <br />
              {order.billing_data.address1}
              <br />
              {order.billing_data.city}
              <br />
              {order.billing_data.state}
              <br />
              {order.billing_data.zipCode}
              <br />
              {order.billing_data.country}
              <p className="mt-2">{order.billing_data.phone}</p>
              <p>{order.billing_data.email}</p>
            </address>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-4">Shipping address</h2>
            <address className="not-italic">
              {addressData.firstName} {addressData.lastName}
              <br />
              {addressData.address1}
              <br />
              {addressData.address2}
              <br />
              {addressData.city}
              <br />
              {addressData.state}
              <br />
              {addressData.zipCode}
              <br />
              {addressData.country}
            </address>
          </div>
        </section>
      </div>
    </div>
  );
};

export default OrderReceived;
