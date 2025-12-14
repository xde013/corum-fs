import { render, screen } from '@/shared/utils/testUtils';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock useAuth before importing NotFoundPage
const mockUseAuth = vi.fn();
vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

// Import after mock is set up
import { NotFoundPage } from './NotFoundPage';

describe('NotFoundPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render 404 heading', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });

    render(<NotFoundPage />);
    expect(screen.getByText('404')).toBeInTheDocument();
  });

  it('should render "You\'re lost" message', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });

    render(<NotFoundPage />);
    expect(screen.getByText("You're lost")).toBeInTheDocument();
  });

  it('should show "Go to Login" link when not authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });

    render(<NotFoundPage />);
    const link = screen.getByText('Go to Login');
    expect(link).toBeInTheDocument();
    expect(link.closest('a')).toHaveAttribute('href', '/auth/login');
  });

  it('should show "Go to Dashboard" link when authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { id: '1', email: 'test@example.com' } as any,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });

    render(<NotFoundPage />);
    const link = screen.getByText('Go to Dashboard');
    expect(link).toBeInTheDocument();
    expect(link.closest('a')).toHaveAttribute('href', '/dashboard');
  });
});
