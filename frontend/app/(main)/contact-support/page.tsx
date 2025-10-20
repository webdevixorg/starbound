import React from 'react';
import type { Metadata } from 'next';
import BreadcrumbsComponent from '@/components/Common/Breadcrumbs';
import ContactForm from '@/components/Forms/ContactForm';

// SEO Metadata
export const metadata: Metadata = {
  title: 'Contact Us | Starbound',
  description:
    "Get in touch with Starbound. Send us your questions, feedback, or support requests. We're here to help you.",
  keywords: [
    'contact',
    'support',
    'help',
    'customer service',
    'starbound',
    'get in touch',
  ],
  robots: 'index, follow',
  openGraph: {
    title: 'Contact Us | Starbound',
    description: "Get in touch with Starbound. We're here to help you.",
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Contact Us | Starbound',
    description: "Get in touch with Starbound. We're here to help you.",
  },
};

// JSON-LD structured data for better SEO
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: 'Contact Us',
  description: 'Contact page for Starbound customer support and inquiries',
  publisher: {
    '@type': 'Organization',
    name: 'Starbound',
  },
};

export default function ContactPage() {
  const companyEmail =
    process.env.NEXT_PUBLIC_COMPANY_GENERAL_EMAIL || 'info@starbound.com';
  const supportEmail =
    process.env.NEXT_PUBLIC_COMPANY_SUPPORT_EMAIL || 'support@starbound.com';
  const companyPhone = process.env.NEXT_PUBLIC_COMPANY_PHONE || '+1-555-0123';
  const companyAddress =
    process.env.NEXT_PUBLIC_COMPANY_ADDRESS ||
    '123 Business Street, City, State 12345';

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Full Width Layout */}
      <div className="w-full bg-white min-h-screen">
        {/* Breadcrumbs Section */}
        <div className="w-full bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <BreadcrumbsComponent />
          </div>
        </div>

        {/* Page Header */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-left my-2">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Contact Us
          </h1>
          <p className="text-lg text-gray-600">
            Have a question, suggestion, or need support? We're here to help.
            Get in touch with us using the form below or through our direct
            contact information.
          </p>
        </div>

        {/* Main Content - Full Width */}
        <div className="w-full">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Contact Information - Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-8 space-y-6">
                  {/* Contact Info Card */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Contact Information
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <div className="text-blue-600 mr-3 mt-1">
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Email</h4>
                          <a
                            href={`mailto:${companyEmail}`}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            {companyEmail}
                          </a>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="text-green-600 mr-3 mt-1">
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Phone</h4>
                          <a
                            href={`tel:${companyPhone}`}
                            className="text-green-600 hover:text-green-800 text-sm"
                          >
                            {companyPhone}
                          </a>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="text-purple-600 mr-3 mt-1">
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Address</h4>
                          <p className="text-gray-600 text-sm">
                            {companyAddress}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Links Card */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Quick Links
                    </h3>
                    <nav className="space-y-2">
                      <a
                        href="#contact-form"
                        className="block text-sm text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        Contact Form
                      </a>
                      <a
                        href="#support-hours"
                        className="block text-sm text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        Support Hours
                      </a>
                      <a
                        href="#faq"
                        className="block text-sm text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        FAQ
                      </a>
                      <a
                        href="/help"
                        className="block text-sm text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        Help Center
                      </a>
                    </nav>
                  </div>

                  {/* Support Hours Card */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4">
                      Support Hours
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-blue-800">Monday - Friday</span>
                        <span className="text-blue-700 font-medium">
                          9:00 AM - 6:00 PM
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-800">Saturday</span>
                        <span className="text-blue-700 font-medium">
                          10:00 AM - 4:00 PM
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-800">Sunday</span>
                        <span className="text-blue-700 font-medium">
                          Closed
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-3">
                <article className="bg-white rounded-lg border border-gray-200 p-8">
                  <ContactForm
                    companyEmail={companyEmail}
                    supportEmail={supportEmail}
                    companyPhone={companyPhone}
                  />
                </article>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
