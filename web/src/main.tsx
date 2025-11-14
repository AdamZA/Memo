import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import './index.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { MemoDetailsPage } from './MemoDetailsPage.tsx';
import { MemoEditorPage } from './MemoEditorPage.tsx';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/memos" element={<App />} />
          <Route path="/memos/:id" element={<MemoDetailsPage />} />
          <Route path="/memos/new" element={<MemoEditorPage mode="create" />} />
          <Route path="/memos/:id/edit" element={<MemoEditorPage mode="edit" />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
