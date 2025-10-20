'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signup } from '@/services/api';
import UserIcon from '@/components/UI/Icons/User';
import EyeIcon from '@/components/UI/Icons/Eye';
import EyeClosedIcon from '@/components/UI/Icons/EyeClosed';
import GoogleIcon from '@/components/UI/Icons/Google';
import FaceBookIcon from '@/components/UI/Icons/FaceBook';
import AppleIcon from '@/components/UI/Icons/Apple';

const SignUp: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await signup({
        username,
        email,
        first_name: '',
        last_name: '',
        password,
        groups: [2],
      });

      setSuccess('Account created successfully! Redirecting to sign in...');

      // Redirect to signin after 2 seconds
      setTimeout(() => {
        navigate.push('/signin');
      }, 5000);
    } catch (error) {
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <div className="font-[sans-serif]">
      <div className="min-h-screen flex fle-col items-center justify-center py-6 px-4">
        <div className="grid md:grid-cols-2 items-center gap-10 max-w-6xl w-full">
          <div>
            <h2 className="lg:text-5xl text-4xl font-extrabold lg:leading-[55px] text-gray-800">
              Join Us for a Seamless Experience
            </h2>
            <p className="text-sm mt-6 text-gray-800">
              Join the Logivis community and streamline your access to smart
              automotive services, diagnostics, and digital solutions. Creating
              your account is quick and effortless.
            </p>
            <p className="text-sm mt-12 text-gray-800">
              Already have an account?
              <Link
                href="/signin"
                className="text-blue-600 font-semibold hover:underline ml-1"
              >
                Log In here
              </Link>
            </p>
          </div>
          <div className="max-w-md w-full">
            {/* Logo */}
            <Link href="/" className="flex items-center justify-center mb-6">
              <img
                src="/logo.png"
                alt="Logivis Automotive"
                className="h-10 sm:h-16 w-auto"
              />
            </Link>

            <div className="p-8 rounded-2xl bg-white shadow">
              <div className="mb-8">
                <h3 className="text-3xl font-extrabold text-gray-800">
                  Sign up
                </h3>
              </div>
              {/* Success Alert */}
              {success && (
                <div className="mb-4 p-4 rounded-md bg-green-50 border border-green-200">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-green-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">
                        {success}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {/* Error Alert */}
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
                      <p className="text-sm font-medium text-red-800">
                        {error}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                {/* ...existing form fields... */}
                <div>
                  <label className="text-gray-800 text-sm mb-2 block">
                    Email
                  </label>
                  <div className="relative flex items-center">
                    <input
                      name="email"
                      type="email"
                      className="w-full text-gray-800 text-sm border border-gray-300 px-4 py-2 rounded-md outline-blue-600"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                    <UserIcon className="w-4 h-4 absolute right-4 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="text-gray-800 text-sm mb-2 block">
                    User name
                  </label>
                  <div className="relative flex items-center">
                    <input
                      name="username"
                      type="text"
                      className="w-full text-gray-800 text-sm border border-gray-300 px-4 py-2 rounded-md outline-blue-600"
                      placeholder="Enter your user name"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                    <UserIcon className="w-4 h-4 absolute right-4 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="text-gray-800 text-sm mb-2 block">
                    Password
                  </label>
                  <div className="relative flex items-center">
                    <input
                      name="password"
                      type={passwordVisible ? 'text' : 'password'}
                      className="w-full text-gray-800 text-sm border border-gray-300 px-4 py-2 rounded-md outline-blue-600"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-4 focus:outline-none"
                      disabled={isLoading}
                    >
                      {passwordVisible ? (
                        <EyeClosedIcon className="w-4 h-4 cursor-pointer text-gray-400" />
                      ) : (
                        <EyeIcon className="w-4 h-4 cursor-pointer text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-gray-800 text-sm mb-2 block">
                    Confirm Password
                  </label>
                  <div className="relative flex items-center">
                    <input
                      name="confirm-password"
                      type={passwordVisible ? 'text' : 'password'}
                      className="w-full text-gray-800 text-sm border border-gray-300 px-4 py-2 rounded-md outline-blue-600"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-4 focus:outline-none"
                      disabled={isLoading}
                    >
                      {passwordVisible ? (
                        <EyeClosedIcon className="w-4 h-4 cursor-pointer text-gray-400" />
                      ) : (
                        <EyeIcon className="w-4 h-4 cursor-pointer text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="!mt-8">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2 px-4 text-sm tracking-wide rounded-lg text-white text-center bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
                        Creating Account...
                      </>
                    ) : (
                      'Sign up'
                    )}
                  </button>
                </div>
              </form>
              <div className="my-3 flex items-center gap-4">
                <hr className="w-full border-gray-300" />
                <p className="text-sm text-gray-800 text-center">or</p>
                <hr className="w-full border-gray-300" />
              </div>
              <div className="sm:flex sm:items-start space-x-4 max-sm:space-y-4 mb-8">
                <button
                  type="button"
                  className="flex items-center justify-center h-12 px-4 text-sm font-semibold rounded-md text-blue-500 bg-blue-100 hover:bg-blue-200 focus:outline-none"
                >
                  <GoogleIcon className="mr-2" />
                  <span>Sign in with Google</span>
                </button>

                <button
                  type="button"
                  className="flex items-center justify-center h-12 w-12 text-sm font-semibold rounded-md text-blue-500 bg-blue-100 hover:bg-blue-200 focus:outline-none"
                >
                  <FaceBookIcon />
                </button>

                <button
                  type="button"
                  className="flex items-center justify-center h-12 w-12 text-sm font-semibold rounded-md text-blue-500 bg-blue-100 hover:bg-blue-200 focus:outline-none"
                >
                  <AppleIcon />
                </button>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-gray-800 text-sm text-center">
                  Already have an account?
                  <Link
                    href="/signin"
                    className="text-blue-600 font-semibold hover:underline ml-1"
                  >
                    Log In here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
