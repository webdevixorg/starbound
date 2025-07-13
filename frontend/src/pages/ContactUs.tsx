import React, { useState } from 'react';
import emailjs from '@emailjs/browser';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setSuccess(null);
    setError(null);

    try {
      const now = new Date();
      const formattedDateTime = now.toLocaleString();

      const templateParams = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
        time: formattedDateTime, // Add time to params
      };

      const serviceID = 'service_anpa0zv';
      const templateID = 'template_gzsxzqj'; // Update this with your actual template ID
      const publicKey = 'X1AOdjNG_v4o0ZUC6';

      await emailjs.send(serviceID, templateID, templateParams, publicKey);

      setSuccess(`Message sent successfully at ${formattedDateTime}!`);
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: '',
      });
    } catch (err) {
      setError('Failed to send message. Please try again.');
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="container my-10 px-4 py-10 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-6">Contact Us</h1>
      <p className="text-gray-700 text-lg mb-10">
        Have a question, suggestion, or just want to say hello? Fill out the
        form below and we’ll get back to you as soon as possible.
      </p>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 bg-white p-8 rounded border"
      >
        <div>
          <label className="block font-medium mb-1">Full Name</label>
          <input
            name="name"
            type="text"
            required
            className="w-full border px-4 py-2 rounded"
            value={formData.name}
            onChange={handleChange}
            disabled={sending}
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Email</label>
          <input
            name="email"
            type="email"
            required
            className="w-full border px-4 py-2 rounded"
            value={formData.email}
            onChange={handleChange}
            disabled={sending}
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Phone</label>
          <input
            name="phone"
            type="tel"
            required
            className="w-full border px-4 py-2 rounded"
            value={formData.phone}
            onChange={handleChange}
            disabled={sending}
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Message</label>
          <textarea
            name="message"
            rows={5}
            required
            className="w-full border px-4 py-2 rounded"
            value={formData.message}
            onChange={handleChange}
            disabled={sending}
          />
        </div>

        {error && <p className="text-red-600 font-semibold">{error}</p>}
        {success && <p className="text-green-600 font-semibold">{success}</p>}

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
          disabled={sending}
        >
          {sending ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  );
};

export default Contact;
