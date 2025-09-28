import React, { useState, useEffect } from 'react';
import Switch from '@/components/Forms/Input/Switch';
import { ShieldIcon } from '@/components/UI/Icons/Sheald';
import SMSIcon from '@/components/UI/Icons/Sms';
import {
  SecuritySettings,
  fetchSecuritySettings,
  updateSecuritySettings,
} from '@/services/api';

interface Props {
  onSettingsChange?: (hasChanges: boolean) => void;
}

const AccountSecurityTab: React.FC<Props> = ({ onSettingsChange }) => {
  const [formData, setFormData] = useState<SecuritySettings>({
    twoFactorSMS: false,
    twoFactorTOTP: false,
    loginNotifications: false,
  });

  const [initialData, setInitialData] = useState<SecuritySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSecuritySettings();
  }, []);

  useEffect(() => {
    if (initialData && onSettingsChange) {
      const hasChanges =
        JSON.stringify(formData) !== JSON.stringify(initialData);
      onSettingsChange(hasChanges);
    }
  }, [formData, initialData, onSettingsChange]);

  const loadSecuritySettings = async () => {
    try {
      setLoading(true);
      const securitySettings = await fetchSecuritySettings();
      setFormData(securitySettings);
      setInitialData(securitySettings);
    } catch (err) {
      setError('Failed to load security settings');
      console.error('Error loading security settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchChange = (name: string, value: boolean) => {
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
      await updateSecuritySettings(formData);
      setInitialData(formData);
      if (onSettingsChange) {
        onSettingsChange(false);
      }
    } catch (err) {
      setError('Failed to update security settings');
      console.error('Error updating security settings:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3 className="text-xl font-semibold mb-4">Security Settings</h3>
      <p className="text-gray-600 mb-6">
        Manage your account security preferences and two-factor authentication
        settings.
      </p>

      {/* Two-Factor Authentication Section */}
      <div className="mb-8">
        <h4 className="text-lg font-medium mb-4">
          Two-factor authentication (2FA)
        </h4>

        <div className="mb-4 p-4 border border-gray-200 rounded-lg">
          <div className="block">
            <div>
              <Switch
                id="twoFactorSMS"
                name="twoFactorSMS"
                label="SMS Authentication"
                icon={<SMSIcon />}
                checked={formData.twoFactorSMS}
                onChange={handleSwitchChange}
              />
            </div>
            <div>
              <p className="text-gray-500 text-sm mt-2">
                Receive a one-time passcode via SMS each time you log in.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-4 p-4 border border-gray-200 rounded-lg">
          <div className="block">
            <div>
              <Switch
                id="twoFactorTOTP"
                name="twoFactorTOTP"
                label="Authenticator App (TOTP)"
                icon={<ShieldIcon />}
                checked={formData.twoFactorTOTP}
                onChange={handleSwitchChange}
              />
            </div>
            <div>
              <p className="text-gray-500 text-sm mt-2">
                Use an authenticator app to receive temporary one-time
                passcodes.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Login Notifications Section */}
      <div className="mb-6">
        <h4 className="text-lg font-medium mb-4">Login Notifications</h4>

        <div className="mb-4 p-4 border border-gray-200 rounded-lg">
          <div className="block">
            <div>
              <Switch
                id="loginNotifications"
                name="loginNotifications"
                label="Login Notifications"
                icon={
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
                      d="M15 17h5l-5 5v-5zM10.5 17H15v5l-5-5h.5zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                }
                checked={formData.loginNotifications}
                onChange={handleSwitchChange}
              />
            </div>
            <div>
              <p className="text-gray-500 text-sm mt-2">
                Get notified via email when someone logs into your account.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Security Status */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Security Status
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                {formData.twoFactorSMS || formData.twoFactorTOTP
                  ? '✅ Two-factor authentication is enabled'
                  : '⚠️ Consider enabling two-factor authentication for better security'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800">{error}</div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={saving}
          className="group inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transform hover:-translate-y-0.5 backdrop-blur-sm"
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
              <span className="animate-pulse">Saving...</span>
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-110"
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
              Save Security Settings
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default AccountSecurityTab;
