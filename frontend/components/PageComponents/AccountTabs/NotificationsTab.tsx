import React, { useState, useEffect } from 'react';
import {
  NotificationSettings,
  fetchNotificationSettings,
  updateNotificationSettings,
} from '@/services/api';

interface Props {
  onSettingsChange?: (hasChanges: boolean) => void;
}

const NotificationsTab: React.FC<Props> = ({ onSettingsChange }) => {
  const [formData, setFormData] = useState<NotificationSettings>({
    email: true,
    sms: false,
    push: true,
    marketing_emails: false,
    order_updates: true,
    forum_notifications: true,
  });

  const [initialData, setInitialData] = useState<NotificationSettings | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    if (initialData && onSettingsChange) {
      const hasChanges =
        JSON.stringify(formData) !== JSON.stringify(initialData);
      onSettingsChange(hasChanges);
    }
  }, [formData, initialData, onSettingsChange]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const notifications = await fetchNotificationSettings();
      setFormData(notifications);
      setInitialData(notifications);
    } catch (err) {
      setError('Failed to load notification settings');
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchChange = (
    name: keyof NotificationSettings,
    value: boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);

      await updateNotificationSettings(formData);
      setInitialData(formData);

      // Show success message or handle success
      console.log('Notification settings updated successfully');
    } catch (err) {
      setError('Failed to update notification settings');
      console.error('Error updating notifications:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i}>
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <h3 className="text-2xl font-bold mb-6 text-gray-900">Notifications</h3>
      <p className="text-gray-600 mb-6">
        Choose how you want to be notified about activities and updates.
      </p>

      {error && (
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
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Communication Channels
          </h4>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-900"
              >
                Email Notifications
              </label>
              <p className="text-sm text-gray-500">
                Receive notifications via email
              </p>
            </div>
            <input
              type="checkbox"
              id="email"
              checked={formData.email}
              onChange={(e) => handleSwitchChange('email', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <label
                htmlFor="sms"
                className="text-sm font-medium text-gray-900"
              >
                SMS Notifications
              </label>
              <p className="text-sm text-gray-500">
                Receive notifications via SMS
              </p>
            </div>
            <input
              type="checkbox"
              id="sms"
              checked={formData.sms}
              onChange={(e) => handleSwitchChange('sms', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <label
                htmlFor="push"
                className="text-sm font-medium text-gray-900"
              >
                Push Notifications
              </label>
              <p className="text-sm text-gray-500">
                Receive push notifications in your browser
              </p>
            </div>
            <input
              type="checkbox"
              id="push"
              checked={formData.push}
              onChange={(e) => handleSwitchChange('push', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Notification Types
          </h4>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <label
                htmlFor="marketing_emails"
                className="text-sm font-medium text-gray-900"
              >
                Marketing Emails
              </label>
              <p className="text-sm text-gray-500">
                Receive promotional emails and updates about new features
              </p>
            </div>
            <input
              type="checkbox"
              id="marketing_emails"
              checked={formData.marketing_emails}
              onChange={(e) =>
                handleSwitchChange('marketing_emails', e.target.checked)
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <label
                htmlFor="order_updates"
                className="text-sm font-medium text-gray-900"
              >
                Order Updates
              </label>
              <p className="text-sm text-gray-500">
                Get notified about order status changes and delivery updates
              </p>
            </div>
            <input
              type="checkbox"
              id="order_updates"
              checked={formData.order_updates}
              onChange={(e) =>
                handleSwitchChange('order_updates', e.target.checked)
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <label
                htmlFor="forum_notifications"
                className="text-sm font-medium text-gray-900"
              >
                Forum Notifications
              </label>
              <p className="text-sm text-gray-500">
                Receive notifications about forum posts and replies
              </p>
            </div>
            <input
              type="checkbox"
              id="forum_notifications"
              checked={formData.forum_notifications}
              onChange={(e) =>
                handleSwitchChange('forum_notifications', e.target.checked)
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Saving...
              </>
            ) : (
              'Save Notification Settings'
            )}
          </button>
        </div>
      </form>
    </>
  );
};

export default NotificationsTab;
