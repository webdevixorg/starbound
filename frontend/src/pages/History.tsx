import React, { useEffect, useState } from 'react';
import { fetchVisitHistory } from '../services/api';

interface Visit {
  id: number;
  timestamp: string;
  item_type: string;
  item_id: number;
  product?: {
    title: string;
    slug: string;
    price: number;
    image?: string;
  };
}

const HistoryList: React.FC = () => {
  const [visits, setVisits] = useState<Visit[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchVisitHistory();
        setVisits(data);
      } catch (error) {
        console.error('Error fetching visit history:', error);
      }
    })();
  }, []);

  return (
    <section className="bg-gray-50">
      <div className="mx-auto">
        <div className="bg-white relative sm:rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                <tr>
                  <th className="px-4 py-3">Image</th>
                  <th className="px-4 py-3">Product name</th>
                  <th className="px-4 py-3">Visited Time</th>
                  <th className="px-4 py-3">Price</th>
                </tr>
              </thead>
              <tbody>
                {visits.map((visit) => (
                  <tr key={visit.id} className="border-b">
                    <td className="px-4 py-3">
                      {visit.product?.image ? (
                        <img
                          src={
                            'http://127.0.0.1:8000/media/' + visit.product.image
                          }
                          alt={visit.product.title}
                          className="h-16 w-16 object-cover rounded"
                        />
                      ) : (
                        <div className="h-16 w-16 bg-gray-200 rounded" />
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {visit.product?.slug ? (
                        <a
                          href={`/products/${visit.product.slug}`}
                          className="text-blue-600 hover:underline"
                        >
                          {visit.product.title}
                        </a>
                      ) : (
                        `Product #${visit.item_id}`
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {new Date(visit.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      {visit.product?.price
                        ? `Rs. ${visit.product.price.toLocaleString()}`
                        : '-'}
                    </td>
                  </tr>
                ))}
                {visits.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-6 text-center text-gray-700"
                    >
                      No visits found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* You can add the pagination nav here if needed */}
        </div>
      </div>
    </section>
  );
};

export default HistoryList;
