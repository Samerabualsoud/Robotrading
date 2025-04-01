import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useSelector } from 'react-redux';
import { selectAuth } from './store/slices/authSlice';

// Lazy load pages for better performance
const Login = React.lazy(() => import('./pages/Login'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const TradingView = React.lazy(() => import('./pages/TradingView'));
const AccountSettings = React.lazy(() => import('./pages/AccountSettings'));
const ModelSettings = React.lazy(() => import('./pages/ModelSettings'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

// Layout components
const MainLayout = React.lazy(() => import('./components/layouts/MainLayout'));
const AuthLayout = React.lazy(() => import('./components/layouts/AuthLayout'));

// Loading component for suspense fallback
const LoadingScreen = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      width: '100vw',
      backgroundColor: 'background.default',
    }}
  >
    <CircularProgress />
  </Box>
);

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useSelector(selectAuth);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <React.Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Auth routes */}
        <Route
          path="/login"
          element={
            <AuthLayout>
              <Login />
            </AuthLayout>
          }
        />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="trading" element={<TradingView />} />
          <Route path="account" element={<AccountSettings />} />
          <Route path="model" element={<ModelSettings />} />
        </Route>

        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </React.Suspense>
  );
};

export default App;
