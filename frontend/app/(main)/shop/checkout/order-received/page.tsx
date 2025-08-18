// app/orders/[orderId]/page.tsx
import React, { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { fetchOrder } from '@/services/apiProducts';
import { formatCurrency } from '@/helpers/common';
import BreadcrumbsComponent from '@/components/Common/Breadcrumbs';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

// ----- Types -----
interface OrderItem {
  id: string;
  quantity: number;
  image_url: string;
  name: string;
  price: number;
}

interface AddressData {
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
}

interface Order {
  id: number;
  billing_data: AddressData;
  shipping_data: AddressData;
  order_data: OrderItem[];
  selected_payment_method: string;
  coupon_code: string | null;
  ship_to_different_address: boolean;
  created_at: string;
}

// ----- SEO -----
export const generateMetadata = ({
  params,
}: {
  params: { orderId: string };
}): Metadata => ({
  title: `Order Confirmation #${params.orderId} | Starbound`,
  description: `Order confirmation for order #${params.orderId}. View your order details, shipping information, and payment confirmation.`,
  robots: { index: false, follow: false },
});

// ----- Server Component -----
export default async function OrderReceived({
  params,
}: {
  params: { orderId: string };
}) {
  const orderId = Number(params.orderId);

  if (!orderId) return notFound();

  let order: Order | null = null;

  try {
    order = await fetchOrder(orderId);
  } catch {
    return (
      <OrderError message="Failed to load order details. Please try again later." />
    );
  }

  if (!order) return <OrderError message="Order not found" />;

  const orderTotal = useMemo(
    () =>
      order.order_data.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      ),
    [order]
  );

  const formattedDate = new Date(order.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const addressData = order.ship_to_different_address
    ? order.shipping_data
    : order.billing_data;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Breadcrumb */}
      <div className="px-4 mt-6">
        <BreadcrumbsComponent optional="Order Received" />
      </div>

      {/* Header */}
      <div className="px-4 mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-4xl font-gliko font-normal text-gray-900 dark:text-gray-100">
          Order Received
        </h1>
        <div className="flex space-x-3">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 border rounded-md bg-white hover:bg-gray-50 text-sm font-medium print:hidden"
          >
            Print Order
          </button>
          <Link
            href="/profile/orders"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 text-sm"
          >
            View All Orders
          </Link>
        </div>
      </div>

      {/* Success */}
      <div className="bg-green-50 border-l-4 border-green-400 p-4 my-6 rounded">
        <p className="text-green-700 font-semibold">
          Thank you! Your order has been received and is being processed.
        </p>
        <p className="text-green-600 text-sm">
          You will receive an email confirmation shortly with tracking details.
        </p>
      </div>

      {/* Order Summary */}
      <ul className="mb-6 space-y-2">
        <SummaryRow label="Order number:" value={`#${order.id}`} />
        <SummaryRow label="Date:" value={formattedDate} />
        <SummaryRow
          label="Total:"
          value={
            <span className="text-green-600">{formatCurrency(orderTotal)}</span>
          }
        />
        <SummaryRow
          label="Payment method:"
          value={order.selected_payment_method}
        />
      </ul>

      {/* Order Details Table */}
      <OrderDetailsTable order={order} orderTotal={orderTotal} />

      {/* Address Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <AddressCard
          title="Billing Address"
          data={order.billing_data}
          showContact
        />
        <AddressCard title="Shipping Address" data={addressData} />
      </section>

      {/* Footer Actions */}
      <div className="mt-8 pt-6 border-t border-gray-200 print:hidden flex justify-between">
        <p className="text-sm text-gray-500">
          Need help? Contact our support team at{' '}
          <a
            href="mailto:support@starbound.com"
            className="text-indigo-600 hover:underline"
          >
            support@starbound.com
          </a>
        </p>
        <Link
          href="/shop"
          className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 text-sm"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

// ----- Error Component -----
const OrderError = ({ message }: { message: string }) => (
  <div className="bg-red-50 border-l-4 border-red-400 p-4 my-6 rounded">
    <p className="text-red-700 font-semibold">{message}</p>
  </div>
);

// ----- Small Components -----
const SummaryRow = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <li className="flex justify-between">
    <span className="font-semibold text-gray-700">{label}</span>
    <strong className="text-gray-900">{value}</strong>
  </li>
);

const OrderDetailsTable = ({
  order,
  orderTotal,
}: {
  order: Order;
  orderTotal: number;
}) => (
  <section className="mb-8">
    <h2 className="text-2xl font-semibold mb-6">Order Details</h2>
    <table className="w-full border rounded-lg">
      <thead className="bg-gray-50">
        <tr>
          <th className="py-4 px-6 text-left">Product</th>
          <th className="py-4 px-6 text-right">Total</th>
        </tr>
      </thead>
      <tbody>
        {order.order_data.map((item) => (
          <tr key={item.id} className="hover:bg-gray-50">
            <td className="py-4 px-6 flex items-center gap-4">
              <Image
                src={item.image_url || '/placeholder-product.jpg'}
                alt={item.name}
                width={64}
                height={64}
                className="rounded-lg"
              />
              <div>
                <Link
                  href={`/shop/products/${item.id}`}
                  className="text-blue-600 hover:underline"
                >
                  {item.name}
                </Link>
                <div className="text-sm text-gray-500">
                  Quantity: {item.quantity}
                </div>
              </div>
            </td>
            <td className="py-4 px-6 text-right">
              {formatCurrency(item.price * item.quantity)}
              <div className="text-sm text-gray-500">
                {formatCurrency(item.price)} each
              </div>
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot className="bg-gray-50">
        <tr>
          <th className="py-4 px-6 text-left">Subtotal</th>
          <td className="py-4 px-6 text-right">{formatCurrency(orderTotal)}</td>
        </tr>
        <tr>
          <th className="py-4 px-6 text-left">Shipping</th>
          <td className="py-4 px-6 text-right text-green-600">Free shipping</td>
        </tr>
        <tr>
          <th className="py-4 px-6 text-left">Payment Method</th>
          <td className="py-4 px-6 text-right capitalize">
            {order.selected_payment_method}
          </td>
        </tr>
        <tr>
          <th className="py-4 px-6 text-left text-lg">Total</th>
          <td className="py-4 px-6 text-right text-lg text-green-600">
            {formatCurrency(orderTotal)}
          </td>
        </tr>
      </tfoot>
    </table>
  </section>
);

const AddressCard = ({
  title,
  data,
  showContact,
}: {
  title: string;
  data: AddressData;
  showContact?: boolean;
}) => (
  <div className="bg-gray-50 rounded-lg p-6">
    <h2 className="text-xl font-semibold mb-4">{title}</h2>
    <address className="not-italic space-y-1">
      <div className="font-semibold">
        {data.firstName} {data.lastName}
      </div>
      {data.companyName && <div>{data.companyName}</div>}
      <div>{data.address1}</div>
      {data.address2 && <div>{data.address2}</div>}
      <div>
        {data.city}, {data.state} {data.zipCode}
      </div>
      <div>{data.country}</div>
      {showContact && (
        <>
          <a
            href={`tel:${data.phone}`}
            className="block text-blue-600 hover:underline"
          >
            {data.phone}
          </a>
          <a
            href={`mailto:${data.email}`}
            className="block text-blue-600 hover:underline"
          >
            {data.email}
          </a>
        </>
      )}
    </address>
  </div>
);
