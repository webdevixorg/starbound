'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  contactSupportAPI,
  helpCenterAPI,
  SupportTicket,
} from '@/services/apiSupport';

const SupportPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    openTickets: 0,
    totalArticles: 0,
    featuredArticles: 0,
    recentFeedback: 0,
  });

  const fetchSupportStats = useCallback(async () => {
    try {
      const promises = [];

      // Fetch user tickets if authenticated
      if (user) {
        promises.push(contactSupportAPI.getTickets());
      }

      // Fetch help center stats
      promises.push(helpCenterAPI.getArticles());
      promises.push(helpCenterAPI.getArticles({ featured: true }));

      const results = await Promise.all(promises);

      let ticketCount = 0;
      let resultsIndex = 0;

      if (user) {
        const tickets = results[resultsIndex] as { results: SupportTicket[] };
        ticketCount = tickets.results.filter(
          (t: SupportTicket) =>
            t.status === 'open' || t.status === 'in_progress'
        ).length;
        resultsIndex++;
      }

      const allArticles = results[resultsIndex];
      const featuredArticles = results[resultsIndex + 1];

      setStats({
        openTickets: ticketCount,
        totalArticles: allArticles.count,
        featuredArticles: featuredArticles.count,
        recentFeedback: 0, // We could add this if needed
      });
    } catch (err) {
      console.error('Error fetching support stats:', err);
    }
  }, [user]);

  useEffect(() => {
    fetchSupportStats();
  }, [fetchSupportStats]);

  const supportFeatures = [
    {
      id: 'contact',
      title: 'Contact Support',
      description: 'Get personalized help from our support team',
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      ),
      color: 'blue',
      href: '/profile/contact-support',
      action: 'View Tickets',
      stat: user ? `${stats.openTickets} active` : 'Sign in to view',
      features: [
        'Create support tickets',
        'Track ticket progress',
        'Message with support team',
        'File attachments',
      ],
    },
    {
      id: 'help',
      title: 'Help Center',
      description: 'Find answers in our knowledge base',
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
      color: 'green',
      href: '/support/help',
      action: 'Browse Articles',
      stat: `${stats.totalArticles} articles available`,
      features: [
        'Searchable knowledge base',
        'Categorized articles',
        'Vote on helpfulness',
        'Featured content',
      ],
    },
    {
      id: 'feedback',
      title: 'Send Feedback',
      description: 'Help us improve our platform',
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
          />
        </svg>
      ),
      color: 'purple',
      href: '/support/feedback',
      action: 'Give Feedback',
      stat: 'Your voice matters',
      features: [
        'Bug reports',
        'Feature requests',
        'Rate your experience',
        'Attach screenshots',
      ],
    },
  ];

  const quickActions = [
    {
      title: 'Create New Ticket',
      description: 'Get help with a specific issue',
      href: '/profile/help-center/new',
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      ),
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      title: 'Search Help Articles',
      description: 'Find answers quickly',
      href: '/support/help',
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      ),
      color: 'bg-green-600 hover:bg-green-700',
    },
    {
      title: 'Report a Bug',
      description: 'Help us fix issues',
      href: '/support/feedback?type=bug_report',
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      ),
      color: 'bg-red-600 hover:bg-red-700',
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; hover: string }> =
      {
        blue: {
          bg: 'bg-blue-50',
          text: 'text-blue-600',
          hover: 'hover:bg-blue-100',
        },
        green: {
          bg: 'bg-green-50',
          text: 'text-green-600',
          hover: 'hover:bg-green-100',
        },
        purple: {
          bg: 'bg-purple-50',
          text: 'text-purple-600',
          hover: 'hover:bg-purple-100',
        },
      };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              How can we help you?
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Get support, find answers, or share feedback. Our comprehensive
              support system is designed to help you get the most out of our
              platform.
            </p>

            {/* Quick Actions */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {quickActions.map((action) => (
                <button
                  key={action.title}
                  onClick={() => router.push(action.href)}
                  className={`${action.color} text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors`}
                >
                  {action.icon}
                  <span>{action.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Support Features */}
        <div className="grid gap-8 md:grid-cols-3 mb-12">
          {supportFeatures.map((feature) => {
            const colors = getColorClasses(feature.color);
            return (
              <div
                key={feature.id}
                className={`${colors.bg} ${colors.hover} rounded-lg p-6 transition-colors cursor-pointer`}
                onClick={() => router.push(feature.href)}
              >
                <div className="flex items-center mb-4">
                  <div className={`${colors.text} mr-3`}>{feature.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                </div>

                <p className="text-gray-600 mb-4">{feature.description}</p>

                <div className="mb-4">
                  <span className="text-sm font-medium text-gray-700">
                    {feature.stat}
                  </span>
                </div>

                <ul className="space-y-2 mb-6">
                  {feature.features.map((item, index) => (
                    <li
                      key={index}
                      className="flex items-center text-sm text-gray-600"
                    >
                      <svg
                        className="w-4 h-4 text-green-500 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="flex items-center text-sm font-medium text-gray-700">
                  <span>{feature.action}</span>
                  <svg
                    className="w-4 h-4 ml-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>

        {/* User Dashboard (if authenticated) */}
        {user && (
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Your Support Activity
              </h2>
            </div>
            <div className="p-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.openTickets}
                  </div>
                  <div className="text-sm text-gray-500">Active Tickets</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.totalArticles}
                  </div>
                  <div className="text-sm text-gray-500">Help Articles</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {stats.featuredArticles}
                  </div>
                  <div className="text-sm text-gray-500">Featured Content</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Need Additional Help?
            </h2>
          </div>
          <div className="p-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">
                  Response Times
                </h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• General inquiries: Within 24 hours</li>
                  <li>• Technical issues: Within 12 hours</li>
                  <li>• Urgent matters: Within 4 hours</li>
                  <li>• Critical issues: Within 1 hour</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">
                  Support Hours
                </h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Monday - Friday: 9:00 AM - 6:00 PM</li>
                  <li>• Saturday: 10:00 AM - 4:00 PM</li>
                  <li>• Sunday: Closed</li>
                  <li>• Emergency support: 24/7</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
