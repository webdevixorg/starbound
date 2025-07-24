'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { updateAccountSettings, fetchAccountSettings } from '@/services/api';
import BasicInfoTab from '@/components/PageComponents/AccountTabs/ChangePassword';
import AccountSecurityTab from '@/components/PageComponents/AccountTabs/AccountSecurityTab';
import PreferencesTab from '@/components/PageComponents/AccountTabs/PreferencesTab';
import PaymentMethodsTab from '@/components/PageComponents/AccountTabs/PaymentMethodsTab';
import NotificationsTab from '@/components/PageComponents/AccountTabs/NotificationsTab';
import TabsNavigation from '@/components/PageComponents/AccountTabs/TabsNavigation';
import LoadingSpinner from '@/components/Common/Loading';
import ModalAlert from '@/components/Modals/ModalAlert';
import InlineLoaderIcon from '@/components/UI/Icons/InlineLoader';

interface AccountSettingsData {
  email: string;
  current_password: string;
  new_password: string;
  confirm_password: string;
  username: string;
  twoFactorSMS: boolean;
  twoFactorTOTP: boolean;
}

const VALID_TABS = [
  'basic-info',
  'account-security',
  'preferences',
  'payment-methods',
  'notifications',
] as const;

type TabType = (typeof VALID_TABS)[number];

export default function SettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  // Get active tab from URL params or default to 'basic-info'
  const tabParam = searchParams.get('tab') as TabType;
  const initialTab = VALID_TABS.includes(tabParam) ? tabParam : 'basic-info';

  const [formData, setFormData] = useState<AccountSettingsData>({
    email: '',
    current_password: '',
    new_password: '',
    confirm_password: '',
    username: '',
    twoFactorSMS: false,
    twoFactorTOTP: false,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Ensure client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (isClient && !user) {
      router.push('/auth/login');
    }
  }, [user, router, isClient]);

  // Update URL when tab changes - Fixed type mismatch
  const handleTabChange = useCallback(
    (tab: string) => {
      const validTab = VALID_TABS.includes(tab as TabType)
        ? (tab as TabType)
        : 'basic-info';
      setActiveTab(validTab);
      const params = new URLSearchParams(searchParams.toString());
      params.set('tab', validTab);
      router.push(`/profile/settings?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  // Fetch account settings
  useEffect(() => {
    if (!isClient || !user) return;

    const getAccountSettings = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await fetchAccountSettings();

        setFormData({
          email: data.email || '',
          current_password: '',
          new_password: '',
          confirm_password: '',
          username: data.username || '',
          twoFactorSMS: data.twoFactorSMS || false,
          twoFactorTOTP: data.twoFactorTOTP || false,
        });
      } catch (error) {
        console.error('Error fetching account settings:', error);
        setError('Failed to load account settings. Please try again.');
        setShowErrorModal(true);
      } finally {
        setLoading(false);
      }
    };

    getAccountSettings();
  }, [isClient, user]);

  // Handle input changes
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setHasChanges(true);
  }, []);

  // Handle switch changes
  const handleSwitchChange = useCallback((name: string, value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setHasChanges(true);
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasChanges) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await updateAccountSettings(formData);
      setHasChanges(false);
      setShowSuccessModal(true);

      // Clear password fields after successful update
      setFormData((prev) => ({
        ...prev,
        current_password: '',
        new_password: '',
        confirm_password: '',
      }));
    } catch (error: any) {
      console.error('Error updating account settings:', error);
      setError('Failed to update account settings. Please try again.');
      setShowErrorModal(true);
    } finally {
      setSaving(false);
    }
  };

  // Enhanced error handler
  const handleApiError = useCallback((error: any, context: string) => {
    console.error(`${context} error:`, error);

    let errorMessage = `Error in ${context}`;

    if (error?.response?.status === 403) {
      errorMessage = `Access denied for ${context}. Please check your permissions.`;
    } else if (error?.response?.status >= 500) {
      errorMessage = `Server error for ${context}. Please try again later.`;
    } else if (error?.message) {
      errorMessage = `${context}: ${error.message}`;
    }

    setError(errorMessage);
    setShowErrorModal(true);
  }, []);

  // Loading skeleton for SSR compatibility
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white rounded-lg shadow">
              <div className="border-b border-gray-200">
                <div className="flex space-x-8 px-6">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="h-12 w-24 bg-gray-200 rounded-t"
                    ></div>
                  ))}
                </div>
              </div>
              <div className="p-6 space-y-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'basic-info':
        return (
          <BasicInfoTab
            formData={formData}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
          />
        );
      case 'account-security':
        return (
          <AccountSecurityTab
            formData={formData}
            handleSwitchChange={handleSwitchChange}
          />
        );
      case 'preferences':
        return <PreferencesTab />;
      case 'payment-methods':
        return <PaymentMethodsTab />;
      case 'notifications':
        return <NotificationsTab />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Account Settings
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage your account preferences and security settings
              </p>
            </div>
            <button
              onClick={() => router.push('/profile')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
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
              Back to Profile
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && !showErrorModal && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => setError(null)}
                    className="text-red-800 hover:text-red-600 text-sm underline"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Content */}
        <div className="bg-white rounded-lg shadow">
          {/* Tabs Navigation */}
          <div className="border-b border-gray-200">
            <TabsNavigation
              activeTab={activeTab}
              setActiveTab={handleTabChange}
            />
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <div className="max-w-2xl">{renderContent()}</div>
          </div>

          {/* Action Buttons - Show on all tabs if there are changes */}
          {hasChanges && (
            <div className="border-t border-gray-200 px-6 py-4">
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  disabled={saving}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Discard Changes
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={saving || !hasChanges}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? (
                    <>
                      <InlineLoaderIcon className="mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ModalAlert
        isOpen={showErrorModal}
        title="Error"
        message={error || 'An unexpected error occurred.'}
        onClose={() => {
          setShowErrorModal(false);
          setError(null);
        }}
        onConfirm={() => {
          setShowErrorModal(false);
          setError(null);
        }}
        confirmText="OK"
        cancelText=""
      />

      <ModalAlert
        isOpen={showSuccessModal}
        title="Success"
        message="Account settings updated successfully!"
        onClose={() => {
          setShowSuccessModal(false);
        }}
        onConfirm={() => {
          setShowSuccessModal(false);
        }}
        confirmText="OK"
        cancelText=""
      />
    </div>
  );
}
