import React, { useEffect, useState } from 'react';
import LoadingSpinner from '../components/Common/Loading';

const ContactSupport: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  useEffect(() => {
    // Simulate loading delay or wrap in async fetch logic
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500); // e.g., simulate a 500ms load time

    return () => clearTimeout(timer);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Simulate network request (replace with real API call)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate success
      setSuccess('Your message has been sent successfully!');
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-2xl p-6 bg-white">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Contact Support</h2>

      <div className="mb-6">
        <p className="text-gray-700">Email: support@example.com</p>
        <p className="text-gray-700">Phone: +1234567890</p>
        <p className="text-gray-700">Address: 456 Avenue, City, Country</p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4 text-gray-800">
          Send us a message
        </h3>

        {success && (
          <div className="mb-4 p-3 rounded bg-green-100 text-green-800 border border-green-300">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded bg-red-100 text-red-700 border border-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative">
          {loading && (
            <div className="absolute inset-0 flex justify-center items-center bg-white bg-opacity-80 z-10">
              <LoadingSpinner />
            </div>
          )}

          <fieldset disabled={loading} className={loading ? 'opacity-50' : ''}>
            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-gray-700 font-semibold mb-2"
              >
                Name:
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-input mt-1 block w-full border border-gray-300 rounded-md p-2 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-gray-700 font-semibold mb-2"
              >
                Email:
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input mt-1 block w-full border border-gray-300 rounded-md p-2 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="message"
                className="block text-gray-700 font-semibold mb-2"
              >
                Message:
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                value={formData.message}
                onChange={handleChange}
                className="form-textarea mt-1 block w-full border border-gray-300 rounded-md p-2 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Submit
            </button>
          </fieldset>
        </form>
      </div>
    </div>
  );
};

export default ContactSupport;
