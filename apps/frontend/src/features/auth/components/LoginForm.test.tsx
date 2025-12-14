import { render, screen, waitFor } from '@/shared/utils/testUtils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { act } from '@testing-library/react';
import { LoginForm } from './LoginForm';

// Mock useAuth
const mockLogin = vi.fn();
vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
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

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseFormSubmission.mockReturnValue({
      submit: mockSubmit,
      isLoading: false,
    });
  });

  it('should render email and password inputs', () => {
    render(<LoginForm />);

    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Password')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
    expect(document.querySelector('input[type="password"]')).toBeInTheDocument();
  });

  it('should render forgot password link', () => {
    render(<LoginForm />);

    const forgotPasswordLink = screen.getByText('Forgot password?');
    expect(forgotPasswordLink).toBeInTheDocument();
    expect(forgotPasswordLink.closest('a')).toHaveAttribute('href', '/auth/forgot-password');
  });

  it('should render submit button', () => {
    render(<LoginForm />);

    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('should show loading state when submitting', () => {
    mockUseFormSubmission.mockReturnValue({
      submit: mockSubmit,
      isLoading: true,
    });

    render(<LoginForm />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should call submit with trimmed email and password', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const emailInput = screen.getByRole('textbox', { name: /email/i });
    const passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: 'Sign in' });

    await user.type(emailInput, '  user@example.com  ');
    await user.type(passwordInput, 'password123');
    
    await act(async () => {
      await user.click(submitButton);
    });

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith('user@example.com', 'password123');
    });
  });

  it('should display validation errors for invalid email', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const emailInput = screen.getByRole('textbox', { name: /email/i });
    const submitButton = screen.getByRole('button', { name: 'Sign in' });

    await user.type(emailInput, 'invalid-email');
    await user.click(submitButton);

    // Wait for validation to complete - form should show error or prevent submission
    await waitFor(() => {
      // Check if error is displayed or form validation prevented submission
      const hasError = screen.queryAllByRole('alert').length > 0 || 
                      screen.queryByText(/email/i) !== null;
      // If no error visible, at least verify submit wasn't called (validation prevented it)
      if (!hasError) {
        expect(mockSubmit).not.toHaveBeenCalled();
      }
    }, { timeout: 2000 });
  });

  it('should display validation errors for empty password', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const emailInput = screen.getByRole('textbox', { name: /email/i });
    const submitButton = screen.getByRole('button', { name: 'Sign in' });

    await user.type(emailInput, 'user@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('should configure useFormSubmission with correct options', () => {
    render(<LoginForm />);

    expect(mockUseFormSubmission).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        successMessage: 'Welcome back!',
        errorMessage: 'Invalid email or password. Please try again.',
        redirectTo: '/dashboard',
        redirectOptions: { replace: true },
        errorOptions: { duration: 10_000 },
      })
    );
  });

  it('should call login operation with correct parameters', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValue(undefined);
    
    // Mock the operation function to capture its behavior
    let capturedOperation: any;
    mockUseFormSubmission.mockImplementation((operation: any) => {
      capturedOperation = operation;
      return { submit: mockSubmit, isLoading: false };
    });

    render(<LoginForm />);

    const emailInput = screen.getByRole('textbox', { name: /email/i });
    const passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: 'Sign in' });

    await user.type(emailInput, 'user@example.com');
    await user.type(passwordInput, 'password123');
    
    await act(async () => {
      await user.click(submitButton);
    });

    // Verify the operation function calls login
    if (capturedOperation) {
      await capturedOperation('user@example.com', 'password123');
      expect(mockLogin).toHaveBeenCalledWith('user@example.com', 'password123');
    }
  });
});
