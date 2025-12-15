import { render, screen, waitFor } from '@/shared/utils/testUtils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoginPage } from './LoginPage';

// Mock useAuth
const mockIsAuthenticated = vi.fn(() => false);
vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: mockIsAuthenticated(),
    login: vi.fn(),
    logout: vi.fn(),
    user: null,
  }),
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
const mockLocation = { state: null, pathname: '/auth/login', search: '', hash: '' };
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
  };
});

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock AuthLayout
vi.mock('@/shared/components/layout/AuthLayout', () => ({
  AuthLayout: ({ children, title, subtitle }: any) => (
    <div data-testid="auth-layout">
      <h1 data-testid="auth-title">{title}</h1>
      {subtitle && <p data-testid="auth-subtitle">{subtitle}</p>}
      {children}
    </div>
  ),
}));

// Mock LoginForm
vi.mock('@/features/auth/components/LoginForm', () => ({
  LoginForm: () => <div data-testid="login-form">LoginForm</div>,
}));

// Mock validateRedirectPath
vi.mock('@/shared/utils/redirectValidation', () => ({
  validateRedirectPath: (path: string | undefined) => path || '/dashboard',
}));

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsAuthenticated.mockReturnValue(false);
    mockLocation.state = null;
  });

  it('should render AuthLayout with correct title and subtitle', () => {
    render(<LoginPage />);

    expect(screen.getByTestId('auth-layout')).toBeInTheDocument();
    expect(screen.getByTestId('auth-title')).toHaveTextContent('Sign in to your account');
    expect(screen.getByTestId('auth-subtitle')).toHaveTextContent(
      'Enter your credentials to access the admin panel'
    );
  });

  it('should render LoginForm', () => {
    render(<LoginPage />);

    expect(screen.getByTestId('login-form')).toBeInTheDocument();
  });

  it('should redirect to dashboard when already authenticated', async () => {
    mockIsAuthenticated.mockReturnValue(true);
    mockLocation.state = null;

    render(<LoginPage />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
    });
  });

  it('should redirect to from path when authenticated and from path is provided', async () => {
    mockIsAuthenticated.mockReturnValue(true);
    mockLocation.state = { from: { pathname: '/profile' } };

    render(<LoginPage />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/profile', { replace: true });
    });
  });

  it('should show toast message from location state', async () => {
    mockLocation.state = { message: 'Password reset successful!' };

    render(<LoginPage />);

    await waitFor(async () => {
      const toast = await import('react-hot-toast');
      expect(vi.mocked(toast.default.success)).toHaveBeenCalledWith('Password reset successful!');
    });
  });

  it('should not redirect when not authenticated', () => {
    mockIsAuthenticated.mockReturnValue(false);

    render(<LoginPage />);

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should not show toast when no message in location state', async () => {
    mockLocation.state = null;

    render(<LoginPage />);

    await waitFor(async () => {
      const toast = await import('react-hot-toast');
      expect(vi.mocked(toast.default.success)).not.toHaveBeenCalled();
    });
  });
});
