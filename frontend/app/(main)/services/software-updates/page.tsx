import React from 'react';
import Link from 'next/link';

export default function SoftwareUpdatesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      {/* Header Section */}
      <div className="bg-white/90 backdrop-blur-xl border-b border-purple-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center mb-8">
            <Link
              href="/services"
              className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Services
            </Link>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-100 rounded-full mb-6">
              <svg
                className="w-10 h-10 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                />
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Software Updates
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Keep your vehicle&apos;s software up-to-date with the latest
              features, performance improvements, and security patches. We
              handle ECU updates, infotainment systems, and more.
            </p>
          </div>
        </div>
      </div>

      {/* Services Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Modern Vehicle Software Management
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Today&apos;s vehicles are essentially computers on wheels, running
              sophisticated software that controls everything from engine
              performance to infotainment systems. Regular software updates
              ensure optimal performance, security, and access to the latest
              features.
            </p>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-4 mt-1">
                  <svg
                    className="w-4 h-4 text-purple-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Factory-Authorized Updates
                  </h3>
                  <p className="text-gray-600">
                    Official manufacturer software updates and recalls
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-4 mt-1">
                  <svg
                    className="w-4 h-4 text-purple-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Performance Optimization
                  </h3>
                  <p className="text-gray-600">
                    Enhanced engine performance, fuel efficiency, and system
                    responsiveness
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-4 mt-1">
                  <svg
                    className="w-4 h-4 text-purple-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Security Enhancements
                  </h3>
                  <p className="text-gray-600">
                    Latest security patches to protect against cyber threats
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-purple-200/50 shadow-lg p-8">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Update Services
              </h3>
              <p className="text-gray-600">
                Professional software update packages
              </p>
            </div>
            <div className="space-y-6">
              <div className="border border-purple-100 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Basic Update
                </h4>
                <p className="text-gray-600 text-sm mb-3">
                  Single system update (ECU, infotainment, etc.)
                </p>
                <div className="text-2xl font-bold text-purple-600">$129</div>
              </div>
              <div className="border border-purple-100 rounded-lg p-4 bg-purple-50/50">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Comprehensive Update
                </h4>
                <p className="text-gray-600 text-sm mb-3">
                  Full vehicle software scan and updates
                </p>
                <div className="text-2xl font-bold text-purple-600">$249</div>
              </div>
              <div className="border border-purple-100 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Performance Tune
                </h4>
                <p className="text-gray-600 text-sm mb-3">
                  Custom performance optimization and updates
                </p>
                <div className="text-2xl font-bold text-purple-600">$399</div>
              </div>
            </div>
          </div>
        </div>

        {/* Update Categories */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Software Update Categories
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We provide updates for all major vehicle software systems and
              components.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-purple-200/50 p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Engine Control Units (ECU)
              </h3>
              <ul className="text-gray-600 space-y-2">
                <li>• Engine management updates</li>
                <li>• Transmission control updates</li>
                <li>• Performance optimization</li>
                <li>• Emission control updates</li>
                <li>• Fuel efficiency improvements</li>
              </ul>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-purple-200/50 p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Infotainment Systems
              </h3>
              <ul className="text-gray-600 space-y-2">
                <li>• Navigation map updates</li>
                <li>• Media system upgrades</li>
                <li>• Connectivity improvements</li>
                <li>• User interface updates</li>
                <li>• App integration updates</li>
              </ul>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-purple-200/50 p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Safety Systems
              </h3>
              <ul className="text-gray-600 space-y-2">
                <li>• Airbag system updates</li>
                <li>• ABS and stability control</li>
                <li>• Driver assistance features</li>
                <li>• Collision avoidance systems</li>
                <li>• Emergency response updates</li>
              </ul>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-purple-200/50 p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Powertrain Systems
              </h3>
              <ul className="text-gray-600 space-y-2">
                <li>• Hybrid system updates</li>
                <li>• Electric vehicle software</li>
                <li>• Battery management updates</li>
                <li>• Charging system optimization</li>
                <li>• Energy efficiency improvements</li>
              </ul>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-purple-200/50 p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Connectivity & Telematics
              </h3>
              <ul className="text-gray-600 space-y-2">
                <li>• WiFi and cellular updates</li>
                <li>• Bluetooth improvements</li>
                <li>• Remote access features</li>
                <li>• Vehicle tracking updates</li>
                <li>• Cloud service integration</li>
              </ul>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-purple-200/50 p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Custom Performance
              </h3>
              <ul className="text-gray-600 space-y-2">
                <li>• Performance tuning software</li>
                <li>• Custom ECU mapping</li>
                <li>• Racing optimization</li>
                <li>• Aftermarket integration</li>
                <li>• Dyno testing & tuning</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Update Process */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Update Process
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We follow a systematic approach to ensure safe and successful
              software updates.
            </p>
          </div>
          <div className="grid md:grid-cols-5 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">1</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                System Scan
              </h3>
              <p className="text-gray-600 text-sm">
                Identify current software versions and available updates
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">2</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Backup
              </h3>
              <p className="text-gray-600 text-sm">
                Create complete backup of current software configuration
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Update
              </h3>
              <p className="text-gray-600 text-sm">
                Install latest software updates and patches
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">4</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Verification
              </h3>
              <p className="text-gray-600 text-sm">
                Test all systems to ensure proper functionality
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">5</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Documentation
              </h3>
              <p className="text-gray-600 text-sm">
                Provide update report and new feature overview
              </p>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mb-16">
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-8 text-white">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">
                Why Keep Your Software Updated?
              </h2>
              <p className="text-xl text-purple-100">
                Regular software updates provide numerous benefits for your
                vehicle&apos;s performance and safety.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Enhanced Performance</h3>
                <p className="text-purple-100">
                  Improved engine efficiency, responsiveness, and overall
                  vehicle performance
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Security Protection</h3>
                <p className="text-purple-100">
                  Latest security patches to protect against cyber threats and
                  vulnerabilities
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">New Features</h3>
                <p className="text-purple-100">
                  Access to new functionality, improved user interfaces, and
                  enhanced capabilities
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">
              Keep Your Vehicle&apos;s Software Current
            </h2>
            <p className="text-xl text-purple-100 mb-6 max-w-2xl mx-auto">
              Don&apos;t miss out on performance improvements, new features, and
              critical security updates. Schedule your software update service
              today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center px-8 py-3 bg-white text-purple-600 font-semibold rounded-xl hover:bg-purple-50 transition-colors"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 9l6-6m0 0v6m0-6h-6"
                  />
                </svg>
                Schedule Update
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center px-8 py-3 bg-purple-500 text-white font-semibold rounded-xl hover:bg-purple-400 transition-colors"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Check Compatibility
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
