'use client';

import React, { useState } from 'react';
import emailjs from '@emailjs/browser';

interface ContactFormProps {
  companyEmail: string;
  supportEmail: string;
  companyPhone: string;
}

const ContactForm: React.FC<ContactFormProps> = ({
  supportEmail,
  companyPhone,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'general',
    message: '',
  });

  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
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
        subject: formData.subject,
        message: formData.message,
        time: formattedDateTime,
      };

      const serviceID = 'service_anpa0zv';
      const templateID = 'template_gzsxzqj';
      const publicKey = 'X1AOdjNG_v4o0ZUC6';

      await emailjs.send(serviceID, templateID, templateParams, publicKey);

      setSuccess(`Message sent successfully at ${formattedDateTime}!`);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: 'general',
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
    <div className="max-w-none">
      {/* Contact Form Section */}
      <section id="contact-form" className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          Send us a Message
        </h2>
        <p className="text-gray-700 leading-relaxed text-lg mb-8">
          Fill out the form below and we&apos;ll get back to you as soon as
          possible. We typically respond within 24 hours during business days.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Full Name *
              </label>
              <input
                name="name"
                type="text"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                disabled={sending}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Email Address *
              </label>
              <input
                name="email"
                type="email"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleChange}
                disabled={sending}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Phone Number
              </label>
              <input
                name="phone"
                type="tel"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
                disabled={sending}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Subject *
              </label>
              <select
                name="subject"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={formData.subject}
                onChange={handleChange}
                disabled={sending}
              >
                <option value="general">General Inquiry</option>
                <option value="support">Technical Support</option>
                <option value="billing">Billing Question</option>
                <option value="feedback">Feedback</option>
                <option value="partnership">Partnership</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Message *
            </label>
            <textarea
              name="message"
              rows={6}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-vertical"
              placeholder="Tell us how we can help you..."
              value={formData.message}
              onChange={handleChange}
              disabled={sending}
            />
          </div>

          {/* Status Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-green-800 font-medium">{success}</p>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold px-8 py-3 rounded-lg transition-colors flex items-center justify-center"
            disabled={sending}
          >
            {sending ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Sending...
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
                Send Message
              </>
            )}
          </button>
        </form>
      </section>

      {/* Additional Information */}
      <section id="support-hours" className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          Other Ways to Reach Us
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h4 className="font-semibold text-blue-900 mb-4">For Support</h4>
            <p className="text-blue-800 mb-4">
              Need technical help or have account issues? Our support team is
              ready to assist.
            </p>
            <a
              href={`mailto:${supportEmail}`}
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              {supportEmail}
            </a>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h4 className="font-semibold text-green-900 mb-4">
              Emergency Contact
            </h4>
            <p className="text-green-800 mb-4">
              For urgent matters outside business hours, call our emergency
              line.
            </p>
            <a
              href={`tel:${companyPhone}`}
              className="inline-flex items-center text-green-600 hover:text-green-800 font-medium"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              {companyPhone}
            </a>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section
        id="faq"
        className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-8 border border-gray-200"
      >
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          Frequently Asked Questions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">
              How quickly do you respond?
            </h4>
            <p className="text-gray-700 text-sm mb-4">
              We typically respond to all inquiries within 24 hours during
              business days.
            </p>

            <h4 className="font-semibold text-gray-900 mb-2">
              Do you offer phone support?
            </h4>
            <p className="text-gray-700 text-sm">
              Yes, phone support is available during business hours for urgent
              matters.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">
              Can I schedule a call?
            </h4>
            <p className="text-gray-700 text-sm mb-4">
              Absolutely! Mention your preferred time in the message and
              we&apos;ll arrange a call.
            </p>

            <h4 className="font-semibold text-gray-900 mb-2">
              Do you have a help center?
            </h4>
            <p className="text-gray-700 text-sm">
              Yes, visit our help center for common questions and self-service
              options.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactForm;
