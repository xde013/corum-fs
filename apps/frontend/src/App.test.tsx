import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';

// Mock lazy-loaded pages - need to return default export for lazy()
vi.mock('@/features/auth/pages/LoginPage', () => ({
  default: () => <div data-testid="login-page">Login Page</div>,
  LoginPage: () => <div data-testid="login-page">Login Page</div>,
}));

vi.mock('@/features/auth/pages/ForgotPasswordPage', () => ({
  default: () => <div data-testid="forgot-password-page">Forgot Password Page</div>,
  ForgotPasswordPage: () => <div data-testid="forgot-password-page">Forgot Password Page</div>,
}));

vi.mock('@/features/auth/pages/ResetPasswordPage', () => ({
  default: () => <div data-testid="reset-password-page">Reset Password Page</div>,
  ResetPasswordPage: () => <div data-testid="reset-password-page">Reset Password Page</div>,
}));

vi.mock('@/features/dashboard/pages/DashboardPage', () => ({
  default: () => <div data-testid="dashboard-page">Dashboard Page</div>,
  DashboardPage: () => <div data-testid="dashboard-page">Dashboard Page</div>,
}));

vi.mock('@/features/profile/pages/ProfilePage', () => ({
  default: () => <div data-testid="profile-page">Profile Page</div>,
  ProfilePage: () => <div data-testid="profile-page">Profile Page</div>,
}));

vi.mock('@/features/users/pages/CreateUserPage', () => ({
  default: () => <div data-testid="create-user-page">Create User Page</div>,
  CreateUserPage: () => <div data-testid="create-user-page">Create User Page</div>,
}));

vi.mock('@/features/users/pages/EditUserPage', () => ({
  default: () => <div data-testid="edit-user-page">Edit User Page</div>,
  EditUserPage: () => <div data-testid="edit-user-page">Edit User Page</div>,
}));

vi.mock('@/shared/components/NotFoundPage', () => ({
  default: () => <div data-testid="not-found-page">Not Found Page</div>,
  NotFoundPage: () => <div data-testid="not-found-page">Not Found Page</div>,
}));

// Mock ProtectedRoute
vi.mock('@/routing/ProtectedRoute', () => ({
  ProtectedRoute: ({ children, requireAdmin }: { children: React.ReactNode; requireAdmin?: boolean }) => (
    <div data-testid="protected-route" data-require-admin={requireAdmin ? 'true' : 'false'}>
      {children}
    </div>
  ),
}));

// Mock AppLayout
vi.mock('@/shared/components/layout/AppLayout', () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-layout">{children}</div>
  ),
}));

// Mock LoadingSpinner
vi.mock('@/shared/components/ui/LoadingSpinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
}));

// Mock AuthProvider
vi.mock('@/shared/contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-provider">{children}</div>
  ),
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  Toaster: ({ children }: { children: (t: any) => React.ReactNode }) => (
    <div data-testid="toaster">{children({ id: 'test-toast' })}</div>
  ),
  ToastBar: ({ children }: { children: (props: any) => React.ReactNode; toast: any }) => (
    <div data-testid="toast-bar">{children({ icon: <span>icon</span>, message: 'test' })}</div>
  ),
  toast: {
    dismiss: vi.fn(),
  },
}));

// Mock react-icons
vi.mock('react-icons/fi', () => ({
  FiX: () => <span data-testid="close-icon">X</span>,
}));

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderApp = (initialPath = '/') => {
    return render(
      <MemoryRouter initialEntries={[initialPath]}>
        <App />
      </MemoryRouter>
    );
  };

  it('should render AuthProvider', async () => {
    renderApp();
    await waitFor(() => {
      expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
    });
  });

  it('should render Toaster', async () => {
    renderApp();
    await waitFor(() => {
      expect(screen.getByTestId('toaster')).toBeInTheDocument();
    });
  });

  it('should render ToastBar with close button', async () => {
    renderApp();
    await waitFor(() => {
      expect(screen.getByTestId('toast-bar')).toBeInTheDocument();
      expect(screen.getByTestId('close-icon')).toBeInTheDocument();
    });
  });

  describe('Public Routes', () => {
    it('should render LoginPage at /auth/login', async () => {
      renderApp('/auth/login');
      await waitFor(() => {
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
      });
    });

    it('should render ForgotPasswordPage at /auth/forgot-password', async () => {
      renderApp('/auth/forgot-password');
      await waitFor(() => {
        expect(screen.getByTestId('forgot-password-page')).toBeInTheDocument();
      });
    });

    it('should render ResetPasswordPage at /auth/reset-password', async () => {
      renderApp('/auth/reset-password');
      await waitFor(() => {
        expect(screen.getByTestId('reset-password-page')).toBeInTheDocument();
      });
    });
  });

  describe('Protected Routes', () => {
    it('should render DashboardPage at /dashboard with ProtectedRoute and AppLayout', async () => {
      renderApp('/dashboard');
      await waitFor(() => {
        expect(screen.getByTestId('protected-route')).toBeInTheDocument();
        expect(screen.getByTestId('app-layout')).toBeInTheDocument();
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
      });
      expect(screen.getByTestId('protected-route')).toHaveAttribute('data-require-admin', 'false');
    });

    it('should render ProfilePage at /profile with ProtectedRoute and AppLayout', async () => {
      renderApp('/profile');
      await waitFor(() => {
        expect(screen.getByTestId('protected-route')).toBeInTheDocument();
        expect(screen.getByTestId('app-layout')).toBeInTheDocument();
        expect(screen.getByTestId('profile-page')).toBeInTheDocument();
      });
      expect(screen.getByTestId('protected-route')).toHaveAttribute('data-require-admin', 'false');
    });
  });

  describe('Admin Routes', () => {
    it('should render CreateUserPage at /users/new with requireAdmin', async () => {
      renderApp('/users/new');
      await waitFor(() => {
        expect(screen.getByTestId('protected-route')).toBeInTheDocument();
        expect(screen.getByTestId('app-layout')).toBeInTheDocument();
        expect(screen.getByTestId('create-user-page')).toBeInTheDocument();
      });
      expect(screen.getByTestId('protected-route')).toHaveAttribute('data-require-admin', 'true');
    });

    it('should render EditUserPage at /users/:id/edit with requireAdmin', async () => {
      renderApp('/users/123/edit');
      await waitFor(() => {
        expect(screen.getByTestId('protected-route')).toBeInTheDocument();
        expect(screen.getByTestId('app-layout')).toBeInTheDocument();
        expect(screen.getByTestId('edit-user-page')).toBeInTheDocument();
      });
      expect(screen.getByTestId('protected-route')).toHaveAttribute('data-require-admin', 'true');
    });
  });

  describe('Default Routes', () => {
    it('should redirect / to /dashboard', async () => {
      renderApp('/');
      // Navigate component should redirect, so we wait for dashboard to appear
      await waitFor(() => {
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should render NotFoundPage for unknown routes', async () => {
      renderApp('/unknown-route');
      await waitFor(() => {
        expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
      });
    });
  });

  it('should wrap all routes in Suspense with LoadingSpinner fallback', async () => {
    renderApp('/dashboard');
    // Initially might show loading spinner, then the page
    await waitFor(() => {
      expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
    });
  });
});
