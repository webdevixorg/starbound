import React, { useState } from 'react';
import {
  EyeIcon,
  EyeSlashIcon,
  ShieldCheckIcon,
  KeyIcon,
} from '@heroicons/react/24/outline';

interface Props {
  formData: {
    email: string;
    current_password: string;
    new_password: string;
    confirm_password: string;
    username: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading?: boolean;
  errors?: Record<string, string>;
}

const ChangePasswordTab: React.FC<Props> = ({
  formData,
  handleChange,
  handleSubmit,
  isLoading = false,
  errors = {},
}) => {
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: '', color: '' };

    let strength = 0;
    const checks = [
      password.length >= 8,
      /[a-z]/.test(password),
      /[A-Z]/.test(password),
      /\d/.test(password),
      /[!@#$%^&*(),.?":{}|<>]/.test(password),
    ];

    strength = checks.filter(Boolean).length;

    const strengthMap = {
      0: { label: 'Very Weak', color: 'bg-red-500' },
      1: { label: 'Weak', color: 'bg-red-400' },
      2: { label: 'Fair', color: 'bg-yellow-500' },
      3: { label: 'Good', color: 'bg-yellow-400' },
      4: { label: 'Strong', color: 'bg-green-500' },
      5: { label: 'Very Strong', color: 'bg-green-600' },
    };

    return { strength, ...strengthMap[strength as keyof typeof strengthMap] };
  };

  const passwordStrength = getPasswordStrength(formData.new_password);
  const passwordsMatch =
    formData.new_password === formData.confirm_password &&
    formData.confirm_password !== '';

