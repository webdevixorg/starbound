'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { updateAccountSettings, fetchAccountSettings } from '@/services/api';
import ChangePasswordTab from '@/components/PageComponents/AccountTabs/ChangePassword';
import AccountSecurityTab from '@/components/PageComponents/AccountTabs/AccountSecurityTab';
import PreferencesTab from '@/components/PageComponents/AccountTabs/PreferencesTab';
import NotificationsTab from '@/components/PageComponents/AccountTabs/NotificationsTab';
import TabsNavigation from '@/components/PageComponents/AccountTabs/TabsNavigation';
import LoadingSpinner from '@/components/Common/Loading';
import ModalAlert from '@/components/Modals/ModalAlert';

// Separate interfaces for each tab
interface BasicInfoData {
  email: string;
  username: string;
}

interface PasswordChangeData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

const VALID_TABS = [
  'basic-info',
  'account-security',
  'preferences',
  'notifications',
] as const;

type TabType = (typeof VALID_TABS)[number];

export default function SettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  // Get active tab from URL params or default to 'basic-info'
  const tabParam = searchParams?.get('tab') as TabType;
  const initialTab = VALID_TABS.includes(tabParam) ? tabParam : 'basic-info';

  // Separate state for each tab
  const [basicInfoData, setBasicInfoData] = useState<BasicInfoData>({
    email: '',
    username: '',
  });

  const [passwordData, setPasswordData] = useState<PasswordChangeData>({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Ensure client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (isClient && !user) {
      router.push('/signin');
    }
  }, [user, router, isClient]);

  // Update URL when tab changes - Fixed type mismatch
  const handleTabChange = useCallback(
    (tab: string) => {
      const validTab = VALID_TABS.includes(tab as TabType)
        ? (tab as TabType)
        : 'basic-info';
      setActiveTab(validTab);
      const params = new URLSearchParams(searchParams?.toString() ?? '');
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

        // Load basic account settings
        const data = await fetchAccountSettings();

        setBasicInfoData({
          email: data.email || '',
          username: data.username || '',
        });

        // Password data remains empty (for security)
        setPasswordData({
          current_password: '',
          new_password: '',
          confirm_password: '',
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

  // Separate handlers for each tab
  const handleBasicInfoChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setBasicInfoData((prev) => ({
        ...prev,
        [name]: value,
      }));
    },
    []
  );

  const handlePasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setPasswordData((prev) => ({
        ...prev,
        [name]: value,
      }));
    },
    []
  );

  // Combined handler for ChangePasswordTab
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name } = e.target;
      if (
        ['current_password', 'new_password', 'confirm_password'].includes(name)
      ) {
        handlePasswordChange(e);
      } else {
        handleBasicInfoChange(e);
      }
    },
    [handlePasswordChange, handleBasicInfoChange]
  );

  // Combined submit handler
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSaving(true);
      setError(null);

      try {
        const dataToUpdate = passwordData.new_password
          ? passwordData
          : basicInfoData;
        await updateAccountSettings(dataToUpdate);
        setShowSuccessModal(true);

        if (passwordData.new_password) {
          setPasswordData((prev) => ({
            ...prev,
            current_password: '',
            new_password: '',
            confirm_password: '',
          }));
        }
      } catch (error) {
        console.error('Error updating settings:', error);
        setError('Failed to update settings. Please try again.');
        setShowErrorModal(true);
      } finally {
        setSaving(false);
      }
    },
    [
      passwordData,
      basicInfoData,
      setSaving,
      setError,
      setShowSuccessModal,
      setShowErrorModal,
    ]
  );

  // Loading skeleton for SSR compatibility
  if (!isClient) {
    return (
      <div className="min-h-screen">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="mb-10 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-xl"></div>
                <div className="space-y-2">
                  <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-64"></div>
                  <div className="h-4 bg-gray-200 rounded w-80"></div>
                </div>
              </div>
              <div className="h-12 w-36 bg-white/60 rounded-xl border border-gray-200/40"></div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-white/40 overflow-hidden">
              <div className="border-b border-gray-200/60 bg-gradient-to-r from-white/50 to-gray-50/30 p-6">
                <div className="flex space-x-2">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="h-20 w-40 bg-gray-200 rounded-xl"
                    ></div>
                  ))}
                </div>
              </div>
              <div className="p-8 space-y-6">
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl p-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-3 mb-6">
                      <div className="h-4 bg-gray-300 rounded w-32"></div>
                      <div className="h-12 bg-gray-300 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[500px]">
            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <svg
                    className="w-8 h-8 text-white animate-pulse"
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
                <LoadingSpinner />
              </div>
              <p className="text-lg font-medium text-gray-700">
                Loading your settings...
              </p>
              <p className="text-gray-500 mt-2">This won&apos;t take long</p>
            </div>
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
          <ChangePasswordTab
            formData={{
              email: basicInfoData.email,
              username: basicInfoData.username,
              current_password: passwordData.current_password,
              new_password: passwordData.new_password,
              confirm_password: passwordData.confirm_password,
            }}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            isLoading={saving}
            errors={{}}
          />
        );
      case 'account-security':
        return <AccountSecurityTab />;
      case 'preferences':
        return <PreferencesTab />;
      case 'notifications':
        return <NotificationsTab />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      <div className="mx-auto bg-white px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <svg
                    className="w-6 h-6 text-white"
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
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                  Account Settings
                </h1>
              </div>
              <p className="text-lg text-gray-600 ml-11">
                Manage your account preferences and security settings
              </p>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && !showErrorModal && (
          <div className="mb-8 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200/60 rounded-2xl p-6 shadow-lg shadow-red-500/10 backdrop-blur-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="p-2 bg-red-100 rounded-xl">
                  <svg
                    className="h-5 w-5 text-red-600"
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
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-red-900">Error</h3>
                <div className="mt-2 text-red-800">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => setError(null)}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-800 hover:text-red-900 bg-red-100 hover:bg-red-200 rounded-lg transition-colors duration-300"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Content */}
        <div className="bg-white/70 backdrop-blur-sm border border-white/60 overflow-hidden">
          {/* Tabs Navigation */}
          <TabsNavigation
            activeTab={activeTab}
            setActiveTab={handleTabChange}
          />

          {/* Tab Content */}
          <div className="p-8">
            <div className="max-w-3xl">{renderContent()}</div>
          </div>
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
