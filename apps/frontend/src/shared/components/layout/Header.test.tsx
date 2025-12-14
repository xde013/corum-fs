import { render, screen } from '@/shared/utils/testUtils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Header } from './Header';

// Mock useAuth
const mockUseAuth = vi.fn();
vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
  });

  it('should not render when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
    });

    const { container } = render(<Header />);
    expect(container.firstChild).toBeNull();
  });

  it('should render when user is authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        role: 'user',
      },
      isAuthenticated: true,
    });

    render(<Header />);
    expect(screen.getByText('Corum')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  it('should display user name and email', () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: '1',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        role: 'admin',
      },
      isAuthenticated: true,
    });

    render(<Header />);
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });

  it('should display user role badge', () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: '1',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        role: 'admin',
      },
      isAuthenticated: true,
    });

    render(<Header />);
    expect(screen.getByText('ADMIN')).toBeInTheDocument();
  });

  it('should navigate to dashboard when logo is clicked', () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        role: 'user',
      },
      isAuthenticated: true,
    });

    render(<Header />);
    const logoButton = screen.getByText('Corum');
    logoButton.click();

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('should navigate to profile when profile button is clicked', () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        role: 'user',
      },
      isAuthenticated: true,
    });

    render(<Header />);
    const profileButton = screen.getByText('Profile');
    profileButton.click();

    expect(mockNavigate).toHaveBeenCalledWith('/profile');
  });

  it('should show avatar initials when user has name', () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        role: 'user',
      },
      isAuthenticated: true,
    });

    render(<Header />);
    // Avatar should show "JD" for John Doe
    expect(screen.getByText('JD')).toBeInTheDocument();
  });
});
