import React, { useState } from 'react';

const Feedback: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    feedback: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle form submission logic (e.g., send data to backend)
    console.log(formData); // For demonstration, log the form data
    alert('Feedback submitted!'); // Example alert for demonstration
  };

  return (
    <div className="max-w-2xl p-6 bg-white">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Feedback</h2>

      <form className="feedback-form" onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            className="block text-gray-700 font-semibold mb-2"
            htmlFor="name"
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
            className="block text-gray-700 font-semibold mb-2"
            htmlFor="email"
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
            className="block text-gray-700 font-semibold mb-2"
            htmlFor="feedback"
          >
            Feedback:
          </label>
          <textarea
            id="feedback"
            name="feedback"
            rows={4}
            value={formData.feedback}
            onChange={handleChange}
            className="form-textarea mt-1 block w-full border border-gray-300 rounded-md p-2 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            required
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Submit Feedback
        </button>
      </form>
    </div>
  );
};

export default Feedback;
