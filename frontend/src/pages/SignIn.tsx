import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signin as signinApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LogoIcon from '../components/UI/Icons/Logo';
import UserIcon from '../components/UI/Icons/User';
import EyeIcon from '../components/UI/Icons/Eye';
import GoogleIcon from '../components/UI/Icons/Google';
import FaceBookIcon from '../components/UI/Icons/FaceBook';
import AppleIcon from '../components/UI/Icons/Apple';

const SignIn: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const navigate = useNavigate();
  const { signin } = useAuth();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await signinApi({ username, password });
      if (response.data.access && response.data.refresh) {
        signin({
          access: response.data.access,
          refresh: response.data.refresh,
        });
        navigate('/profile'); // Redirect to the profile page after successful signin
      } else {
        setError('Sign In failed: No tokens received');
      }
    } catch (error) {
      setError('Sign In failed');
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
              Effortless Sign In for Exclusive Access
            </h2>
            <p className="text-sm mt-6 text-gray-800">
              Experience a smooth and intuitive signin process with our
              user-friendly design. Gain instant and secure access to your
              account with ease.
            </p>
            <p className="text-sm mt-12 text-gray-800">
              Don't have an account
              <Link
                to="/signup"
                className="text-blue-600 font-semibold hover:underline ml-1"
              >
                Sign Up here
              </Link>
            </p>
          </div>
          <div className="max-w-md w-full">
            <Link to="/" className="flex items-center justify-center mb-6">
              <LogoIcon className="w-[100px] h-[100px]" />
            </Link>

            <div className="p-8 rounded-2xl bg-white shadow">
              <div className="mb-8">
                <h3 className="text-3xl font-extrabold text-gray-800">
                  Sign in
                </h3>
              </div>

              <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="text-gray-800 text-sm mb-2 block">
                    User name
                  </label>
                  <div className="relative flex items-center">
                    <input
                      name="username"
                      type="text"
                      className="w-full text-gray-800 text-sm border border-gray-300 px-4 py-2 rounded-md outline-blue-600"
                      placeholder="Enter user name"
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
                      id="password"
                      name="password"
                      type={passwordVisible ? 'text' : 'password'}
                      className="w-full text-gray-800 text-sm border border-gray-300 px-4 py-2 rounded-md outline-blue-600"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <EyeIcon
                      className="w-4 h-4 absolute right-4 cursor-pointer text-gray-400"
                      onClick={togglePasswordVisibility}
                    />
                  </div>
                </div>
                {error && <p className="text-red-500">{error}</p>}

                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 shrink-0 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="remember-me"
                      className="ml-3 block text-sm text-gray-800"
                    >
                      Remember me
                    </label>
                  </div>
                  <div className="text-sm">
                    <a
                      href="jajvascript:void(0);"
                      className="text-blue-600 hover:underline font-semibold"
                    >
                      Forgot your password?
                    </a>
                  </div>
                </div>

                <div className="!mt-8">
                  <button
                    type="submit"
                    className="w-full py-2 px-4 text-sm tracking-wide rounded-lg text-white text-center bg-blue-600 hover:bg-blue-700 focus:outline-none"
                  >
                    Sign in
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
                  Sign in with Google
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
                  Don't have an account?
                  <Link
                    to="/signup"
                    className="text-blue-600 font-semibold hover:underline ml-1"
                  >
                    Sign Up here
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

export default SignIn;
