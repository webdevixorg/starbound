import React, { useEffect, useState } from 'react';
import { fetchFAQs } from '../services/api';
import { FAQ } from '../types/types'; // Adjust the import path as necessary

const FAQPage: React.FC = () => {
  const [faqs, setFAQs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getFAQs = async () => {
      try {
        const data = await fetchFAQs();
        console.log(data);
        setFAQs(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching FAQs:', error);
        setError('Could not fetch FAQs. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    getFAQs();
  }, []);

  if (loading) {
    return (
      <div className="container p-6 bg-white shadow-md rounded-lg">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container p-6 bg-white shadow-md rounded-lg">{error}</div>
    );
  }

  return (
    <div className="container p-6 bg-white shadow-md rounded-lg">
      <h3 className="text-2xl font-bold mb-6 text-gray-900">
        Frequently Asked Questions
      </h3>
      {faqs.length === 0 ? (
        <p className="text-gray-700">No FAQs available.</p>
      ) : (
        <ul className="space-y-4">
          {faqs.map((faq) => (
            <li key={faq.id} className="p-4 bg-gray-100 rounded-md shadow">
              <h4 className="text-xl font-bold">{faq.question}</h4>
              <p className="text-gray-700">{faq.answer}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FAQPage;