  return (
    <>
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="p-3 bg-blue-100 rounded-lg mr-4">
            <ShieldCheckIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              Change Password
            </h3>
            <p className="text-gray-600">
              Keep your account secure by using a strong, unique password
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Current Password */}
        <div className="space-y-2">
          <label
            className="block text-sm font-medium text-gray-900"
            htmlFor="current_password"
          >
            Current Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <KeyIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="current_password"
              name="current_password"
              type={showPasswords.current ? 'text' : 'password'}
              value={formData.current_password}
              onChange={handleChange}
              className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Enter your current password"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => togglePasswordVisibility('current')}
            >
              {showPasswords.current ? (
                <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
          {errors.current_password && (
            <p className="text-sm text-red-600">{errors.current_password}</p>
          )}
        </div>

        {/* New Password */}
        <div className="space-y-2">
          <label
            className="block text-sm font-medium text-gray-900"
            htmlFor="new_password"
          >
            New Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <KeyIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="new_password"
              name="new_password"
              type={showPasswords.new ? 'text' : 'password'}
              value={formData.new_password}
              onChange={handleChange}
              className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Enter a strong new password"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => togglePasswordVisibility('new')}
            >
              {showPasswords.new ? (
                <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>

          {/* Password Strength Indicator */}
          {formData.new_password && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Password strength:
                </span>
                <span
                  className={`text-sm font-medium ${
                    passwordStrength.strength >= 4
                      ? 'text-green-600'
                      : passwordStrength.strength >= 3
                        ? 'text-yellow-600'
                        : 'text-red-600'
                  }`}
                >
                  {passwordStrength.label}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                  style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                />
              </div>
            </div>
          )}

          {errors.new_password && (
            <p className="text-sm text-red-600">{errors.new_password}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <label
            className="block text-sm font-medium text-gray-900"
            htmlFor="confirm_password"
          >
            Confirm New Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <KeyIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="confirm_password"
              name="confirm_password"
              type={showPasswords.confirm ? 'text' : 'password'}
              value={formData.confirm_password}
              onChange={handleChange}
              className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Confirm your new password"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => togglePasswordVisibility('confirm')}
            >
              {showPasswords.confirm ? (
                <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>

          {/* Password Match Indicator */}
          {formData.confirm_password && (
            <div
              className={`flex items-center text-sm ${
                passwordsMatch ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {passwordsMatch ? (
                <svg
                  className="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
            </div>
          )}

          {errors.confirm_password && (
            <p className="text-sm text-red-600">{errors.confirm_password}</p>
          )}
        </div>

        {/* Password Requirements */}
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200/60 rounded-xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <svg
                className="w-5 h-5 text-emerald-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-emerald-900">
              Password Security Requirements
            </h4>
          </div>
          <ul className="space-y-3">
            <li className="flex items-center">
              <div
                className={`flex items-center justify-center w-6 h-6 rounded-full mr-3 transition-all duration-300 ${
                  formData.new_password.length >= 8
                    ? 'bg-emerald-500 shadow-lg shadow-emerald-500/25'
                    : 'bg-gray-300'
                }`}
              >
                {formData.new_password.length >= 8 ? (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <div className="w-2 h-2 bg-white rounded-full opacity-60" />
                )}
              </div>
              <span
                className={`text-sm font-medium transition-colors duration-300 ${
                  formData.new_password.length >= 8
                    ? 'text-emerald-800'
                    : 'text-gray-600'
                }`}
              >
                At least 8 characters long
              </span>
            </li>
            <li className="flex items-center">
              <div
                className={`flex items-center justify-center w-6 h-6 rounded-full mr-3 transition-all duration-300 ${
                  /[a-z]/.test(formData.new_password)
                    ? 'bg-emerald-500 shadow-lg shadow-emerald-500/25'
                    : 'bg-gray-300'
                }`}
              >
                {/[a-z]/.test(formData.new_password) ? (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <div className="w-2 h-2 bg-white rounded-full opacity-60" />
                )}
              </div>
              <span
                className={`text-sm font-medium transition-colors duration-300 ${
                  /[a-z]/.test(formData.new_password)
                    ? 'text-emerald-800'
                    : 'text-gray-600'
                }`}
              >
                Contains lowercase letters
              </span>
            </li>
            <li className="flex items-center">
              <div
                className={`flex items-center justify-center w-6 h-6 rounded-full mr-3 transition-all duration-300 ${
                  /[A-Z]/.test(formData.new_password)
                    ? 'bg-emerald-500 shadow-lg shadow-emerald-500/25'
                    : 'bg-gray-300'
                }`}
              >
                {/[A-Z]/.test(formData.new_password) ? (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <div className="w-2 h-2 bg-white rounded-full opacity-60" />
                )}
              </div>
              <span
                className={`text-sm font-medium transition-colors duration-300 ${
                  /[A-Z]/.test(formData.new_password)
                    ? 'text-emerald-800'
                    : 'text-gray-600'
                }`}
              >
                Contains uppercase letters
              </span>
            </li>
            <li className="flex items-center">
              <div
                className={`flex items-center justify-center w-6 h-6 rounded-full mr-3 transition-all duration-300 ${
                  /\d/.test(formData.new_password)
                    ? 'bg-emerald-500 shadow-lg shadow-emerald-500/25'
                    : 'bg-gray-300'
                }`}
              >
                {/\d/.test(formData.new_password) ? (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <div className="w-2 h-2 bg-white rounded-full opacity-60" />
                )}
              </div>
              <span
                className={`text-sm font-medium transition-colors duration-300 ${
                  /\d/.test(formData.new_password)
                    ? 'text-emerald-800'
                    : 'text-gray-600'
                }`}
              >
                Contains numbers
              </span>
            </li>
            <li className="flex items-center">
              <div
                className={`flex items-center justify-center w-6 h-6 rounded-full mr-3 transition-all duration-300 ${
                  /[!@#$%^&*(),.?":{}|<>]/.test(formData.new_password)
                    ? 'bg-emerald-500 shadow-lg shadow-emerald-500/25'
                    : 'bg-gray-300'
                }`}
              >
                {/[!@#$%^&*(),.?":{}|<>]/.test(formData.new_password) ? (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <div className="w-2 h-2 bg-white rounded-full opacity-60" />
                )}
              </div>
              <span
                className={`text-sm font-medium transition-colors duration-300 ${
                  /[!@#$%^&*(),.?":{}|<>]/.test(formData.new_password)
                    ? 'text-emerald-800'
                    : 'text-gray-600'
                }`}
              >
                Contains special characters
              </span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={
              isLoading || !passwordsMatch || passwordStrength.strength < 3
            }
            className="inline-flex items-center px-6 py-3 text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
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
                Changing Password...
              </>
            ) : (
              <>
                <ShieldCheckIcon className="w-5 h-5 mr-2" />
                Change Password
              </>
            )}
          </button>
        </div>
      </form>
    </>
  );
};

export default ChangePasswordTab;
