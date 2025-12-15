import { render, screen, waitFor } from '@/shared/utils/testUtils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ChangePasswordForm } from './ChangePasswordForm';

describe('ChangePasswordForm', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnSubmit.mockResolvedValue(undefined);
  });

  it('should render collapsed state with Change Password button', () => {
    render(<ChangePasswordForm onSubmit={mockOnSubmit} />);

    expect(screen.getByRole('button', { name: 'Change Password' })).toBeInTheDocument();
    expect(screen.queryByLabelText('Current Password')).not.toBeInTheDocument();
  });

  it('should expand form when Change Password button is clicked', async () => {
    const user = userEvent.setup();
    render(<ChangePasswordForm onSubmit={mockOnSubmit} />);

    const changePasswordButton = screen.getByRole('button', { name: 'Change Password' });
    await user.click(changePasswordButton);

    await waitFor(() => {
      expect(screen.getByText('Current Password')).toBeInTheDocument();
      expect(screen.getByText('New Password')).toBeInTheDocument();
      expect(screen.getByText('Confirm New Password')).toBeInTheDocument();
    });
  });

  it('should render all password fields when expanded', async () => {
    const user = userEvent.setup();
    render(<ChangePasswordForm onSubmit={mockOnSubmit} />);

    const changePasswordButton = screen.getByRole('button', { name: 'Change Password' });
    await user.click(changePasswordButton);

    expect(screen.getByText('Current Password')).toBeInTheDocument();
    expect(screen.getByText('New Password')).toBeInTheDocument();
    expect(screen.getByText('Confirm New Password')).toBeInTheDocument();
  });

  it('should show helper text for new password field', async () => {
    const user = userEvent.setup();
    render(<ChangePasswordForm onSubmit={mockOnSubmit} />);

    const changePasswordButton = screen.getByRole('button', { name: 'Change Password' });
    await user.click(changePasswordButton);

    expect(
      screen.getByText(
        /Must be 8-128 characters with uppercase, lowercase, number, and special character/i
      )
    ).toBeInTheDocument();
  });

  it('should call onSubmit with form data when submitted', async () => {
    const user = userEvent.setup();
    render(<ChangePasswordForm onSubmit={mockOnSubmit} />);

    // Expand form
    const changePasswordButton = screen.getByRole('button', { name: 'Change Password' });
    await user.click(changePasswordButton);

    // Fill form
    const currentPasswordInput = document.querySelectorAll('input[type="password"]')[0] as HTMLInputElement;
    const newPasswordInput = document.querySelectorAll('input[type="password"]')[1] as HTMLInputElement;
    const confirmPasswordInput = document.querySelectorAll('input[type="password"]')[2] as HTMLInputElement;

    await user.type(currentPasswordInput, 'CurrentPass123!');
    await user.type(newPasswordInput, 'NewPass123!');
    await user.type(confirmPasswordInput, 'NewPass123!');

    // Submit form
    const submitButton = screen.getByRole('button', { name: 'Change Password', hidden: true });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        currentPassword: 'CurrentPass123!',
        newPassword: 'NewPass123!',
        confirmPassword: 'NewPass123!',
      });
    });
  });

  it('should reset form and collapse after successful submission', async () => {
    const user = userEvent.setup();
    render(<ChangePasswordForm onSubmit={mockOnSubmit} />);

    // Expand form
    const changePasswordButton = screen.getByRole('button', { name: 'Change Password' });
    await user.click(changePasswordButton);

    // Fill and submit form
    const currentPasswordInput = document.querySelectorAll('input[type="password"]')[0] as HTMLInputElement;
    const newPasswordInput = document.querySelectorAll('input[type="password"]')[1] as HTMLInputElement;
    const confirmPasswordInput = document.querySelectorAll('input[type="password"]')[2] as HTMLInputElement;

    await user.type(currentPasswordInput, 'CurrentPass123!');
    await user.type(newPasswordInput, 'NewPass123!');
    await user.type(confirmPasswordInput, 'NewPass123!');

    const submitButton = screen.getByRole('button', { name: 'Change Password', hidden: true });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });

    // Form should be collapsed again
    await waitFor(() => {
      expect(screen.queryByLabelText('Current Password')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Change Password' })).toBeInTheDocument();
    });
  });

  it('should collapse form when Cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<ChangePasswordForm onSubmit={mockOnSubmit} />);

    // Expand form
    const changePasswordButton = screen.getByRole('button', { name: 'Change Password' });
    await user.click(changePasswordButton);

    // Click cancel
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);

    // Form should be collapsed
    expect(screen.queryByLabelText('Current Password')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Change Password' })).toBeInTheDocument();
  });

  it('should reset form when Cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<ChangePasswordForm onSubmit={mockOnSubmit} />);

    // Expand form
    let changePasswordButton = screen.getByRole('button', { name: 'Change Password' });
    await user.click(changePasswordButton);

    await waitFor(() => {
      expect(screen.getByText('Current Password')).toBeInTheDocument();
    });

    // Fill form
    const currentPasswordInput = document.querySelectorAll('input[type="password"]')[0] as HTMLInputElement;
    await user.type(currentPasswordInput, 'SomePassword123!');
    expect(currentPasswordInput.value).toBe('SomePassword123!');

    // Click cancel
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);

    // Wait for form to collapse
    await waitFor(() => {
      expect(screen.queryByText('Current Password')).not.toBeInTheDocument();
    });

    // Expand again - form should be empty
    changePasswordButton = screen.getByRole('button', { name: 'Change Password' });
    await user.click(changePasswordButton);
    
    await waitFor(() => {
      expect(screen.getByText('Current Password')).toBeInTheDocument();
      const inputs = document.querySelectorAll('input[type="password"]');
      expect(inputs.length).toBeGreaterThan(0);
      const currentPasswordInputAfterReset = inputs[0] as HTMLInputElement;
      expect(currentPasswordInputAfterReset.value).toBe('');
    });
  });

  it('should display validation error for empty current password', async () => {
    const user = userEvent.setup();
    render(<ChangePasswordForm onSubmit={mockOnSubmit} />);

    // Expand form
    const changePasswordButton = screen.getByRole('button', { name: 'Change Password' });
    await user.click(changePasswordButton);

    await waitFor(() => {
      expect(screen.getByText('Current Password')).toBeInTheDocument();
    });

    // Fill other fields to make form dirty
    const newPasswordInput = document.querySelectorAll('input[type="password"]')[1] as HTMLInputElement;
    const confirmPasswordInput = document.querySelectorAll('input[type="password"]')[2] as HTMLInputElement;
    await user.type(newPasswordInput, 'NewPass123!');
    await user.type(confirmPasswordInput, 'NewPass123!');

    // Try to submit without filling current password
    const submitButton = screen.getByRole('button', { name: 'Change Password', hidden: true });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Current password is required/i)).toBeInTheDocument();
    });
  });

  it('should display validation error for weak new password', async () => {
    const user = userEvent.setup();
    render(<ChangePasswordForm onSubmit={mockOnSubmit} />);

    // Expand form
    const changePasswordButton = screen.getByRole('button', { name: 'Change Password' });
    await user.click(changePasswordButton);

    // Fill with weak password
    const currentPasswordInput = document.querySelectorAll('input[type="password"]')[0] as HTMLInputElement;
    const newPasswordInput = document.querySelectorAll('input[type="password"]')[1] as HTMLInputElement;
    const confirmPasswordInput = document.querySelectorAll('input[type="password"]')[2] as HTMLInputElement;

    await user.type(currentPasswordInput, 'CurrentPass123!');
    await user.type(newPasswordInput, 'weak');
    await user.type(confirmPasswordInput, 'weak');

    // Try to submit
    const submitButton = screen.getByRole('button', { name: 'Change Password', hidden: true });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/password must/i)).toBeInTheDocument();
    });
  });

  it('should display validation error when passwords do not match', async () => {
    const user = userEvent.setup();
    render(<ChangePasswordForm onSubmit={mockOnSubmit} />);

    // Expand form
    const changePasswordButton = screen.getByRole('button', { name: 'Change Password' });
    await user.click(changePasswordButton);

    // Fill with mismatched passwords
    const currentPasswordInput = document.querySelectorAll('input[type="password"]')[0] as HTMLInputElement;
    const newPasswordInput = document.querySelectorAll('input[type="password"]')[1] as HTMLInputElement;
    const confirmPasswordInput = document.querySelectorAll('input[type="password"]')[2] as HTMLInputElement;

    await user.type(currentPasswordInput, 'CurrentPass123!');
    await user.type(newPasswordInput, 'NewPass123!');
    await user.type(confirmPasswordInput, 'DifferentPass123!');

    // Try to submit
    const submitButton = screen.getByRole('button', { name: 'Change Password', hidden: true });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
    });
  });

  it('should disable submit button when form is not dirty', async () => {
    const user = userEvent.setup();
    render(<ChangePasswordForm onSubmit={mockOnSubmit} />);

    // Expand form
    const changePasswordButton = screen.getByRole('button', { name: 'Change Password' });
    await user.click(changePasswordButton);

    // Submit button should be disabled initially
    const submitButton = screen.getByRole('button', { name: 'Change Password', hidden: true });
    expect(submitButton).toBeDisabled();
  });

  it('should enable submit button when form is dirty', async () => {
    const user = userEvent.setup();
    render(<ChangePasswordForm onSubmit={mockOnSubmit} />);

    // Expand form
    const changePasswordButton = screen.getByRole('button', { name: 'Change Password' });
    await user.click(changePasswordButton);

    // Fill form
    const currentPasswordInput = document.querySelectorAll('input[type="password"]')[0] as HTMLInputElement;
    await user.type(currentPasswordInput, 'CurrentPass123!');

    // Submit button should be enabled
    const submitButton = screen.getByRole('button', { name: 'Change Password', hidden: true });
    expect(submitButton).not.toBeDisabled();
  });

  it('should show loading state when isLoading is true', async () => {
    const user = userEvent.setup();
    render(<ChangePasswordForm onSubmit={mockOnSubmit} isLoading={true} />);

    // Expand form
    const changePasswordButton = screen.getByRole('button', { name: 'Change Password' });
    await user.click(changePasswordButton);

    // Submit button should show loading
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should disable Cancel button when isLoading is true', async () => {
    const user = userEvent.setup();
    render(<ChangePasswordForm onSubmit={mockOnSubmit} isLoading={true} />);

    // Expand form
    const changePasswordButton = screen.getByRole('button', { name: 'Change Password' });
    await user.click(changePasswordButton);

    // Cancel button should be disabled
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    expect(cancelButton).toBeDisabled();
  });

  it('should disable submit button when isLoading is true', async () => {
    const user = userEvent.setup();
    render(<ChangePasswordForm onSubmit={mockOnSubmit} isLoading={true} />);

    // Expand form
    const changePasswordButton = screen.getByRole('button', { name: 'Change Password' });
    await user.click(changePasswordButton);

    await waitFor(() => {
      expect(screen.getByText('Current Password')).toBeInTheDocument();
    });

    // Fill form to make it dirty
    const currentPasswordInput = document.querySelectorAll('input[type="password"]')[0] as HTMLInputElement;
    await user.type(currentPasswordInput, 'CurrentPass123!');

    // Submit button should be disabled when isLoading is true
    // Component sets disabled={!isDirty || isLoading}, so even if dirty, it's disabled when loading
    // When loading, button shows "Loading..." text, so we find it by that
    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: 'Loading...' });
      expect(submitButton).toBeDisabled();
    });
  });
});
