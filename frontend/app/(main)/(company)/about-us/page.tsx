import React from 'react';
import type { Metadata } from 'next';
import BreadcrumbsComponent from '@/components/Common/Breadcrumbs';

// SEO Metadata
export const metadata: Metadata = {
  title: 'About Us | Logivis Automotive',
  description:
    "Learn about Logivis Automotive's mission to revolutionize vehicle care in Sri Lanka. Discover our story, services, and commitment to excellence since 2024.",
  keywords: [
    'logivis automotive',
    'about us',
    'sri lanka automotive',
    'vehicle care',
    'car repair',
    'automotive services',
    'spare parts',
    'company story',
  ],
  robots: 'index, follow',
  openGraph: {
    title: 'About Us | Logivis Automotive',
    description:
      "Learn about Logivis Automotive's mission to revolutionize vehicle care in Sri Lanka.",
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'About Us | Logivis Automotive',
    description:
      "Learn about Logivis Automotive's mission to revolutionize vehicle care in Sri Lanka.",
  },
};

// JSON-LD structured data for better SEO
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: 'About Logivis Automotive',
  description:
    'About Logivis Automotive - revolutionizing vehicle care in Sri Lanka',
  publisher: {
    '@type': 'Organization',
    name: 'Logivis Automotive',
    foundingDate: '2024-02-28',
    description:
      'Leading automotive service provider in Sri Lanka specializing in vehicle care, repair services, and genuine spare parts',
    areaServed: 'Sri Lanka',
    serviceType: [
      'Automotive Repair',
      'Spare Parts',
      'Vehicle Maintenance',
      'EV Services',
    ],
  },
};

