'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signin as signinApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import UserIcon from '@/components/UI/Icons/User';
import EyeIcon from '@/components/UI/Icons/Eye';
import EyeClosedIcon from '@/components/UI/Icons/EyeClosed';
import GoogleIcon from '@/components/UI/Icons/Google';
import FaceBookIcon from '@/components/UI/Icons/FaceBook';
import AppleIcon from '@/components/UI/Icons/Apple';
import InlineLoaderIcon from '@/components/UI/Icons/InlineLoader';

const SignIn: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useRouter();
  const { signin, isAuthenticated } = useAuth();

  // Redirect to dashboard if already signed in
  useEffect(() => {
    if (isAuthenticated) {
      navigate.push('/profile/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Load saved credentials
  useEffect(() => {
    const savedUsername = localStorage.getItem('rememberedUsername');
    const savedRememberMe = localStorage.getItem('rememberMe') === 'true';
    if (savedUsername && savedRememberMe) {
      setUsername(savedUsername);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await signinApi({ username, password });

      if (response.data?.access && response.data?.refresh) {
        if (rememberMe) {
          localStorage.setItem('rememberedUsername', username);
          localStorage.setItem('rememberMe', 'true');
        } else {
          localStorage.removeItem('rememberedUsername');
          localStorage.removeItem('rememberMe');
        }

        signin({
          access: response.data.access,
          refresh: response.data.refresh,
        });

        navigate.push('/profile/dashboard');
      } else {
        setError('Login failed: Missing token.');
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        setError('Invalid username or password.');
      } else if (error.response?.status >= 500) {
        setError('Server error. Try again later.');
      } else {
        setError('Unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="font-[sans-serif]">
      <div className="min-h-screen flex fle-col items-center justify-center py-6 px-4">
        <div className="grid md:grid-cols-2 items-center gap-10 max-w-6xl w-full">
          {/* Left content */}
          <div>
            <h2 className="lg:text-5xl text-4xl font-extrabold lg:leading-[55px] text-gray-800">
              Effortless Sign In for Exclusive Access
            </h2>
            <p className="text-sm mt-6 text-gray-800">
              Access your Logivis dashboard instantly and manage your smart
              automotive solutions with ease.
            </p>
            <p className="text-sm mt-12 text-gray-800">
              Don’t have an account?
              <Link
                href="/signup"
                className="text-blue-600 font-semibold hover:underline ml-1"
              >
                Sign Up here
              </Link>
            </p>
          </div>

          {/* Form */}
          <div className="max-w-md w-full">
            <Link href="/" className="flex items-center justify-center mb-6">
              <img
                src="/logo.png"
                alt="Logivis Automotive"
                className="h-10 sm:h-16 w-auto"
              />
            </Link>

            <div className="p-8 rounded-2xl bg-white shadow">
              <h3 className="text-3xl font-extrabold text-gray-800 mb-8">
                Sign in
              </h3>

              {error && (
                <div className="mb-4 p-4 rounded-md bg-red-50 border border-red-200 text-sm text-red-800">
                  {error}
                </div>
              )}

              <form className="space-y-4" onSubmit={handleSubmit}>
                {/* Username */}
                <div>
                  <label className="text-gray-800 text-sm mb-2 block">
                    User name
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      disabled={isLoading}
                      className="w-full text-sm text-gray-800 border border-gray-300 px-4 py-2 rounded-md outline-blue-600"
                      placeholder="Enter user name"
                    />
                    <UserIcon className="w-4 h-4 absolute right-4 text-gray-400" />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="text-gray-800 text-sm mb-2 block">
                    Password{' '}
                    {rememberMe && (
                      <span className="text-xs text-blue-600 ml-2">
                        (remembered for 30 days)
                      </span>
                    )}
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type={passwordVisible ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="w-full text-sm text-gray-800 border border-gray-300 px-4 py-2 rounded-md outline-blue-600"
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      onClick={() => setPasswordVisible((prev) => !prev)}
                      className="absolute right-4 focus:outline-none"
                      disabled={isLoading}
                    >
                      {passwordVisible ? (
                        <EyeClosedIcon className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <EyeIcon className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember me + Forgot password */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <label className="flex items-center text-sm text-gray-800">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      disabled={isLoading}
                    />
                    <span className="ml-2">Remember me for 30 days</span>
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-blue-600 font-semibold hover:underline text-sm"
                  >
                    Forgot your password?
                  </Link>
                </div>

                {/* Submit */}
                <div className="!mt-8">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2 px-4 text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 flex items-center justify-center transition duration-200 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <InlineLoaderIcon className="mr-2" />
                        Signing in...
                      </>
                    ) : (
                      'Sign in'
                    )}
                  </button>
                </div>
              </form>

              {/* Divider */}
              <div className="my-4 flex items-center gap-4">
                <hr className="w-full border-gray-300" />
                <span className="text-sm text-gray-800">or</span>
                <hr className="w-full border-gray-300" />
              </div>

              {/* Social login buttons */}
              <div className="flex gap-4 flex-wrap">
                <button
                  type="button"
                  className="flex-1 flex items-center justify-center px-4 h-12 bg-blue-100 hover:bg-blue-200 text-blue-500 rounded-md"
                  disabled={isLoading}
                >
                  <GoogleIcon className="mr-2" />
                  Sign in with Google
                </button>

                <button
                  type="button"
                  className="flex items-center justify-center h-12 w-12 bg-blue-100 hover:bg-blue-200 text-blue-500 rounded-md"
                  disabled={isLoading}
                >
                  <FaceBookIcon />
                </button>

                <button
                  type="button"
                  className="flex items-center justify-center h-12 w-12 bg-blue-100 hover:bg-blue-200 text-blue-500 rounded-md"
                  disabled={isLoading}
                >
                  <AppleIcon />
                </button>
              </div>

              {/* Sign up CTA */}
              <div className="mt-6 text-sm text-center text-gray-800">
                Don’t have an account?
                <Link
                  href="/signup"
                  className="text-blue-600 font-semibold hover:underline ml-1"
                >
                  Sign Up here
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
