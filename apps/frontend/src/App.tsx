import React from 'react';
import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster, ToastBar, toast } from 'react-hot-toast';
import { AuthProvider } from '@/shared/contexts/AuthContext';
import { ProtectedRoute } from '@/routing/ProtectedRoute';
import { AppLayout } from '@/shared/components/layout/AppLayout';
import { LoadingSpinner } from '@/shared/components/ui/LoadingSpinner';
import { FiX } from 'react-icons/fi';

// Lazy load pages
const LoginPage = lazy(() =>
  import('@/features/auth/pages/LoginPage').then((module) => ({ default: module.LoginPage }))
);
const ForgotPasswordPage = lazy(() =>
  import('@/features/auth/pages/ForgotPasswordPage').then((module) => ({
    default: module.ForgotPasswordPage,
  }))
);
const ResetPasswordPage = lazy(() =>
  import('@/features/auth/pages/ResetPasswordPage').then((module) => ({
    default: module.ResetPasswordPage,
  }))
);
const DashboardPage = lazy(() =>
  import('@/features/dashboard/pages/DashboardPage').then((module) => ({
    default: module.DashboardPage,
  }))
);
const ProfilePage = lazy(() =>
  import('@/features/profile/pages/ProfilePage').then((module) => ({
    default: module.ProfilePage,
  }))
);
const CreateUserPage = lazy(() =>
  import('@/features/users/pages/CreateUserPage').then((module) => ({
    default: module.CreateUserPage,
  }))
);
const EditUserPage = lazy(() =>
  import('@/features/users/pages/EditUserPage').then((module) => ({
    default: module.EditUserPage,
  }))
);
const NotFoundPage = lazy(() =>
  import('@/shared/components/NotFoundPage').then((module) => ({
    default: module.NotFoundPage,
  }))
);


const renderWithSuspense = (Component: React.ComponentType) => (
  <Suspense fallback={<LoadingSpinner />}>
    <Component />
  </Suspense>
);

const renderProtected = (Component: React.ComponentType, requireAdmin = false) => (
  <ProtectedRoute requireAdmin={requireAdmin}>
    <AppLayout>{renderWithSuspense(Component)}</AppLayout>
  </ProtectedRoute>
);

const Notifications = () => {
  const TOAST_OPTIONS = {
    duration: 4000,
    style: {
      background: '#fff',
      color: '#374151',
      boxShadow:
        '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    },
    success: {
      iconTheme: {
        primary: '#10b981',
        secondary: '#fff',
      },
    },
    error: {
      iconTheme: {
        primary: '#ef4444',
        secondary: '#fff',
      },
    },
  } as const;

  return (
    <Toaster
      position="top-right"
      toastOptions={TOAST_OPTIONS}
    >
      {(t) => (
        <ToastBar toast={t}>
          {({ icon, message }) => (
            <div className="flex items-center gap-3 w-full">
              {icon}
              <div className="flex-1">{message}</div>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-1 rounded hover:bg-gray-100"
                aria-label="Close"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>
          )}
        </ToastBar>
      )}
    </Toaster>
  )
};

const App = () => {
  return (
    <AuthProvider>
      <Notifications />
      <Routes>
        {/* Public routes */}
        <Route
          path="/auth/login"
          element={renderWithSuspense(LoginPage)}
        />
        <Route
          path="/auth/forgot-password"
          element={renderWithSuspense(ForgotPasswordPage)}
        />
        <Route
          path="/auth/reset-password"
          element={renderWithSuspense(ResetPasswordPage)}
        />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={renderProtected(DashboardPage)}
        />
        <Route
          path="/profile"
          element={renderProtected(ProfilePage)}
        />
        <Route
          path="/users/new"
          element={renderProtected(CreateUserPage, true)}
        />
        <Route
          path="/users/:id/edit"
          element={renderProtected(EditUserPage, true)}
        />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* 404 - Page Not Found */}
        <Route
          path="*"
          element={renderWithSuspense(NotFoundPage)}
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;
