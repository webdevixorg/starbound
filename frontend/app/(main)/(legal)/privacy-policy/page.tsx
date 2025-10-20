import React from 'react';
import type { Metadata } from 'next';
import BreadcrumbsComponent from '@/components/Common/Breadcrumbs';

// SEO Metadata
export const metadata: Metadata = {
  title: 'Privacy Policy | Your Company Name',
  description:
    'Learn about how we collect, use, and protect your personal information. Read our comprehensive privacy policy for transparency and your rights.',
  keywords: [
    'privacy policy',
    'data protection',
    'personal information',
    'cookies',
    'GDPR',
  ],
  robots: 'index, follow',
  openGraph: {
    title: 'Privacy Policy | Your Company Name',
    description:
      'Learn about how we collect, use, and protect your personal information.',
    type: 'website',
  },
};

// JSON-LD structured data for better SEO
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Privacy Policy',
  description: 'Privacy policy explaining how we handle personal information',
  publisher: {
    '@type': 'Organization',
    name: process.env.NEXT_PUBLIC_COMPANY_NAME || 'Your Company Name',
  },
};

export default function PrivacyPolicyPage() {
  const companyName =
    process.env.NEXT_PUBLIC_COMPANY_NAME || 'Your Company Name';
  const companyEmail =
    process.env.NEXT_PUBLIC_COMPANY_GENERAL_EMAIL || 'info@company.com';
  const websiteName = process.env.NEXT_PUBLIC_WEBSITE_NAME || 'company.com';

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
            Privacy Policy
          </h1>
          <p className="text-lg text-gray-600">
            Your privacy matters to us. Learn how we protect and handle your
            personal information.
          </p>
        </div>

        {/* Main Content - Full Width */}
        <div className="w-full">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Table of Contents - Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-8 bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Table of Contents
                  </h3>
                  <nav className="space-y-2">
                    <a
                      href="#introduction"
                      className="block text-sm text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      Introduction
                    </a>
                    <a
                      href="#information-collect"
                      className="block text-sm text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      Information We Collect
                    </a>
                    <a
                      href="#how-we-use"
                      className="block text-sm text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      How We Use Information
                    </a>
                    <a
                      href="#sharing-info"
                      className="block text-sm text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      Sharing Information
                    </a>
                    <a
                      href="#cookies"
                      className="block text-sm text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      Cookies & Tracking
                    </a>
                    <a
                      href="#data-security"
                      className="block text-sm text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      Data Security
                    </a>
                    <a
                      href="#your-rights"
                      className="block text-sm text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      Your Rights
                    </a>
                    <a
                      href="#policy-updates"
                      className="block text-sm text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      Policy Updates
                    </a>
                    <a
                      href="#contact"
                      className="block text-sm text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      Contact Us
                    </a>
                  </nav>
                </div>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-3">
                <article className="bg-white rounded-lg border border-gray-200 p-8">
                  <div className="prose prose-lg max-w-none">
                    {/* Introduction */}
                    <section id="introduction" className="mb-12">
                      <h2 className="text-3xl font-bold text-gray-900 mb-6">
                        Introduction
                      </h2>
                      <p className="text-gray-700 leading-relaxed text-lg">
                        At <strong>{websiteName}</strong>, we are committed to
                        protecting your personal information and your right to
                        privacy. If you have any questions or concerns about
                        this privacy notice or our practices with regard to your
                        personal information, please contact us at{' '}
                        <a
                          href={`mailto:${companyEmail}`}
                          className="text-blue-600 hover:text-blue-800 transition-colors font-medium"
                        >
                          {companyEmail}
                        </a>
                        .
                      </p>
                    </section>

                    {/* Information We Collect */}
                    <section id="information-collect" className="mb-12">
                      <h2 className="text-3xl font-bold text-gray-900 mb-6">
                        Information We Collect
                      </h2>
                      <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                        We collect personal information that you voluntarily
                        provide to us when registering on the website,
                        expressing an interest in obtaining information about us
                        or our products and services, or otherwise contacting
                        us.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                          <h3 className="text-xl font-semibold text-blue-900 mb-4">
                            Personal Information You Provide
                          </h3>
                          <ul className="space-y-2 text-blue-800">
                            <li className="flex items-start">
                              <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                              Name and contact information (email, phone number)
                            </li>
                            <li className="flex items-start">
                              <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                              Account credentials (username, password)
                            </li>
                            <li className="flex items-start">
                              <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                              Professional information (resume, work experience)
                            </li>
                            <li className="flex items-start">
                              <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                              Communications you send to us
                            </li>
                          </ul>
                        </div>

                        <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                          <h3 className="text-xl font-semibold text-green-900 mb-4">
                            Information Automatically Collected
                          </h3>
                          <ul className="space-y-2 text-green-800">
                            <li className="flex items-start">
                              <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                              Device and browser information
                            </li>
                            <li className="flex items-start">
                              <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                              IP address and location data
                            </li>
                            <li className="flex items-start">
                              <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                              Usage patterns and preferences
                            </li>
                            <li className="flex items-start">
                              <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                              Cookies and tracking technologies
                            </li>
                          </ul>
                        </div>
                      </div>
                    </section>

                    {/* How We Use Information */}
                    <section id="how-we-use" className="mb-12">
                      <h2 className="text-3xl font-bold text-gray-900 mb-6">
                        How We Use Your Information
                      </h2>
                      <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                        We use personal information collected via our website
                        for a variety of business purposes described below:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                          'Facilitate account creation and login',
                          'Send administrative information',
                          'Protect our services and ensure safety',
                          'Respond to inquiries and provide support',
                          'Improve our website and services',
                          'Comply with legal obligations',
                        ].map((item, index) => (
                          <div
                            key={index}
                            className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                          >
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                                {index + 1}
                              </div>
                              <span className="text-gray-700 font-medium">
                                {item}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* Sharing Information */}
                    <section id="sharing-info" className="mb-12">
                      <h2 className="text-3xl font-bold text-gray-900 mb-6">
                        Sharing Your Information
                      </h2>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                        <div className="flex items-start">
                          <svg
                            className="w-6 h-6 text-yellow-600 mt-1 mr-3 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <div>
                            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                              Important Note
                            </h3>
                            <p className="text-yellow-700">
                              We do not share your personal information with
                              third parties without your consent, except in
                              specific circumstances outlined below.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                          {
                            title: 'Service Providers',
                            desc: 'Who assist in our operations',
                            icon: '🔧',
                          },
                          {
                            title: 'Legal Requirements',
                            desc: 'When required by law or legal process',
                            icon: '⚖️',
                          },
                          {
                            title: 'Safety & Security',
                            desc: 'To protect our rights, property, or safety',
                            icon: '🛡️',
                          },
                          {
                            title: 'Business Transfers',
                            desc: 'In connection with a merger or acquisition',
                            icon: '🤝',
                          },
                        ].map((item, index) => (
                          <div
                            key={index}
                            className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
                          >
                            <div className="text-2xl mb-3">{item.icon}</div>
                            <h4 className="font-semibold text-gray-900 mb-2">
                              {item.title}
                            </h4>
                            <p className="text-gray-600">{item.desc}</p>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* Cookies and Tracking */}
                    <section id="cookies" className="mb-12">
                      <h2 className="text-3xl font-bold text-gray-900 mb-6">
                        Cookies and Tracking Technologies
                      </h2>
                      <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                        We may use cookies and similar tracking technologies to
                        access or store information. You can control cookie
                        preferences through your browser settings.
                      </p>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h4 className="font-semibold text-blue-900 mb-4 text-lg">
                          Cookie Types:
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-white rounded-lg p-4 border border-blue-200">
                            <h5 className="font-medium text-blue-900 mb-2">
                              Essential
                            </h5>
                            <p className="text-sm text-blue-800">
                              Required for website functionality
                            </p>
                          </div>
                          <div className="bg-white rounded-lg p-4 border border-blue-200">
                            <h5 className="font-medium text-blue-900 mb-2">
                              Analytics
                            </h5>
                            <p className="text-sm text-blue-800">
                              Help us understand site usage
                            </p>
                          </div>
                          <div className="bg-white rounded-lg p-4 border border-blue-200">
                            <h5 className="font-medium text-blue-900 mb-2">
                              Preference
                            </h5>
                            <p className="text-sm text-blue-800">
                              Remember your settings
                            </p>
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Data Security */}
                    <section id="data-security" className="mb-12">
                      <h2 className="text-3xl font-bold text-gray-900 mb-6">
                        Data Security
                      </h2>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                        <div className="flex items-start">
                          <svg
                            className="w-8 h-8 text-green-600 mt-1 mr-4 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <div>
                            <h3 className="text-lg font-semibold text-green-900 mb-2">
                              Security Commitment
                            </h3>
                            <p className="text-green-800 text-lg">
                              We implement appropriate technical and
                              organizational security measures to protect your
                              personal information against unauthorized access,
                              alteration, disclosure, or destruction.
                            </p>
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Your Rights */}
                    <section id="your-rights" className="mb-12">
                      <h2 className="text-3xl font-bold text-gray-900 mb-6">
                        Your Privacy Rights
                      </h2>
                      <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                        Depending on your location, you may have the following
                        rights:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                          {
                            right: 'Access',
                            desc: 'to your personal information',
                            icon: '👁️',
                          },
                          {
                            right: 'Correction',
                            desc: 'of inaccurate data',
                            icon: '✏️',
                          },
                          {
                            right: 'Deletion',
                            desc: 'of your personal information',
                            icon: '🗑️',
                          },
                          {
                            right: 'Portability',
                            desc: 'of your data',
                            icon: '📦',
                          },
                          {
                            right: 'Opt-out',
                            desc: 'of marketing communications',
                            icon: '🚫',
                          },
                          {
                            right: 'Withdraw',
                            desc: 'consent at any time',
                            icon: '↩️',
                          },
                        ].map((item, index) => (
                          <div
                            key={index}
                            className="bg-purple-50 border border-purple-200 rounded-lg p-4"
                          >
                            <div className="text-2xl mb-2">{item.icon}</div>
                            <h4 className="font-semibold text-purple-900 mb-1">
                              {item.right}
                            </h4>
                            <p className="text-purple-700 text-sm">
                              {item.desc}
                            </p>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* Policy Updates */}
                    <section id="policy-updates" className="mb-12">
                      <h2 className="text-3xl font-bold text-gray-900 mb-6">
                        Policy Updates
                      </h2>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                        <p className="text-gray-700 leading-relaxed text-lg">
                          We may update this privacy policy from time to time.
                          We will notify you of any changes by posting the new
                          policy on this page and updating the "Last updated"
                          date at the top of this page.
                        </p>
                      </div>
                    </section>

                    {/* Contact Information */}
                    <section
                      id="contact"
                      className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8 border border-blue-200"
                    >
                      <h2 className="text-3xl font-bold text-gray-900 mb-6">
                        Contact Us
                      </h2>
                      <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                        If you have questions or comments about this policy, you
                        may contact us:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-lg p-6 border border-gray-200">
                          <div className="text-center">
                            <div className="text-3xl mb-3">📧</div>
                            <h4 className="font-semibold text-gray-900 mb-2">
                              Email
                            </h4>
                            <a
                              href={`mailto:${companyEmail}`}
                              className="text-blue-600 hover:text-blue-800 transition-colors font-medium"
                            >
                              {companyEmail}
                            </a>
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-6 border border-gray-200">
                          <div className="text-center">
                            <div className="text-3xl mb-3">🏢</div>
                            <h4 className="font-semibold text-gray-900 mb-2">
                              Company
                            </h4>
                            <p className="text-gray-700">{companyName}</p>
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-6 border border-gray-200">
                          <div className="text-center">
                            <div className="text-3xl mb-3">🌐</div>
                            <h4 className="font-semibold text-gray-900 mb-2">
                              Website
                            </h4>
                            <p className="text-gray-700">{websiteName}</p>
                          </div>
                        </div>
                      </div>
                    </section>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
