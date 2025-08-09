'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface Step {
  id: number;
  title: string;
  description: string;
  icon: string;
  details: string[];
  videoUrl?: string;
  completed?: boolean;
}

const GETTING_STARTED_STEPS: Step[] = [
  {
    id: 1,
    title: 'Create Your Account',
    description: 'Sign up for free and join the Starbound community',
    icon: '👤',
    details: [
      'Click the "Sign Up" button in the top right corner',
      'Enter your email address and create a secure password',
      'Verify your email address by clicking the confirmation link',
      'Complete your profile with basic information',
      'Set your preferences and notification settings',
    ],
    videoUrl: '/videos/create-account.mp4',
  },
  {
    id: 2,
    title: 'Navigate the Platform',
    description: 'Learn how to find your way around Starbound',
    icon: '🧭',
    details: [
      'Use the main navigation menu at the top of the page',
      'Browse categories using the sidebar or main menu',
      'Use the search bar to find specific products or content',
      'Access your profile from the user menu in the top right',
      'Bookmark important pages for quick access',
    ],
  },
  {
    id: 3,
    title: 'Set Up Your Profile',
    description: 'Customize your profile and account settings',
    icon: '⚙️',
    details: [
      'Upload a profile picture',
      'Add your personal information and preferences',
      'Set up your notification preferences',
      'Configure privacy settings',
      'Add payment methods for faster checkout',
    ],
  },
  {
    id: 4,
    title: 'Explore Features',
    description: 'Discover all the features Starbound has to offer',
    icon: '🚀',
    details: [
      'Browse our product catalog and categories',
      'Use filters to narrow down search results',
      'Save items to your wishlist for later',
      'Read reviews and ratings from other users',
      'Join community discussions and forums',
    ],
  },
  {
    id: 5,
    title: 'Make Your First Purchase',
    description: 'Complete your first order with confidence',
    icon: '🛒',
    details: [
      'Add items to your shopping cart',
      'Review your cart and apply any discount codes',
      'Enter shipping and billing information',
      'Choose your preferred payment method',
      'Track your order through email notifications',
    ],
  },
  {
    id: 6,
    title: 'Get Support',
    description: 'Know where to find help when you need it',
    icon: '💬',
    details: [
      'Visit our comprehensive Help Center',
      'Use the live chat feature for immediate assistance',
      'Contact support via email or contact form',
      'Join our community forums for peer support',
      'Follow us on social media for updates and tips',
    ],
  },
];

const QUICK_TIPS = [
  {
    title: 'Use Keyboard Shortcuts',
    description: 'Press Ctrl+K (Cmd+K on Mac) to quickly open the search bar',
    icon: '⌨️',
  },
  {
    title: 'Save Your Favorites',
    description:
      'Click the heart icon on any product to save it to your wishlist',
    icon: '❤️',
  },
  {
    title: 'Track Everything',
    description: 'Get real-time updates on your orders via email and SMS',
    icon: '📦',
  },
  {
    title: 'Stay Updated',
    description: 'Enable notifications to get the latest deals and updates',
    icon: '🔔',
  },
];

