import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup } from '../services/api';
import LogoIcon from '../components/UI/Icons/Logo';
import UserIcon from '../components/UI/Icons/User';
import EyeIcon from '../components/UI/Icons/Eye';
import GoogleIcon from '../components/UI/Icons/Google';
import FaceBookIcon from '../components/UI/Icons/FaceBook';
import AppleIcon from '../components/UI/Icons/Apple';

const SignUp: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      await signup({
        username,
        email,
        first_name: '',
        last_name: '',
        password,
        groups: [],
      });
      navigate('/signin');
    } catch (error) {
      setError('Registration failed');
    }
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
              Become a part of our community and enjoy a hassle-free experience
              with our intuitively designed signup form. Effortlessly create
              your account.
            </p>
            <p className="text-sm mt-12 text-gray-800">
              Already have an account?
              <Link
                to="/signin"
                className="text-blue-600 font-semibold hover:underline ml-1"
              >
                Log In here
              </Link>
            </p>
          </div>
          <div className="max-w-md w-full">
            <Link to="/">
              <LogoIcon className="w-[160px] h-[100px] mx-auto block" />
            </Link>

            <div className="p-8 rounded-2xl bg-white shadow">
              <div className="mb-8">
                <h3 className="text-3xl font-extrabold text-gray-800">
                  Sign up
                </h3>
              </div>

              <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
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
                      type="password"
                      className="w-full text-gray-800 text-sm border border-gray-300 px-4 py-2 rounded-md outline-blue-600"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <EyeIcon className="w-4 h-4 absolute right-4 cursor-pointer text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="text-gray-800 text-sm mb-2 block">
                    Confirm Password
                  </label>
                  <div className="relative flex items-center">
                    <input
                      name="confirm-password"
                      type="password"
                      className="w-full text-gray-800 text-sm border border-gray-300 px-4 py-2 rounded-md outline-blue-600"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <EyeIcon className="w-4 h-4 absolute right-4 cursor-pointer text-gray-400" />
                  </div>
                </div>
                {error && <p className="text-red-500">{error}</p>}

                <div className="!mt-8">
                  <button
                    type="submit"
                    className="w-full py-2 px-4 text-sm tracking-wide rounded-lg text-white text-center bg-blue-600 hover:bg-blue-700 focus:outline-none"
                  >
                    Sign up
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
                  className="py-2.5 px-4 text-sm font-semibold rounded-md text-blue-500 bg-blue-100 hover:bg-blue-200 focus:outline-none"
                >
                  <GoogleIcon />
                  Sign up with Google
                </button>
                <button
                  type="button"
                  className="py-2.5 px-4 text-sm font-semibold rounded-md text-blue-500 bg-blue-100 hover:bg-blue-200 focus:outline-none"
                >
                  <FaceBookIcon />
                </button>
                <button
                  type="button"
                  className="py-2.5 px-4 text-sm font-semibold rounded-md text-blue-500 bg-blue-100 hover:bg-blue-200 focus:outline-none"
                >
                  <AppleIcon />
                </button>
              </div>

              <div className="flex items-center gap-4">
                <p className="text-gray-800 text-sm text-center">
                  Already have an account?
                  <Link
                    to="/signin"
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
