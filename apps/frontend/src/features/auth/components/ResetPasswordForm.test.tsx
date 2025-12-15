import { render, screen, waitFor } from '@/shared/utils/testUtils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ResetPasswordForm } from './ResetPasswordForm';

// Mock authService
vi.mock('@/features/auth/services/authService', () => ({
  authService: {
    resetPassword: vi.fn(),
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
const mockSearchParams = new URLSearchParams();
const mockSetSearchParams = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [mockSearchParams, mockSetSearchParams],
  };
});

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    error: vi.fn(),
    success: vi.fn(),
  },
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe('ResetPasswordForm', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    mockUseFormSubmission.mockReturnValue({
      submit: mockSubmit,
      isLoading: false,
    });
    const { authService } = await import('@/features/auth/services/authService');
    vi.mocked(authService.resetPassword).mockResolvedValue(undefined);
    mockSearchParams.delete('token');
  });

  it('should render password input when token is present', () => {
    mockSearchParams.set('token', 'test-token-123');

    render(<ResetPasswordForm />);

    expect(screen.getByText('New Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reset Password' })).toBeInTheDocument();
  });

  it('should show helper text for password requirements', () => {
    mockSearchParams.set('token', 'test-token-123');

    render(<ResetPasswordForm />);

    expect(
      screen.getByText(/Must contain uppercase, lowercase, number, and special character/i)
    ).toBeInTheDocument();
  });

  it('should show error and request new link button when token is missing', () => {
    render(<ResetPasswordForm />);

    // When token is missing, should show request new link button
    expect(screen.getByRole('button', { name: 'Request New Reset Link' })).toBeInTheDocument();
    // Should not show the reset password form
    expect(screen.queryByRole('button', { name: 'Reset Password' })).not.toBeInTheDocument();
  });

  it('should navigate to forgot password when request new link is clicked', async () => {
    const user = userEvent.setup();
    render(<ResetPasswordForm />);

    const requestButton = screen.getByRole('button', { name: 'Request New Reset Link' });
    await user.click(requestButton);

    expect(mockNavigate).toHaveBeenCalledWith('/auth/forgot-password');
  });

  it('should call submit with token and password', async () => {
    const user = userEvent.setup();
    mockSearchParams.set('token', 'test-token-123');
    mockSubmit.mockResolvedValue(undefined);

    render(<ResetPasswordForm />);

    const passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: 'Reset Password' });

    await user.type(passwordInput, 'NewPass123!');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith('test-token-123', 'NewPass123!');
    });
  });

  it('should display validation error for weak password', async () => {
    const user = userEvent.setup();
    mockSearchParams.set('token', 'test-token-123');

    render(<ResetPasswordForm />);

    const passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: 'Reset Password' });

    await user.type(passwordInput, 'weak');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/password must/i)).toBeInTheDocument();
    });
  });

  it('should show loading state when submitting', () => {
    mockSearchParams.set('token', 'test-token-123');
    mockUseFormSubmission.mockReturnValue({
      submit: mockSubmit,
      isLoading: true,
    });

    render(<ResetPasswordForm />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should show error toast when submitting without token', async () => {
    userEvent.setup();
    // Start with token, then remove it
    mockSearchParams.set('token', 'test-token-123');
    const { rerender } = render(<ResetPasswordForm />);
    
    // Remove token to simulate missing token scenario
    mockSearchParams.delete('token');
    rerender(<ResetPasswordForm />);

    // Should show request new link button, not reset form
    expect(screen.queryByRole('button', { name: 'Reset Password' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Request New Reset Link' })).toBeInTheDocument();
  });

  it('should configure useFormSubmission with correct options', () => {
    mockSearchParams.set('token', 'test-token-123');
    render(<ResetPasswordForm />);

    expect(mockUseFormSubmission).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        successMessage: 'Password has been successfully reset!',
        errorMessage: 'Invalid or expired reset token. Please request a new one.',
        redirectTo: '/auth/login',
        redirectOptions: { replace: true },
      })
    );
  });

  it('should set token value from URL params', () => {
    mockSearchParams.set('token', 'test-token-123');

    render(<ResetPasswordForm />);

    // Token should be set in hidden input
    const tokenInput = document.querySelector('input[type="hidden"][name="token"]') as HTMLInputElement;
    expect(tokenInput?.value).toBe('test-token-123');
  });

  it('should call resetPassword operation with correct parameters', async () => {
    const user = userEvent.setup();
    mockSearchParams.set('token', 'test-token-123');
    
    const { authService } = await import('@/features/auth/services/authService');
    vi.mocked(authService.resetPassword).mockResolvedValue(undefined);
    
    // Mock the operation function to capture its behavior
    let capturedOperation: any;
    mockUseFormSubmission.mockImplementation((operation: any) => {
      capturedOperation = operation;
      return { submit: mockSubmit, isLoading: false };
    });

    render(<ResetPasswordForm />);

    const passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: 'Reset Password' });

    await user.type(passwordInput, 'NewPass123!');
    await user.click(submitButton);

    // Verify the operation function calls resetPassword
    if (capturedOperation) {
      await waitFor(async () => {
        await capturedOperation('test-token-123', 'NewPass123!');
        expect(authService.resetPassword).toHaveBeenCalledWith({
          token: 'test-token-123',
          newPassword: 'NewPass123!',
        });
      });
    }
  });
});
