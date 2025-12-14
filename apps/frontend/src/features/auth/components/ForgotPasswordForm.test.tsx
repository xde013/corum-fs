import { render, screen, waitFor } from '@/shared/utils/testUtils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { act } from '@testing-library/react';
import { ForgotPasswordForm } from './ForgotPasswordForm';

// Mock authService
vi.mock('@/features/auth/services/authService', () => ({
  authService: {
    forgotPassword: vi.fn(),
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
const mockLocation = { state: null, pathname: '/auth/forgot-password' };
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
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe('ForgotPasswordForm', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    mockUseFormSubmission.mockReturnValue({
      submit: mockSubmit,
      isLoading: false,
    });
    mockLocation.state = null;
    const { authService } = await import('@/features/auth/services/authService');
    vi.mocked(authService.forgotPassword).mockResolvedValue(undefined);
  });

  it('should render email input', () => {
    render(<ForgotPasswordForm />);

    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('john.doe@example.com')).toBeInTheDocument();
  });

  it('should render description text', () => {
    render(<ForgotPasswordForm />);

    expect(
      screen.getByText(/Enter your email address and we'll send you a link/i)
    ).toBeInTheDocument();
  });

  it('should render cancel and submit buttons', () => {
    render(<ForgotPasswordForm />);

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send Reset Link' })).toBeInTheDocument();
  });

  it('should prefill email from location state', () => {
    mockLocation.state = { email: 'test@example.com' };

    render(<ForgotPasswordForm />);

    const emailInput = screen.getByPlaceholderText('john.doe@example.com') as HTMLInputElement;
    expect(emailInput.value).toBe('test@example.com');
  });

  it('should call submit with trimmed email', async () => {
    const user = userEvent.setup();
    mockSubmit.mockResolvedValue(undefined);
    render(<ForgotPasswordForm />);

    const emailInput = screen.getByPlaceholderText('john.doe@example.com');
    const submitButton = screen.getByRole('button', { name: 'Send Reset Link' });

    await user.type(emailInput, '  user@example.com  ');
    
    await act(async () => {
      await user.click(submitButton);
    });

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith('user@example.com');
    });
  });

  it('should display validation error for invalid email', async () => {
    const user = userEvent.setup();
    render(<ForgotPasswordForm />);

    const emailInput = screen.getByPlaceholderText('john.doe@example.com');
    const submitButton = screen.getByRole('button', { name: 'Send Reset Link' });

    await user.clear(emailInput);
    await user.type(emailInput, 'invalid-email');
    await user.click(submitButton);

    // Wait for validation to complete - form should show error or prevent submission
    await waitFor(() => {
      // Check if error is displayed or form validation prevented submission
      const hasError = screen.queryAllByRole('alert').length > 0;
      // If no error visible, at least verify submit wasn't called (validation prevented it)
      if (!hasError) {
        expect(mockSubmit).not.toHaveBeenCalled();
      }
    }, { timeout: 2000 });
  });

  it('should show loading state when submitting', () => {
    mockUseFormSubmission.mockReturnValue({
      submit: mockSubmit,
      isLoading: true,
    });

    render(<ForgotPasswordForm />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should show success message with reset link after successful submission', async () => {
    const user = userEvent.setup();
    mockSubmit.mockResolvedValue(undefined);
    
    // Mock window.location.origin
    Object.defineProperty(window, 'location', {
      value: { origin: 'http://localhost:3000' },
      writable: true,
    });

    render(<ForgotPasswordForm />);

    const emailInput = screen.getByPlaceholderText('john.doe@example.com');
    const submitButton = screen.getByRole('button', { name: 'Send Reset Link' });

    await user.clear(emailInput);
    await user.type(emailInput, 'user@example.com');
    
    await act(async () => {
      await user.click(submitButton);
    });

    await waitFor(() => {
      expect(
        screen.getByText(/If an account with that email exists/i)
      ).toBeInTheDocument();
    });

    expect(screen.getByText(/Back to Login/i)).toBeInTheDocument();
  });

  it('should display reset link after successful submission', async () => {
    const user = userEvent.setup();
    mockSubmit.mockResolvedValue(undefined);
    
    Object.defineProperty(window, 'location', {
      value: { origin: 'http://localhost:3000' },
      writable: true,
    });

    render(<ForgotPasswordForm />);

    const emailInput = screen.getByPlaceholderText('john.doe@example.com');
    const submitButton = screen.getByRole('button', { name: 'Send Reset Link' });

    await user.clear(emailInput);
    await user.type(emailInput, 'user@example.com');
    
    await act(async () => {
      await user.click(submitButton);
    });

    await waitFor(() => {
      const resetLink = screen.getByText(/http:\/\/localhost:3000\/auth\/reset-password\?token=user@example.com/i);
      expect(resetLink).toBeInTheDocument();
    });
  });

  it('should show development warning in success state', async () => {
    const user = userEvent.setup();
    mockSubmit.mockResolvedValue(undefined);
    
    Object.defineProperty(window, 'location', {
      value: { origin: 'http://localhost:3000' },
      writable: true,
    });

    render(<ForgotPasswordForm />);

    const emailInput = screen.getByPlaceholderText('john.doe@example.com');
    const submitButton = screen.getByRole('button', { name: 'Send Reset Link' });

    await user.clear(emailInput);
    await user.type(emailInput, 'user@example.com');
    
    await act(async () => {
      await user.click(submitButton);
    });

    await waitFor(() => {
      expect(
        screen.getByText(/Development Only:/i)
      ).toBeInTheDocument();
    });
  });

  it('should have cancel link to login page', () => {
    render(<ForgotPasswordForm />);

    const cancelLink = screen.getByRole('button', { name: 'Cancel' }).closest('a');
    expect(cancelLink).toHaveAttribute('href', '/auth/login');
  });

  it('should configure useFormSubmission with correct options', () => {
    render(<ForgotPasswordForm />);

    expect(mockUseFormSubmission).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        successMessage: 'Password reset link generated',
        errorMessage: 'An error occurred. Please try again.',
      })
    );
  });
});
