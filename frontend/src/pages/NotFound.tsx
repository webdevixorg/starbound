// src/pages/NotFound.tsx

import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <section className="bg-white dark:bg-gray-900 min-h-screen flex items-center justify-center">
      <div className="flex items-center flex-col justify-center lg:flex-row py-28 px-6 md:px-24 md:py-20 lg:py-32 gap-16 lg:gap-28">
        <div className="w-full lg:w-1/2">
          <img className="hidden lg:block" src="/images/Group-192-2.png" />
          <img
            className="hidden md:block lg:hidden"
            src="/images/Group-193.png"
          />
          <img className="md:hidden" src="/images/Group-198.png" />
        </div>
        <div className="w-full lg:w-1/2">
          <h1 className="py-4 text-3xl lg:text-4xl font-extrabold text-gray-800 dark:text-white">
            Page Not Found!
          </h1>
          <p className="py-4 text-base text-gray-800 dark:text-white">
            The content you’re looking for doesn’t exist. Either it was removed,
            or you mistyped the link.
          </p>
          <p className="py-2 text-base text-gray-800 dark:text-white">
            Sorry about that! Please visit our hompage to get where you need to
            go.
          </p>
          <Link
            className="inline-block my-4 rounded-md px-1 sm:px-16 py-5 bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-indigo-700 focus:ring-opacity-50"
            to={'/'}
          >
            Go back to Homepage
          </Link>
        </div>
      </div>
    </section>
  );
};

export default NotFound;
