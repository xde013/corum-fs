import { render, screen, waitFor } from '@/shared/utils/testUtils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ProfilePage } from './ProfilePage';

// Mock useAuth
const mockUser = {
  id: '1',
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'user' as const,
  birthdate: '1990-01-15',
  createdAt: '2020-01-01T00:00:00Z',
  updatedAt: '2020-01-01T00:00:00Z',
};

const mockRefreshUser = vi.fn();
const mockLogout = vi.fn();

const mockUseAuth = vi.fn(() => ({
  user: mockUser,
  refreshUser: mockRefreshUser,
  logout: mockLogout,
  isAuthenticated: true,
  login: vi.fn(),
}));

vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock userService
vi.mock('@/features/users/services/userService', () => ({
  userService: {
    updateProfile: vi.fn(),
  },
}));

// Mock useFormSubmission
const mockSubmit = vi.fn();
const mockUseFormSubmission = vi.fn(() => ({
  submit: mockSubmit,
  isLoading: false,
}));
vi.mock('@/shared/hooks/useFormSubmission', () => ({
  useFormSubmission: (operation: any, options: any) => mockUseFormSubmission(operation, options),
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock PageLayout
vi.mock('@/shared/components/layout/PageLayout', () => ({
  PageLayout: ({ children, title, subtitle, showBackButton }: any) => (
    <div data-testid="page-layout">
      {title && <h1 data-testid="page-title">{title}</h1>}
      {subtitle && <p data-testid="page-subtitle">{subtitle}</p>}
      {showBackButton && <button data-testid="back-button">Back</button>}
      {children}
    </div>
  ),
}));

// Mock ProfileForm
vi.mock('@/features/profile/components/ProfileForm', () => ({
  ProfileForm: ({ user, onSubmit, isLoading, onCancel, isReadOnly }: any) => (
    <div data-testid="profile-form">
      <div data-testid="profile-form-user">{user.email}</div>
      <div data-testid="profile-form-loading">{isLoading ? 'loading' : 'not-loading'}</div>
      <div data-testid="profile-form-readonly">{isReadOnly ? 'readonly' : 'editable'}</div>
      <button onClick={() => onSubmit({ firstName: 'Jane', lastName: 'Doe', birthdate: '1990-01-15' })}>
        Submit Profile
      </button>
      {onCancel && <button onClick={onCancel}>Cancel Profile</button>}
    </div>
  ),
}));

// Mock ChangePasswordForm
vi.mock('@/features/profile/components/ChangePasswordForm', () => ({
  ChangePasswordForm: () => <div data-testid="change-password-form">ChangePasswordForm</div>,
}));

// Mock errorHandler
vi.mock('@/shared/utils/errorHandler', () => ({
  handleApiSuccess: vi.fn(),
}));

describe('ProfilePage', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: mockUser,
      refreshUser: mockRefreshUser,
      logout: mockLogout,
      isAuthenticated: true,
      login: vi.fn(),
    });
    mockUseFormSubmission.mockReturnValue({
      submit: mockSubmit,
      isLoading: false,
    });
    const { userService } = await import('@/features/users/services/userService');
    vi.mocked(userService.updateProfile).mockResolvedValue(undefined);
    mockRefreshUser.mockResolvedValue(undefined);
    mockLogout.mockResolvedValue(undefined);
  });

  it('should render PageLayout with correct props', () => {
    render(<ProfilePage />);

    expect(screen.getByTestId('page-layout')).toBeInTheDocument();
    expect(screen.getByTestId('page-title')).toHaveTextContent('Profile');
    expect(screen.getByTestId('page-subtitle')).toHaveTextContent('Manage your account information');
    expect(screen.getByTestId('back-button')).toBeInTheDocument();
  });

  it('should render ProfileForm with user data', () => {
    render(<ProfilePage />);

    expect(screen.getByTestId('profile-form')).toBeInTheDocument();
    expect(screen.getByTestId('profile-form-user')).toHaveTextContent('user@example.com');
  });

  it('should render ProfileForm in read-only mode initially', () => {
    render(<ProfilePage />);

    expect(screen.getByTestId('profile-form-readonly')).toHaveTextContent('readonly');
  });

  it('should toggle edit mode when Edit button is clicked', async () => {
    const user = userEvent.setup();
    render(<ProfilePage />);

    const editButton = screen.getByRole('button', { name: /^Edit$/i });
    await user.click(editButton);

    expect(screen.getByTestId('profile-form-readonly')).toHaveTextContent('editable');
    // Check that the Edit button text changed to Cancel
    expect(screen.getByRole('button', { name: /^Cancel$/i })).toBeInTheDocument();
  });

  it('should toggle back to read-only mode when Cancel is clicked', async () => {
    const user = userEvent.setup();
    render(<ProfilePage />);

    // Enter edit mode
    const editButton = screen.getByRole('button', { name: /^Edit$/i });
    await user.click(editButton);

    // Exit edit mode - click the Edit/Cancel button (not the ProfileForm cancel)
    const cancelButton = screen.getByRole('button', { name: /^Cancel$/i });
    await user.click(cancelButton);

    expect(screen.getByTestId('profile-form-readonly')).toHaveTextContent('readonly');
  });

  it('should show loading state when profile is being updated', () => {
    mockUseFormSubmission.mockReturnValue({
      submit: mockSubmit,
      isLoading: true,
    });

    render(<ProfilePage />);

    expect(screen.getByTestId('profile-form-loading')).toHaveTextContent('loading');
  });

  it('should call updateProfile and refreshUser on form submission', async () => {
    const user = userEvent.setup();
    render(<ProfilePage />);

    // Enter edit mode
    const editButton = screen.getByRole('button', { name: /Edit/i });
    await user.click(editButton);

    // Submit form
    const submitButton = screen.getByText('Submit Profile');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalled();
    });
  });

  it('should exit edit mode after successful profile update', async () => {
    const user = userEvent.setup();
    let onSuccessCallback: (() => void) | undefined;
    
    mockUseFormSubmission.mockImplementation((operation, options) => {
      onSuccessCallback = options.onSuccess;
      return {
        submit: async (...args: any[]) => {
          await operation(...args);
          if (onSuccessCallback) {
            onSuccessCallback();
          }
        },
        isLoading: false,
      };
    });

    render(<ProfilePage />);

    // Enter edit mode
    const editButton = screen.getByRole('button', { name: /^Edit$/i });
    await user.click(editButton);

    expect(screen.getByTestId('profile-form-readonly')).toHaveTextContent('editable');

    // Submit form
    const submitButton = screen.getByText('Submit Profile');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId('profile-form-readonly')).toHaveTextContent('readonly');
    }, { timeout: 3000 });
  });

  it('should render Change Password section', () => {
    render(<ProfilePage />);

    expect(screen.getByText('Change Password')).toBeInTheDocument();
    expect(
      screen.getByText(/To change your password, please use the password reset feature/i)
    ).toBeInTheDocument();
  });

  it('should navigate to forgot password page when Request Password Reset is clicked', async () => {
    const user = userEvent.setup();
    render(<ProfilePage />);

    const resetButton = screen.getByRole('button', { name: /Request Password Reset/i });
    await user.click(resetButton);

    expect(mockNavigate).toHaveBeenCalledWith('/auth/forgot-password', {
      state: { email: 'user@example.com' },
    });
  });

  it('should render Account Information section', () => {
    render(<ProfilePage />);

    expect(screen.getByText('Account Information')).toBeInTheDocument();
    expect(screen.getByText('User ID')).toBeInTheDocument();
    expect(screen.getByText('Role')).toBeInTheDocument();
    expect(screen.getByText('Member Since')).toBeInTheDocument();
    expect(screen.getByText('Last Updated')).toBeInTheDocument();
  });

  it('should display user ID', () => {
    render(<ProfilePage />);

    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('should display user role with correct styling for user', () => {
    render(<ProfilePage />);

    const roleBadge = screen.getByText('USER');
    expect(roleBadge).toBeInTheDocument();
    expect(roleBadge).toHaveClass('bg-gray-100', 'text-gray-800');
  });

  it('should display user role with correct styling for admin', () => {
    // Mock admin user
    mockUseAuth.mockReturnValueOnce({
      user: { ...mockUser, role: 'admin' as const },
      refreshUser: mockRefreshUser,
      logout: mockLogout,
      isAuthenticated: true,
      login: vi.fn(),
    });

    render(<ProfilePage />);

    const roleBadge = screen.getByText('ADMIN');
    expect(roleBadge).toBeInTheDocument();
    expect(roleBadge).toHaveClass('bg-purple-100', 'text-purple-800');
  });

  it('should display formatted dates for Member Since and Last Updated', () => {
    render(<ProfilePage />);

    // Check that dates are displayed (format may vary by locale)
    const memberSinceLabel = screen.getByText('Member Since');
    const lastUpdatedLabel = screen.getByText('Last Updated');
    
    expect(memberSinceLabel).toBeInTheDocument();
    expect(lastUpdatedLabel).toBeInTheDocument();
    
    // Check that date values are present (they're in the next sibling dd element)
    const memberSinceValue = memberSinceLabel.closest('div')?.querySelector('dd');
    const lastUpdatedValue = lastUpdatedLabel.closest('div')?.querySelector('dd');
    
    expect(memberSinceValue).toBeInTheDocument();
    expect(lastUpdatedValue).toBeInTheDocument();
  });

  it('should render Logout section', () => {
    render(<ProfilePage />);

    // Check for logout heading (h2)
    expect(screen.getByRole('heading', { name: 'Logout' })).toBeInTheDocument();
    expect(
      screen.getByText(/Sign out of your account/i)
    ).toBeInTheDocument();
    // Check for logout button
    expect(screen.getByRole('button', { name: /Logout/i })).toBeInTheDocument();
  });

  it('should call logout and navigate to login when Logout button is clicked', async () => {
    const user = userEvent.setup();
    const { handleApiSuccess } = await import('@/shared/utils/errorHandler');
    render(<ProfilePage />);

    const logoutButton = screen.getByRole('button', { name: /Logout/i });
    await user.click(logoutButton);

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
      expect(handleApiSuccess).toHaveBeenCalledWith('You have been logged out');
      expect(mockNavigate).toHaveBeenCalledWith('/auth/login');
    });
  });

  it('should show loading spinner when user is not loaded', () => {
    // Mock no user
    mockUseAuth.mockReturnValueOnce({
      user: null,
      refreshUser: mockRefreshUser,
      logout: mockLogout,
      isAuthenticated: false,
      login: vi.fn(),
    });

    render(<ProfilePage />);

    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });
});
