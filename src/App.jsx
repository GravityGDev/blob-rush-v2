import { Toaster } from '@/components/ui/toaster';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { queryClientInstance } from '@/lib/query-client';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import ScrollToTop from '@/components/ScrollToTop';
import PageNotFound from '@/lib/PageNotFound';
import Play from '@/pages/Play';
import Login from '@/pages/Login';
import Register from '@/pages/Register';

function AppRoutes() {
  const { isAuthenticated, isLoadingAuth } = useAuth();
  if (isLoadingAuth) return <div className="fixed inset-0 flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" /></div>;
  return <Routes>
    <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
    <Route path="/register" element={isAuthenticated ? <Navigate to="/" replace /> : <Register />} />
    <Route path="/" element={isAuthenticated ? <Play /> : <Navigate to="/login" replace />} />
    <Route path="*" element={<PageNotFound />} />
  </Routes>;
}

export default function App() {
  return <AuthProvider><QueryClientProvider client={queryClientInstance}><BrowserRouter><ScrollToTop /><AppRoutes /></BrowserRouter><Toaster /></QueryClientProvider></AuthProvider>;
}
