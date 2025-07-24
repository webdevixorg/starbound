import React, { useState } from 'react';
import BreadcrumbsComponent from '@/components/Common/Breadcrumbs';

const SubmitTicketForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    title: '',
    description: '',
    category: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};
    Object.entries(formData).forEach(([key, val]) => {
      if (!val) newErrors[key] = 'This field is required';
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    console.log('Submitted ticket:', formData);
    alert('Your ticket has been submitted!');
    setFormData({
      name: '',
      email: '',
      title: '',
      description: '',
      category: '',
    });
    setErrors({});
  };

  const categoryHelpText: Record<string, string> = {
    warranty:
      'Help with items under warranty. Include purchase date and issue details.',
    return: 'Return a product? Provide order ID and reason.',
    'used-part': 'Looking for a used part? Mention vehicle model and year.',
    accessories: 'Support with accessories? Include item code or description.',
    other: 'For anything else, describe your concern in detail.',
  };

  return (
    <div className="container mx-auto sm:py-6 lg:py-8">
      <div className="mx-auto my-6">
        <BreadcrumbsComponent />
      </div>
      <div className="max-w-6xl py-10">
        <h2 className="text-3xl font-bold mb-8">Customer Support</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Side - Help Options */}
          <div className="bg-gray-50 border border-gray-200 p-6 rounded-md">
            <h3 className="text-xl font-semibold mb-4">Need help with...</h3>
            <ul className="space-y-4 text-gray-700 text-sm">
              <li>
                <strong>Warranty:</strong> Issues with a product still under
                warranty?
              </li>
              <li>
                <strong>Return:</strong> Want to return an item? Make sure to
                include your order ID.
              </li>
              <li>
                <strong>Used Parts:</strong> Inquire about availability of used
                car parts.
              </li>
              <li>
                <strong>Accessories:</strong> Questions about compatible
                accessories or installation.
              </li>
              <li>
                <strong>Other:</strong> Don’t see your issue? Choose "Other" and
                explain clearly.
              </li>
            </ul>
          </div>

          {/* Right Side - Form */}
          <form
            onSubmit={handleSubmit}
            className="md:col-span-2 space-y-5 bg-white border border-gray-200 rounded-md p-6"
          >
            <div>
              <label className="block font-medium mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full border rounded px-3 py-2 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block font-medium mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full border rounded px-3 py-2 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block font-medium mb-1">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full border rounded px-3 py-2 ${
                  errors.category ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              >
                <option value="">Select category</option>
                <option value="warranty">Warranty</option>
                <option value="return">Return</option>
                <option value="used-part">Used Part Inquiry</option>
                <option value="accessories">Accessories Support</option>
                <option value="other">Other</option>
              </select>
              {errors.category && (
                <p className="text-sm text-red-500">{errors.category}</p>
              )}
              {formData.category && (
                <p className="text-sm text-gray-600 mt-1">
                  {categoryHelpText[formData.category]}
                </p>
              )}
            </div>

            <div>
              <label className="block font-medium mb-1">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full border rounded px-3 py-2 ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            <div>
              <label className="block font-medium mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={5}
                className={`w-full border rounded px-3 py-2 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
            </div>

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded"
            >
              Submit Ticket
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubmitTicketForm;
