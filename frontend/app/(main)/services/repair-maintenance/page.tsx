import React from 'react';
import Link from 'next/link';

export default function RepairMaintenancePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* Header Section */}
      <div className="bg-white/90 backdrop-blur-xl border-b border-orange-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center mb-8">
            <Link
              href="/services"
              className="inline-flex items-center text-orange-600 hover:text-orange-700 font-medium"
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
            <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-6">
              <svg
                className="w-10 h-10 text-orange-600"
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
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Repair & Maintenance
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Full-service automotive repair and preventive maintenance. Keep
              your vehicle running smoothly with our comprehensive maintenance
              programs and expert repairs.
            </p>
          </div>
        </div>
      </div>

      {/* Services Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Complete Automotive Care
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              From routine maintenance to complex repairs, our ASE-certified
              technicians have the experience and equipment to keep your vehicle
              running at peak performance. We service all makes and models with
              factory-quality parts and service.
            </p>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mr-4 mt-1">
                  <svg
                    className="w-4 h-4 text-orange-600"
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
                    ASE Certified Technicians
                  </h3>
                  <p className="text-gray-600">
                    Highly trained professionals with ongoing education and
                    certification
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mr-4 mt-1">
                  <svg
                    className="w-4 h-4 text-orange-600"
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
                    Quality Parts & Materials
                  </h3>
                  <p className="text-gray-600">
                    OEM and premium aftermarket parts with manufacturer
                    warranties
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mr-4 mt-1">
                  <svg
                    className="w-4 h-4 text-orange-600"
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
                    Comprehensive Warranty
                  </h3>
                  <p className="text-gray-600">
                    Industry-leading warranty coverage on all repairs and
                    services
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-orange-200/50 shadow-lg p-8">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Maintenance Packages
              </h3>
              <p className="text-gray-600">
                Preventive care to keep your vehicle running smoothly
              </p>
            </div>
            <div className="space-y-6">
              <div className="border border-orange-100 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Basic Service
                </h4>
                <p className="text-gray-600 text-sm mb-3">
                  Oil change, visual inspection, fluid top-off
                </p>
                <div className="text-2xl font-bold text-orange-600">$79</div>
              </div>
              <div className="border border-orange-100 rounded-lg p-4 bg-orange-50/50">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Complete Service
                </h4>
                <p className="text-gray-600 text-sm mb-3">
                  Full maintenance package with multi-point inspection
                </p>
                <div className="text-2xl font-bold text-orange-600">$149</div>
              </div>
              <div className="border border-orange-100 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Premium Service
                </h4>
                <p className="text-gray-600 text-sm mb-3">
                  Comprehensive service with performance optimization
                </p>
                <div className="text-2xl font-bold text-orange-600">$229</div>
              </div>
            </div>
          </div>
        </div>

        {/* Service Categories */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Service Categories
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We provide comprehensive automotive services to keep your vehicle
              safe, reliable, and efficient.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-orange-200/50 p-6 hover:shadow-lg transition-shadow">
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
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Engine Services
              </h3>
              <ul className="text-gray-600 space-y-2">
                <li>• Engine diagnostics & repair</li>
                <li>• Oil changes & filter replacement</li>
                <li>• Tune-ups & performance optimization</li>
                <li>• Cooling system service</li>
                <li>• Fuel system cleaning</li>
              </ul>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-orange-200/50 p-6 hover:shadow-lg transition-shadow">
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
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Brake Systems
              </h3>
              <ul className="text-gray-600 space-y-2">
                <li>• Brake pad & rotor replacement</li>
                <li>• Brake fluid service</li>
                <li>• ABS system repair</li>
                <li>• Emergency brake adjustment</li>
                <li>• Brake line inspection</li>
              </ul>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-orange-200/50 p-6 hover:shadow-lg transition-shadow">
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
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Transmission
              </h3>
              <ul className="text-gray-600 space-y-2">
                <li>• Transmission service & repair</li>
                <li>• Fluid changes & flushes</li>
                <li>• Clutch replacement</li>
                <li>• CV joint service</li>
                <li>• Differential service</li>
              </ul>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-orange-200/50 p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Electrical Systems
              </h3>
              <ul className="text-gray-600 space-y-2">
                <li>• Battery testing & replacement</li>
                <li>• Alternator & starter service</li>
                <li>• Wiring diagnosis & repair</li>
                <li>• Lighting system repair</li>
                <li>• Computer system diagnosis</li>
              </ul>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-orange-200/50 p-6 hover:shadow-lg transition-shadow">
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
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Climate Control
              </h3>
              <ul className="text-gray-600 space-y-2">
                <li>• A/C system service & repair</li>
                <li>• Heating system diagnosis</li>
                <li>• Refrigerant recharge</li>
                <li>• Cabin air filter replacement</li>
                <li>• Compressor replacement</li>
              </ul>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-orange-200/50 p-6 hover:shadow-lg transition-shadow">
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
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Suspension & Steering
              </h3>
              <ul className="text-gray-600 space-y-2">
                <li>• Shock & strut replacement</li>
                <li>• Wheel alignment</li>
                <li>• Power steering service</li>
                <li>• Tire rotation & balancing</li>
                <li>• Suspension inspection</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Maintenance Schedule */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Recommended Maintenance Schedule
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Stay ahead of problems with our preventive maintenance
              recommendations.
            </p>
          </div>
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-orange-200/50 p-8">
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                  Every 3,000-5,000 Miles
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Oil change & filter</li>
                  <li>• Fluid level check</li>
                  <li>• Tire pressure check</li>
                  <li>• Visual inspection</li>
                  <li>• Battery test</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                  Every 15,000-30,000 Miles
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Air filter replacement</li>
                  <li>• Cabin filter replacement</li>
                  <li>• Brake inspection</li>
                  <li>• Tire rotation</li>
                  <li>• Transmission service</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                  Every 60,000+ Miles
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Timing belt replacement</li>
                  <li>• Spark plug replacement</li>
                  <li>• Coolant system flush</li>
                  <li>• Brake fluid replacement</li>
                  <li>• Major service inspection</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Services */}
        <div className="mb-16">
          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-8 text-white">
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
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-4">
                Emergency Repair Services
              </h2>
              <p className="text-lg text-red-100 mb-6">
                Vehicle breakdown? We offer priority emergency repair services
                to get you back on the road quickly.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center px-6 py-3 bg-white text-red-600 font-semibold rounded-lg hover:bg-red-50 transition-colors"
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
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                Call Emergency Line
              </Link>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-2xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">
              Keep Your Vehicle Running Smoothly
            </h2>
            <p className="text-xl text-orange-100 mb-6 max-w-2xl mx-auto">
              Regular maintenance saves money and prevents breakdowns. Schedule
              your service appointment today and experience the difference
              professional care makes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center px-8 py-3 bg-white text-orange-600 font-semibold rounded-xl hover:bg-orange-50 transition-colors"
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
                Schedule Service
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center px-8 py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-400 transition-colors"
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Get Estimate
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
