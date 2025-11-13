import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import './index.css';

const queryClient = new QueryClient();

// Render the app within React Strict Mode and Tanstack Query provider
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  // StrictMode helps with code quality and catches problems early
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
);
