'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { resetPassword } from '@/services/api';
import EyeIcon from '@/components/UI/Icons/Eye';
import EyeClosedIcon from '@/components/UI/Icons/EyeClosed';
import InlineLoaderIcon from '@/components/UI/Icons/InlineLoader';

const ResetPassword: React.FC = () => {
  const searchParams = useSearchParams();
  const navigate = useRouter();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState(true);

  const token = searchParams?.get('token');
  const email = searchParams?.get('email');

  useEffect(() => {
    // Check if token and email are present
    if (!token || !email) {
      setIsValidToken(false);
      setError('Invalid reset link. Please request a new password reset.');
    }
  }, [token, email]);

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    // Validate password strength
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      setError(passwordErrors[0]); // Show first error
      setIsLoading(false);
      return;
    }

    try {
      await resetPassword({
        token: token!,
        email: email!,
        password,
        confirmPassword,
      });

      setIsSuccess(true);

      // Redirect to sign in page after 3 seconds
      setTimeout(() => {
        navigate.push('/signin');
      }, 3000);
    } catch (error: any) {
      if (error.response?.status === 400) {
        setError(
          'Invalid or expired reset token. Please request a new password reset.'
        );
      } else if (error.response?.status >= 500) {
        setError('Server error. Please try again later.');
      } else {
        setError('Failed to reset password. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isValidToken) {
    return (
      <div className="font-[sans-serif]">
        <div className="min-h-screen flex items-center justify-center py-6 px-4 bg-gray-50">
          <div className="max-w-md w-full">
            <div className="text-center mb-8">
              <Link href="/" className="flex items-center justify-center mb-6">
                <img
                  src="/logo.png"
                  alt="Logivis Automotive"
                  className="h-10 sm:h-16 w-auto"
                />
              </Link>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg
                  className="h-6 w-6 text-red-600"
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
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Invalid Reset Link
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                This password reset link is invalid or has expired. Please
                request a new one.
              </p>
              <div className="space-y-3">
                <Link
                  href="/forgot-password"
                  className="block w-full py-2 px-4 text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition duration-200 text-center"
                >
                  Request New Reset Link
                </Link>
                <Link
                  href="/signin"
                  className="block w-full py-2 px-4 text-sm font-medium rounded-lg text-gray-700 bg-gray-50 hover:bg-gray-100 transition duration-200 text-center"
                >
                  Back to Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="font-[sans-serif]">
        <div className="min-h-screen flex items-center justify-center py-6 px-4 bg-gray-50">
          <div className="max-w-md w-full">
            <div className="text-center mb-8">
              <Link href="/" className="flex items-center justify-center mb-6">
                <img
                  src="/logo.png"
                  alt="Logivis Automotive"
                  className="h-10 sm:h-16 w-auto"
                />
              </Link>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg
                  className="h-6 w-6 text-green-600"
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
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Password Reset Successfully!
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Your password has been reset successfully. You will be
                redirected to the sign in page in a few seconds.
              </p>
              <Link
                href="/signin"
                className="block w-full py-2 px-4 text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition duration-200 text-center"
              >
                Go to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="font-[sans-serif]">
      <div className="min-h-screen flex items-center justify-center py-6 px-4 bg-gray-50">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="flex items-center justify-center mb-6">
              <img
                src="/logo.png"
                alt="Logivis Automotive"
                className="h-10 sm:h-16 w-auto"
              />
            </Link>
            <h2 className="text-3xl font-extrabold text-gray-900">
              Set new password
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Enter your new password below
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-xs">
            {error && (
              <div className="mb-4 p-4 rounded-md bg-red-50 border border-red-200">
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
                    <p className="text-sm font-medium text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* New Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 focus:outline-none"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeClosedIcon className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <EyeIcon className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 focus:outline-none"
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeClosedIcon className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <EyeIcon className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Password Requirements */}
              <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-md">
                <p className="font-medium mb-1">Password must contain:</p>
                <ul className="space-y-1">
                  <li>• At least 8 characters</li>
                  <li>• One uppercase letter</li>
                  <li>• One lowercase letter</li>
                  <li>• One number</li>
                  <li>• One special character (@$!%*?&)</li>
                </ul>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 px-4 text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 flex items-center justify-center transition duration-200 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <InlineLoaderIcon className="mr-2" />
                    Resetting...
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/signin"
                className="text-sm text-blue-600 hover:text-blue-500 font-medium"
              >
                ← Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
