import React from 'react';
import type { Metadata } from 'next';
import BreadcrumbsComponent from '@/components/Common/Breadcrumbs';

// SEO Metadata
export const metadata: Metadata = {
  title: 'Terms of Use | Starbound',
  description:
    'Read our terms of use, user agreements, and conditions for using Starbound services. Learn about your rights and responsibilities.',
  keywords: [
    'terms of use',
    'user agreement',
    'terms and conditions',
    'legal',
    'starbound',
    'service terms',
  ],
  robots: 'index, follow',
  openGraph: {
    title: 'Terms of Use | Starbound',
    description:
      'Read our terms of use and user agreements for Starbound services.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Terms of Use | Starbound',
    description:
      'Read our terms of use and user agreements for Starbound services.',
  },
};

// JSON-LD structured data for better SEO
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Terms of Use',
  description: 'Terms of use and user agreements for Starbound services',
  publisher: {
    '@type': 'Organization',
    name: 'Starbound',
  },
};

export default function TermsOfUsePage() {
  const companyName = process.env.NEXT_PUBLIC_COMPANY_NAME || 'Starbound';
  const companyEmail =
    process.env.NEXT_PUBLIC_COMPANY_GENERAL_EMAIL || 'info@starbound.com';
  const websiteName = process.env.NEXT_PUBLIC_WEBSITE_NAME || 'starbound.com';
  const websiteUrl =
    process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://starbound.com';

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
            Terms of Use
          </h1>
          <p className="text-lg text-gray-600">
            Welcome to Starbound. These terms govern your use of our services
            and establish our mutual rights and responsibilities.
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
                      href="#acceptance"
                      className="block text-sm text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      Acceptance of Terms
                    </a>
                    <a
                      href="#use-of-service"
                      className="block text-sm text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      Use of Service
                    </a>
                    <a
                      href="#user-accounts"
                      className="block text-sm text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      User Accounts
                    </a>
                    <a
                      href="#prohibited-uses"
                      className="block text-sm text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      Prohibited Uses
                    </a>
                    <a
                      href="#intellectual-property"
                      className="block text-sm text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      Intellectual Property
                    </a>
                    <a
                      href="#user-content"
                      className="block text-sm text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      User Content
                    </a>
                    <a
                      href="#disclaimers"
                      className="block text-sm text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      Disclaimers
                    </a>
                    <a
                      href="#limitation-liability"
                      className="block text-sm text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      Limitation of Liability
                    </a>
                    <a
                      href="#termination"
                      className="block text-sm text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      Termination
                    </a>
                    <a
                      href="#changes-terms"
                      className="block text-sm text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      Changes to Terms
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
                    {/* Acceptance of Terms */}
                    <section id="acceptance" className="mb-12">
                      <h2 className="text-3xl font-bold text-gray-900 mb-6">
                        Acceptance of Terms
                      </h2>
                      <p className="text-gray-700 leading-relaxed text-lg mb-6">
                        By accessing and using <strong>{websiteName}</strong>,
                        you accept and agree to be bound by the terms and
                        provision of this agreement. If you do not agree to
                        abide by the above, please do not use this service.
                      </p>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <div className="flex items-start">
                          <svg
                            className="w-6 h-6 text-blue-600 mt-1 mr-3 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <div>
                            <h3 className="text-lg font-semibold text-blue-900 mb-2">
                              Important Notice
                            </h3>
                            <p className="text-blue-800">
                              By using our services, you confirm that you are at
                              least 18 years old or have parental consent, and
                              you have the legal capacity to enter into this
                              agreement.
                            </p>
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Use of Service */}
                    <section id="use-of-service" className="mb-12">
                      <h2 className="text-3xl font-bold text-gray-900 mb-6">
                        Use of Service
                      </h2>
                      <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                        You agree to use our service for lawful purposes only
                        and in accordance with these Terms of Use.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                          <h3 className="text-xl font-semibold text-green-900 mb-4">
                            ✅ Permitted Uses
                          </h3>
                          <ul className="space-y-2 text-green-800">
                            <li className="flex items-start">
                              <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                              Browse and search products
                            </li>
                            <li className="flex items-start">
                              <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                              Create user accounts
                            </li>
                            <li className="flex items-start">
                              <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                              Post legitimate content
                            </li>
                            <li className="flex items-start">
                              <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                              Communicate with other users
                            </li>
                          </ul>
                        </div>

                        <div className="bg-red-50 rounded-lg p-6 border border-red-200">
                          <h3 className="text-xl font-semibold text-red-900 mb-4">
                            ❌ Prohibited Uses
                          </h3>
                          <ul className="space-y-2 text-red-800">
                            <li className="flex items-start">
                              <span className="w-2 h-2 bg-red-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                              Spam or unsolicited messages
                            </li>
                            <li className="flex items-start">
                              <span className="w-2 h-2 bg-red-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                              Fraudulent activities
                            </li>
                            <li className="flex items-start">
                              <span className="w-2 h-2 bg-red-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                              Harassment or abuse
                            </li>
                            <li className="flex items-start">
                              <span className="w-2 h-2 bg-red-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                              Violating laws or regulations
                            </li>
                          </ul>
                        </div>
                      </div>
                    </section>

                    {/* User Accounts */}
                    <section id="user-accounts" className="mb-12">
                      <h2 className="text-3xl font-bold text-gray-900 mb-6">
                        User Accounts
                      </h2>
                      <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                        When you create an account with us, you must provide
                        information that is accurate, complete, and current at
                        all times.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          {
                            title: 'Account Security',
                            desc: 'You are responsible for safeguarding your password',
                            icon: '🔐',
                          },
                          {
                            title: 'Accurate Information',
                            desc: 'Provide truthful and up-to-date details',
                            icon: '✅',
                          },
                          {
                            title: 'Single Account',
                            desc: 'One account per person unless authorized',
                            icon: '👤',
                          },
                        ].map((item, index) => (
                          <div
                            key={index}
                            className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                          >
                            <div className="text-2xl mb-3">{item.icon}</div>
                            <h4 className="font-semibold text-gray-900 mb-2">
                              {item.title}
                            </h4>
                            <p className="text-gray-600 text-sm">{item.desc}</p>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* Prohibited Uses */}
                    <section id="prohibited-uses" className="mb-12">
                      <h2 className="text-3xl font-bold text-gray-900 mb-6">
                        Prohibited Uses
                      </h2>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                        <div className="flex items-start">
                          <svg
                            className="w-6 h-6 text-red-600 mt-1 mr-3 flex-shrink-0"
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
                            <h3 className="text-lg font-semibold text-red-800 mb-2">
                              Strictly Prohibited Activities
                            </h3>
                            <p className="text-red-700">
                              The following activities may result in immediate
                              account suspension or termination.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                          {
                            category: 'Illegal Content',
                            items: [
                              'Child exploitation',
                              'Terrorism support',
                              'Drug trafficking',
                              'Money laundering',
                            ],
                            icon: '⚖️',
                          },
                          {
                            category: 'Harmful Behavior',
                            items: [
                              'Harassment',
                              'Hate speech',
                              'Bullying',
                              'Threats',
                            ],
                            icon: '🚫',
                          },
                          {
                            category: 'Technical Violations',
                            items: [
                              'Hacking attempts',
                              'Malware distribution',
                              'System manipulation',
                              'Data scraping',
                            ],
                            icon: '💻',
                          },
                          {
                            category: 'Commercial Abuse',
                            items: [
                              'Spam posting',
                              'Fake reviews',
                              'Price manipulation',
                              'Unauthorized sales',
                            ],
                            icon: '💰',
                          },
                        ].map((item, index) => (
                          <div
                            key={index}
                            className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
                          >
                            <div className="text-2xl mb-3">{item.icon}</div>
                            <h4 className="font-semibold text-gray-900 mb-3">
                              {item.category}
                            </h4>
                            <ul className="space-y-1">
                              {item.items.map((subItem, subIndex) => (
                                <li
                                  key={subIndex}
                                  className="text-gray-600 text-sm flex items-center"
                                >
                                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full mr-2"></span>
                                  {subItem}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* Intellectual Property */}
                    <section id="intellectual-property" className="mb-12">
                      <h2 className="text-3xl font-bold text-gray-900 mb-6">
                        Intellectual Property Rights
                      </h2>
                      <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                        The service and its original content, features, and
                        functionality are and will remain the exclusive property
                        of {companyName} and its licensors.
                      </p>

                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                        <h4 className="font-semibold text-purple-900 mb-4 text-lg">
                          Protected Elements:
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          {[
                            'Trademarks',
                            'Copyrights',
                            'Trade Secrets',
                            'Patents',
                          ].map((item, index) => (
                            <div
                              key={index}
                              className="bg-white rounded-lg p-4 border border-purple-200 text-center"
                            >
                              <h5 className="font-medium text-purple-900 mb-2">
                                {item}
                              </h5>
                              <div className="text-purple-600 text-2xl">©</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </section>

                    {/* User Content */}
                    <section id="user-content" className="mb-12">
                      <h2 className="text-3xl font-bold text-gray-900 mb-6">
                        User-Generated Content
                      </h2>
                      <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                        By posting content on our platform, you grant us certain
                        rights while retaining ownership of your content.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                          <h4 className="font-semibold text-blue-900 mb-4">
                            Your Rights
                          </h4>
                          <ul className="space-y-2 text-blue-800">
                            <li>• Retain ownership of your content</li>
                            <li>• Control privacy settings</li>
                            <li>• Delete your content anytime</li>
                            <li>• Report inappropriate content</li>
                          </ul>
                        </div>
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                          <h4 className="font-semibold text-orange-900 mb-4">
                            Your Responsibilities
                          </h4>
                          <ul className="space-y-2 text-orange-800">
                            <li>• Ensure content legality</li>
                            <li>• Respect others' rights</li>
                            <li>• Provide accurate information</li>
                            <li>• Follow community guidelines</li>
                          </ul>
                        </div>
                      </div>
                    </section>

                    {/* Disclaimers */}
                    <section id="disclaimers" className="mb-12">
                      <h2 className="text-3xl font-bold text-gray-900 mb-6">
                        Disclaimers and Warranties
                      </h2>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                        <div className="flex items-start">
                          <svg
                            className="w-8 h-8 text-yellow-600 mt-1 mr-4 flex-shrink-0"
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
                            <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                              "As Is" Service
                            </h3>
                            <p className="text-yellow-800 text-lg">
                              Our service is provided "as is" without warranties
                              of any kind, either express or implied. We do not
                              warrant that the service will be uninterrupted,
                              secure, or error-free.
                            </p>
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Limitation of Liability */}
                    <section id="limitation-liability" className="mb-12">
                      <h2 className="text-3xl font-bold text-gray-900 mb-6">
                        Limitation of Liability
                      </h2>
                      <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                        In no event shall {companyName} be liable for any
                        indirect, incidental, special, consequential, or
                        punitive damages.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                          {
                            type: 'Direct Damages',
                            limit: 'Limited',
                            color: 'blue',
                          },
                          {
                            type: 'Indirect Damages',
                            limit: 'Excluded',
                            color: 'red',
                          },
                          {
                            type: 'Loss of Profits',
                            limit: 'Excluded',
                            color: 'red',
                          },
                          {
                            type: 'Data Loss',
                            limit: 'Limited',
                            color: 'yellow',
                          },
                        ].map((item, index) => (
                          <div
                            key={index}
                            className={`bg-${item.color}-50 border border-${item.color}-200 rounded-lg p-4`}
                          >
                            <h4
                              className={`font-semibold text-${item.color}-900 mb-2 text-sm`}
                            >
                              {item.type}
                            </h4>
                            <p className={`text-${item.color}-700 font-medium`}>
                              {item.limit}
                            </p>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* Termination */}
                    <section id="termination" className="mb-12">
                      <h2 className="text-3xl font-bold text-gray-900 mb-6">
                        Termination
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                          <h4 className="font-semibold text-gray-900 mb-4">
                            You May Terminate
                          </h4>
                          <ul className="space-y-2 text-gray-700">
                            <li>• Close your account anytime</li>
                            <li>• Stop using our services</li>
                            <li>• Request data deletion</li>
                          </ul>
                        </div>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                          <h4 className="font-semibold text-red-900 mb-4">
                            We May Terminate
                          </h4>
                          <ul className="space-y-2 text-red-800">
                            <li>• For violation of terms</li>
                            <li>• For illegal activities</li>
                            <li>• At our discretion with notice</li>
                          </ul>
                        </div>
                      </div>
                    </section>

                    {/* Changes to Terms */}
                    <section id="changes-terms" className="mb-12">
                      <h2 className="text-3xl font-bold text-gray-900 mb-6">
                        Changes to These Terms
                      </h2>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                        <p className="text-gray-700 leading-relaxed text-lg">
                          We reserve the right to modify these terms at any
                          time. We will notify users of any material changes via
                          email or prominent notice on our website. Continued
                          use after changes constitutes acceptance of the
                          modified terms.
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
                        If you have questions about these Terms of Use, please
                        contact us:
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