export default function AboutUsPage() {
  const companyName =
    process.env.NEXT_PUBLIC_COMPANY_NAME || 'Logivis Automotive';
  const foundingDate = 'February 28, 2024';

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
            About Logivis Automotive
          </h1>
          <p className="text-lg text-gray-600">
            Revolutionizing vehicle care in Sri Lanka through precision,
            reliability, and exceptional customer service since 2024.
          </p>
        </div>

        {/* Main Content - Full Width */}
        <div className="w-full">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Table of Contents - Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-8 space-y-6">
                  {/* Quick Navigation */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Quick Navigation
                    </h3>
                    <nav className="space-y-2">
                      <a
                        href="#who-we-are"
                        className="block text-sm text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        🏢 Who We Are
                      </a>
                      <a
                        href="#what-we-offer"
                        className="block text-sm text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        🛠️ What We Offer
                      </a>
                      <a
                        href="#our-mission"
                        className="block text-sm text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        🎯 Our Mission
                      </a>
                      <a
                        href="#our-vision"
                        className="block text-sm text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        🔮 Our Vision
                      </a>
                      <a
                        href="#future-goals"
                        className="block text-sm text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        🚀 Future Goals
                      </a>
                      <a
                        href="#sri-lanka-challenges"
                        className="block text-sm text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        🇱🇰 Our Impact
                      </a>
                      <a
                        href="#contact-us"
                        className="block text-sm text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        📞 Contact Us
                      </a>
                    </nav>
                  </div>

                  {/* Company Stats */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4">
                      Company Stats
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-blue-800">Founded</span>
                        <span className="text-blue-700 font-medium">2024</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-800">Services</span>
                        <span className="text-blue-700 font-medium">8+</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-800">Focus</span>
                        <span className="text-blue-700 font-medium">
                          Sri Lanka
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-800">Specialty</span>
                        <span className="text-blue-700 font-medium">
                          Automotive
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-3">
                <article className="bg-white rounded-lg border border-gray-200 p-8">
                  <div className="prose prose-lg max-w-none">
                    {/* Company Introduction */}
                    <section id="who-we-are" className="mb-12">
                      <h2 className="text-3xl font-bold text-gray-900 mb-6">
                        Who We Are
                      </h2>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                        <div className="flex items-start">
                          <svg
                            className="w-8 h-8 text-blue-600 mt-1 mr-4 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <div>
                            <h3 className="text-lg font-semibold text-blue-900 mb-2">
                              🚗 Founded {foundingDate}
                            </h3>
                            <p className="text-blue-800">
                              Born from a genuine passion to elevate vehicle
                              care in Sri Lanka through innovation and
                              excellence.
                            </p>
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-700 leading-relaxed text-lg mb-6">
                        Founded on {foundingDate},{' '}
                        <strong>Logivis Automotive</strong> was born from a
                        genuine passion to elevate vehicle care in Sri Lanka.
                        Our mission is to revolutionize the automotive service
                        experience through tailored solutions grounded in
                        precision, reliability, and customer satisfaction.
                      </p>

                      <p className="text-gray-700 leading-relaxed text-lg mb-6">
                        We strive to empower our clients with essential
                        knowledge, becoming their trusted partner in vehicle
                        ownership. While we currently focus on online sales, we
                        are actively working toward opening a physical repair
                        center and store to meet the growing needs of our
                        customers.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        {[
                          {
                            title: 'Precision',
                            desc: 'Accurate diagnostics and expert solutions',
                            icon: '🎯',
                          },
                          {
                            title: 'Reliability',
                            desc: 'Trusted service you can count on',
                            icon: '🛡️',
                          },
                          {
                            title: 'Innovation',
                            desc: 'Future-ready automotive solutions',
                            icon: '⚡',
                          },
                        ].map((value, index) => (
                          <div
                            key={index}
                            className="bg-gray-50 rounded-lg p-6 border border-gray-200 text-center"
                          >
                            <div className="text-3xl mb-3">{value.icon}</div>
                            <h4 className="font-semibold text-gray-900 mb-2">
                              {value.title}
                            </h4>
                            <p className="text-gray-600 text-sm">
                              {value.desc}
                            </p>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* Mission & Vision */}
                    <section className="mb-12">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-8 border border-blue-200">
                          <div className="text-4xl mb-4">🎯</div>
                          <h3
                            className="text-2xl font-bold text-blue-900 mb-4"
                            id="our-mission"
                          >
                            Our Mission
                          </h3>
                          <p className="text-blue-800 leading-relaxed">
                            To revolutionize the automotive service experience
                            through tailored solutions grounded in precision,
                            reliability, and customer satisfaction. We empower
                            our clients with essential knowledge, becoming their
                            trusted partner in vehicle ownership.
                          </p>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-8 border border-green-200">
                          <div className="text-4xl mb-4">🔮</div>
                          <h3
                            className="text-2xl font-bold text-green-900 mb-4"
                            id="our-vision"
                          >
                            Our Vision
                          </h3>
                          <p className="text-green-800 leading-relaxed">
                            To be Sri Lanka's leading automotive service
                            provider—renowned for excellence, innovation, and a
                            relentless commitment to raising service standards
                            and building lasting relationships.
                          </p>
                        </div>
                      </div>
                    </section>

                    {/* What We Offer */}
                    <section id="what-we-offer" className="mb-12">
                      <h2 className="text-3xl font-bold text-gray-900 mb-6">
                        What We Offer
                      </h2>
                      <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                        Our comprehensive range of automotive services is
                        designed to meet all your vehicle care needs with the
                        highest quality standards.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                          {
                            title: 'Genuine Spare Parts',
                            desc: 'High-quality, authentic parts for cars and vans',
                            icon: '🔧',
                            features: [
                              'OEM quality parts',
                              'Wide compatibility',
                              'Warranty included',
                              'Fast delivery',
                            ],
                          },
                          {
                            title: 'Repair Services',
                            desc: 'Comprehensive diagnostics, maintenance, and repair solutions',
                            icon: '🔨',
                            features: [
                              'Expert diagnostics',
                              'All vehicle models',
                              'Professional maintenance',
                              'Quality repairs',
                            ],
                          },
                          {
                            title: 'Vehicle Optimization',
                            desc: 'Performance upgrades and engine tuning services',
                            icon: '⚡',
                            features: [
                              'Performance tuning',
                              'Engine optimization',
                              'ECU remapping',
                              'Power upgrades',
                            ],
                          },
                          {
                            title: 'EV Charging Solutions',
                            desc: 'Future-ready charging stations for electric vehicles',
                            icon: '🔋',
                            features: [
                              'Fast charging',
                              'Home installation',
                              'Commercial solutions',
                              'Maintenance support',
                            ],
                          },
                          {
                            title: 'Professional Detailing',
                            desc: 'Interior & exterior detailing with advanced paint protection',
                            icon: '✨',
                            features: [
                              'Interior cleaning',
                              'Exterior polishing',
                              'Paint protection',
                              'Ceramic coating',
                            ],
                          },
                          {
                            title: 'Complete Tire Care',
                            desc: 'Installation, alignment, balancing, and repairs',
                            icon: '🛞',
                            features: [
                              'Tire installation',
                              'Wheel alignment',
                              'Balancing service',
                              'Tire repairs',
                            ],
                          },
                          {
                            title: 'Expert Consultations',
                            desc: "Professional advice tailored to each customer's needs",
                            icon: '💡',
                            features: [
                              'Vehicle assessment',
                              'Maintenance planning',
                              'Cost optimization',
                              'Technical advice',
                            ],
                          },
                          {
                            title: 'Educational Content',
                            desc: 'Empowering users with car care knowledge through digital content',
                            icon: '📚',
                            features: [
                              'How-to guides',
                              'Video tutorials',
                              'Maintenance tips',
                              'Industry insights',
                            ],
                          },
                        ].map((service, index) => (
                          <div
                            key={index}
                            className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                          >
                            <div className="text-3xl mb-4">{service.icon}</div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">
                              {service.title}
                            </h3>
                            <p className="text-gray-600 mb-4">{service.desc}</p>
                            <ul className="space-y-2">
                              {service.features.map((feature, featureIndex) => (
                                <li
                                  key={featureIndex}
                                  className="flex items-center text-sm text-gray-600"
                                >
                                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 flex-shrink-0"></span>
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* Future Goals */}
                    <section id="future-goals" className="mb-12">
                      <h2 className="text-3xl font-bold text-gray-900 mb-6">
                        Our Future Goals
                      </h2>
                      <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                        We're constantly evolving and expanding our capabilities
                        to better serve Sri Lanka's automotive community.
                      </p>

                      <div className="space-y-6">
                        {[
                          {
                            title: 'Physical Service Centers',
                            desc: 'Expand into brick-and-mortar repair centers and retail stores across Sri Lanka',
                            timeline: 'Q2 2024',
                            status: 'In Progress',
                            icon: '🏢',
                          },
                          {
                            title: 'Community Programs',
                            desc: 'Launch workshops, educational programs, and community outreach initiatives',
                            timeline: 'Q3 2024',
                            status: 'Planning',
                            icon: '👥',
                          },
                          {
                            title: 'Advanced Technology',
                            desc: 'Introduce new services aligned with future vehicle technologies and EV expansion',
                            timeline: 'Q4 2024',
                            status: 'Research',
                            icon: '🚗',
                          },
                        ].map((goal, index) => (
                          <div
                            key={index}
                            className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start flex-1">
                                <div className="text-3xl mr-4">{goal.icon}</div>
                                <div className="flex-1">
                                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                    {goal.title}
                                  </h4>
                                  <p className="text-gray-600 mb-3">
                                    {goal.desc}
                                  </p>
                                  <div className="flex items-center space-x-4 text-sm">
                                    <span className="text-gray-500">
                                      📅 {goal.timeline}
                                    </span>
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        goal.status === 'In Progress'
                                          ? 'bg-yellow-100 text-yellow-800'
                                          : goal.status === 'Planning'
                                          ? 'bg-blue-100 text-blue-800'
                                          : 'bg-gray-100 text-gray-800'
                                      }`}
                                    >
                                      {goal.status}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* Addressing Sri Lanka's Challenges */}
                    <section id="sri-lanka-challenges" className="mb-12">
                      <h2 className="text-3xl font-bold text-gray-900 mb-6">
                        Addressing Sri Lanka's Automotive Challenges
                      </h2>
                      <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                        Logivis Automotive is more than a service provider—we
                        are a problem solver, addressing key challenges in Sri
                        Lanka's automotive industry.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                          {
                            challenge: 'Efficient Services',
                            solution:
                              'Streamlined processes to reduce wait times and improve customer satisfaction',
                            impact: 'Faster service delivery',
                            icon: '⚡',
                          },
                          {
                            challenge: 'Trusted Repairs',
                            solution:
                              'Reliable, transparent service from trained professionals',
                            impact: 'Increased customer confidence',
                            icon: '🛡️',
                          },
                          {
                            challenge: 'Genuine Parts',
                            solution:
                              'Only authentic components to ensure vehicle safety and longevity',
                            impact: 'Enhanced vehicle reliability',
                            icon: '✅',
                          },
                          {
                            challenge: 'Sustainability',
                            solution:
                              'EV support and eco-conscious practices for a greener future',
                            impact: 'Environmental responsibility',
                            icon: '🌱',
                          },
                          {
                            challenge: 'Workforce Development',
                            solution:
                              'Training the next generation of expert mechanics and technicians',
                            impact: 'Industry skill advancement',
                            icon: '👨‍🔧',
                          },
                          {
                            challenge: 'Knowledge Gap',
                            solution:
                              'Educational resources and expert guidance for vehicle owners',
                            impact: 'Empowered customers',
                            icon: '📖',
                          },
                        ].map((item, index) => (
                          <div
                            key={index}
                            className="bg-green-50 border border-green-200 rounded-lg p-6"
                          >
                            <div className="flex items-start">
                              <div className="text-2xl mr-3">{item.icon}</div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-green-900 mb-2">
                                  {item.challenge}
                                </h4>
                                <p className="text-green-800 text-sm mb-3">
                                  {item.solution}
                                </p>
                                <div className="flex items-center text-xs text-green-700">
                                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                  <strong>Impact:</strong> {item.impact}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* Closing Statement */}
                    <section className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-8 border border-gray-200 mb-12">
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        🚗 Our Commitment to Sri Lanka
                      </h2>
                      <p className="text-gray-700 leading-relaxed text-lg mb-6">
                        At <strong>Logivis Automotive</strong>, we aim to
                        transform the vehicle service industry in Sri Lanka
                        through excellence, innovation, and customer-first
                        thinking. We're not just providing automotive
                        services—we're building a community and shaping the
                        future of vehicle care in Sri Lanka.
                      </p>
                      <div className="flex flex-wrap gap-4">
                        <a
                          href="/contact-support"
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                        >
                          🛠️ Get Service Quote
                        </a>
                        <a
                          href="/services"
                          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-medium transition-colors"
                        >
                          🔍 Explore Services
                        </a>
                        <a
                          href="/spare-parts"
                          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                        >
                          🔧 Browse Parts
                        </a>
                      </div>
                    </section>

                    {/* Contact Section */}
                    <section
                      id="contact-us"
                      className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-8 border border-blue-200"
                    >
                      <h2 className="text-3xl font-bold text-gray-900 mb-6">
                        Ready to Experience Excellence?
                      </h2>
                      <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                        Join thousands of satisfied customers across Sri Lanka
                        who trust Logivis Automotive for their vehicle care
                        needs.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-lg p-6 border border-gray-200 text-center">
                          <div className="text-3xl mb-3">🛠️</div>
                          <h4 className="font-semibold text-gray-900 mb-2">
                            Service Request
                          </h4>
                          <p className="text-gray-600 text-sm mb-3">
                            Need repair or maintenance?
                          </p>
                          <a
                            href="/contact-support"
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Book Service →
                          </a>
                        </div>
                        <div className="bg-white rounded-lg p-6 border border-gray-200 text-center">
                          <div className="text-3xl mb-3">🔧</div>
                          <h4 className="font-semibold text-gray-900 mb-2">
                            Spare Parts
                          </h4>
                          <p className="text-gray-600 text-sm mb-3">
                            Find genuine parts for your vehicle
                          </p>
                          <a
                            href="/shop"
                            className="text-green-600 hover:text-green-800 font-medium"
                          >
                            Browse Parts →
                          </a>
                        </div>
                        <div className="bg-white rounded-lg p-6 border border-gray-200 text-center">
                          <div className="text-3xl mb-3">💬</div>
                          <h4 className="font-semibold text-gray-900 mb-2">
                            Expert Advice
                          </h4>
                          <p className="text-gray-600 text-sm mb-3">
                            Get professional consultation
                          </p>
                          <a
                            href="/consultation"
                            className="text-purple-600 hover:text-purple-800 font-medium"
                          >
                            Consult Expert →
                          </a>
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
