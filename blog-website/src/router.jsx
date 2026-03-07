import React from 'react';
import { createHashRouter, Navigate } from 'react-router-dom';
import DocsLayout from './docs/DocsLayout';
import DocPage from './docs/DocPage';
import NotFound from './docs/NotFound';

export const router = createHashRouter([
  {
    path: '/',
    element: <Navigate to="/docs/home" replace />,
  },
  {
    path: '/docs',
    element: <DocsLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/docs/home" replace />,
      },
      {
        path: ':slug',
        element: <DocPage />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);
