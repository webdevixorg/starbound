import React from 'react';
import Switch from '@/components/Forms/Input/Switch';
import { ShieldIcon } from '@/components/UI/Icons/Sheald';
import SMSIcon from '@/components/UI/Icons/Sms';
import { SecuritySettings } from '@/services/api';

interface Props {
  formData: SecuritySettings;
  handleSwitchChange: (name: string, value: boolean) => void;
  isLoading?: boolean;
}

const AccountSecurityTab: React.FC<Props> = ({
  formData,
  handleSwitchChange,
}) => {
  return (
    <>
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
    </>
  );
};

export default AccountSecurityTab;