const StepCard = ({
  step,
  isExpanded,
  onToggle,
  onMarkComplete,
}: {
  step: Step;
  isExpanded: boolean;
  onToggle: () => void;
  onMarkComplete: () => void;
}) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-md">
    <div className="p-6 cursor-pointer" onClick={onToggle}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-3xl">{step.icon}</div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {step.title}
            </h3>
            <p className="text-gray-600 mt-1">{step.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {step.completed && (
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              ✓ Complete
            </div>
          )}
          <svg
            className={`w-5 h-5 text-gray-400 transform transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
    </div>

    {isExpanded && (
      <div className="px-6 pb-6 border-t border-gray-100">
        <div className="mt-4">
          <h4 className="font-medium text-gray-900 mb-3">
            Step-by-step instructions:
          </h4>
          <ul className="space-y-2">
            {step.details.map((detail, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1 flex-shrink-0">•</span>
                <span className="text-gray-700">{detail}</span>
              </li>
            ))}
          </ul>

          {step.videoUrl && (
            <div className="mt-4">
              <button className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
                Watch Tutorial Video
              </button>
            </div>
          )}

          <div className="mt-4 flex space-x-3">
            <button
              onClick={onMarkComplete}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                step.completed
                  ? 'bg-green-100 text-green-800'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {step.completed ? 'Completed' : 'Mark as Complete'}
            </button>
            {step.id === 1 && (
              <Link
                href="/auth/register"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
              >
                Sign Up Now
              </Link>
            )}
          </div>
        </div>
      </div>
    )}
  </div>
);

export default function GettingStartedPage() {
  const router = useRouter();
  const [expandedStep, setExpandedStep] = useState<number | null>(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const handleStepToggle = useCallback(
    (stepId: number) => {
      setExpandedStep(expandedStep === stepId ? null : stepId);
    },
    [expandedStep]
  );

  const handleMarkComplete = useCallback((stepId: number) => {
    setCompletedSteps((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  }, []);

  const progressPercentage =
    (completedSteps.size / GETTING_STARTED_STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center space-x-4 mb-6">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-blue-500 rounded-lg transition-colors"
            >
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div>
              <h1 className="text-4xl font-bold">
                Getting Started with Starbound
              </h1>
              <p className="text-xl text-blue-100 mt-2">
                Your step-by-step guide to making the most of our platform
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-blue-500 rounded-full h-3 overflow-hidden">
            <div
              className="bg-white h-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-blue-100 mt-2">
            {completedSteps.size} of {GETTING_STARTED_STEPS.length} steps
            completed ({Math.round(progressPercentage)}%)
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introduction */}
        <div className="bg-white rounded-xl p-8 mb-8 shadow-sm border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome to Starbound! 🎉
          </h2>
          <p className="text-gray-700 text-lg mb-6">
            We're excited to have you join our community. This guide will help
            you get up and running quickly. Follow these steps at your own pace,
            and don't hesitate to reach out if you need help!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {QUICK_TIPS.map((tip, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl mb-2">{tip.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {tip.title}
                </h3>
                <p className="text-sm text-gray-600">{tip.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">
            Getting Started Steps
          </h2>

          {GETTING_STARTED_STEPS.map((step) => (
            <StepCard
              key={step.id}
              step={{
                ...step,
                completed: completedSteps.has(step.id),
              }}
              isExpanded={expandedStep === step.id}
              onToggle={() => handleStepToggle(step.id)}
              onMarkComplete={() => handleMarkComplete(step.id)}
            />
          ))}
        </div>

        {/* Next Steps */}
        <div className="mt-12 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What's Next?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">
                📚 Explore Help Center
              </h3>
              <p className="text-gray-600 mb-4">
                Find detailed guides and FAQs for every feature.
              </p>
              <Link
                href="/help-center"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Browse Help Articles →
              </Link>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">
                👥 Join Community
              </h3>
              <p className="text-gray-600 mb-4">
                Connect with other users and share experiences.
              </p>
              <Link
                href="/community"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Join Discussions →
              </Link>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">
                💬 Get Support
              </h3>
              <p className="text-gray-600 mb-4">
                Need help? Our support team is here for you.
              </p>
              <Link
                href="/profile/contact-support"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Contact Support →
              </Link>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Frequently Asked Questions
          </h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-200">
            {[
              {
                question: 'How do I create an account?',
                answer:
                  'Click the "Sign Up" button in the top right corner, enter your email and create a password. You\'ll receive a confirmation email to verify your account.',
              },
              {
                question: 'How do I navigate the website?',
                answer:
                  'Use the main navigation menu at the top of the page. You can browse categories, search for products, or use the filters to find what you need.',
              },
              {
                question: 'Where can I find my profile settings?',
                answer:
                  'Click on your profile picture or name in the top right corner, then select "Profile Settings" from the dropdown menu.',
              },
              {
                question: 'How do I contact customer support?',
                answer:
                  'You can reach us through the Contact Support page, live chat, or email us at support@starbound.com. We respond within 24 hours.',
              },
            ].map((faq, index) => (
              <div key={index} className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {faq.question}
                </h3>
                <p className="text-gray-700">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
