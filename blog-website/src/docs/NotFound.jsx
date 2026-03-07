import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <div className="mx-auto max-w-3xl px-4 py-16">
        <div className="text-sm text-gray-500 dark:text-gray-400">404</div>
        <h1 className="mt-2 text-2xl font-semibold">Page not found</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          The page you’re looking for doesn’t exist.
        </p>
        <div className="mt-6">
          <Link
            to="/docs/home"
            className="inline-flex rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-black dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
