'use client';

import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* 404 Animation Container */}
        <div className="relative mb-6">
          {/* Large 404 Text with gradient */}
          <div className="relative">
            <h1 className="text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 select-none">
              404
            </h1>

            {/* Floating elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {/* Animated circles */}
              <div
                className="absolute top-1/4 left-1/4 w-4 h-4 bg-blue-400 rounded-full animate-bounce"
                style={{ animationDelay: '0s' }}
              ></div>
              <div
                className="absolute top-1/3 right-1/4 w-3 h-3 bg-purple-400 rounded-full animate-bounce"
                style={{ animationDelay: '0.5s' }}
              ></div>
              <div
                className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                style={{ animationDelay: '1s' }}
              ></div>
              <div
                className="absolute bottom-1/4 right-1/3 w-5 h-5 bg-blue-300 rounded-full animate-bounce"
                style={{ animationDelay: '1.5s' }}
              ></div>
            </div>

            {/* Glowing effect */}
            <div className="absolute inset-0 text-7xl md:text-8xl font-black text-blue-600/10 blur-3xl select-none">
              404
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl p-6 md:p-8 mx-auto max-w-2xl">
          {/* Error Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>

          {/* Heading */}
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            Oops! Page Not Found
          </h2>

          {/* Description */}
          <p className="text-base text-gray-600 mb-6 leading-relaxed">
            The page you&apos;re looking for seems to have taken a detour.
            Don&apos;t worry, even the best GPS can get confused sometimes!
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-6">
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-300"
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
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Back to Home
            </Link>

            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transform hover:scale-105 transition-all duration-300"
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
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Go Back
            </button>
          </div>

          {/* Search Box */}
          <div className="max-w-md mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for something else..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-blue-600 transition-colors">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Helpful Links */}
        <div className="mt-8">
          <p className="text-gray-600 mb-4 text-base font-medium">
            Or try one of these popular pages:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
            {[
              {
                title: 'Products',
                href: '/products',
                icon: (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                ),
                color: 'from-blue-500 to-blue-600',
              },
              {
                title: 'Support',
                href: '/support',
                icon: (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                ),
                color: 'from-green-500 to-green-600',
              },
              {
                title: 'Forum',
                href: '/forum',
                icon: (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h2m2-4h2a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V6a2 2 0 012-2h2m8 0V4a2 2 0 00-2-2H9a2 2 0 00-2 2v2m8 0h2"
                    />
                  </svg>
                ),
                color: 'from-purple-500 to-purple-600',
              },
              {
                title: 'About',
                href: '/about',
                icon: (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ),
                color: 'from-orange-500 to-orange-600',
              },
            ].map((link) => (
              <Link
                key={link.title}
                href={link.href}
                className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 p-4 hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <div
                  className={`inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r ${link.color} rounded-xl text-white mb-2 group-hover:scale-110 transition-transform duration-300`}
                >
                  {link.icon}
                </div>
                <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors text-sm">
                  {link.title}
                </h3>
              </Link>
            ))}
          </div>
        </div>

        {/* Fun Message */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full px-4 py-2">
            <span className="text-xl">🚗</span>
            <p className="text-gray-700 font-medium text-sm">
              Lost? No worries! Even race cars take wrong turns sometimes.
            </p>
            <span className="text-xl">🏁</span>
          </div>
        </div>
      </div>
    </div>
  );
}
