import { render, screen, waitFor } from '@/shared/utils/testUtils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ProfileForm } from './ProfileForm';
import type { User } from '@/shared/types';

// Mock DatePicker
vi.mock('@/shared/components/forms/DatePicker', () => ({
  DatePicker: ({ label, value, onChange, error, disabled, required }: any) => (
    <div>
      <label htmlFor="birthdate">{label}</label>
      {required && <span>*</span>}
      <input
        id="birthdate"
        type="date"
        value={value || ''}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        data-testid="birthdate-input"
      />
      {error && <span role="alert">{error}</span>}
    </div>
  ),
}));

describe('ProfileForm', () => {
  const mockUser: User = {
    id: '1',
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'user',
    birthdate: '1990-01-15',
    createdAt: '2020-01-01T00:00:00Z',
    updatedAt: '2020-01-01T00:00:00Z',
  };

  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnSubmit.mockResolvedValue(undefined);
  });

  it('should render form with user data', () => {
    render(<ProfileForm user={mockUser} onSubmit={mockOnSubmit} />);

    expect(screen.getByDisplayValue('John')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('john.doe@example.com')).toBeInTheDocument();
  });

  it('should render email field as disabled', () => {
    render(<ProfileForm user={mockUser} onSubmit={mockOnSubmit} />);

    const emailInput = screen.getByDisplayValue('john.doe@example.com');
    expect(emailInput).toBeDisabled();
  });

  it('should show helper text for email field', () => {
    render(<ProfileForm user={mockUser} onSubmit={mockOnSubmit} />);

    expect(screen.getByText('Email cannot be changed')).toBeInTheDocument();
  });

  it('should render birthdate field', () => {
    render(<ProfileForm user={mockUser} onSubmit={mockOnSubmit} />);

    expect(screen.getByText('Birthdate')).toBeInTheDocument();
    const birthdateInput = screen.getByTestId('birthdate-input') as HTMLInputElement;
    expect(birthdateInput.value).toBe('1990-01-15');
  });

  it('should render Save Changes button', () => {
    render(<ProfileForm user={mockUser} onSubmit={mockOnSubmit} />);

    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument();
  });

  it('should disable Save Changes button when form is not dirty', () => {
    render(<ProfileForm user={mockUser} onSubmit={mockOnSubmit} />);

    const saveButton = screen.getByRole('button', { name: 'Save Changes' });
    expect(saveButton).toBeDisabled();
  });

  it('should enable Save Changes button when form is dirty', async () => {
    const user = userEvent.setup();
    render(<ProfileForm user={mockUser} onSubmit={mockOnSubmit} />);

    const firstNameInput = screen.getByDisplayValue('John');
    await user.clear(firstNameInput);
    await user.type(firstNameInput, 'Jane');

    const saveButton = screen.getByRole('button', { name: 'Save Changes' });
    expect(saveButton).not.toBeDisabled();
  });

  it('should call onSubmit with form data when submitted', async () => {
    const user = userEvent.setup();
    render(<ProfileForm user={mockUser} onSubmit={mockOnSubmit} />);

    // Make form dirty by changing first name
    const firstNameInput = screen.getByDisplayValue('John');
    await user.clear(firstNameInput);
    await user.type(firstNameInput, 'Jane');

    // Wait for form to be dirty and button enabled
    const saveButton = await screen.findByRole('button', { name: 'Save Changes' });
    await waitFor(() => {
      expect(saveButton).not.toBeDisabled();
    });

    // Submit form
    await user.click(saveButton);

    // Wait for submission
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    }, { timeout: 3000 });

    // Check the call arguments - use toHaveBeenCalledWith for exact match
    const callArgs = mockOnSubmit.mock.calls[0][0];
    expect(callArgs).toMatchObject({
      firstName: 'Jane',
      lastName: 'Doe',
      birthdate: '1990-01-15',
    });
  });

  it('should handle birthdate changes', async () => {
    const user = userEvent.setup();
    render(<ProfileForm user={mockUser} onSubmit={mockOnSubmit} />);

    const birthdateInput = screen.getByTestId('birthdate-input') as HTMLInputElement;
    await user.clear(birthdateInput);
    await user.type(birthdateInput, '1995-05-20');

    // Wait for form to be dirty and button enabled
    const saveButton = await screen.findByRole('button', { name: 'Save Changes' });
    await waitFor(() => {
      expect(saveButton).not.toBeDisabled();
    });

    // Submit form
    await user.click(saveButton);

    // Wait for submission
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    }, { timeout: 3000 });

    // Check the call arguments
    const callArgs = mockOnSubmit.mock.calls[0][0];
    expect(callArgs).toMatchObject({
      firstName: 'John',
      lastName: 'Doe',
      birthdate: '1995-05-20',
    });
  });

  it('should display validation error for invalid first name', async () => {
    const user = userEvent.setup();
    render(<ProfileForm user={mockUser} onSubmit={mockOnSubmit} />);

    const firstNameInput = screen.getByDisplayValue('John');
    await user.clear(firstNameInput);
    await user.type(firstNameInput, 'A'); // Too short

    const saveButton = screen.getByRole('button', { name: 'Save Changes' });
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/First name must be at least/i)).toBeInTheDocument();
    });
  });

  it('should display validation error for invalid last name', async () => {
    const user = userEvent.setup();
    render(<ProfileForm user={mockUser} onSubmit={mockOnSubmit} />);

    const lastNameInput = screen.getByDisplayValue('Doe');
    await user.clear(lastNameInput);
    await user.type(lastNameInput, 'A'); // Too short

    const saveButton = screen.getByRole('button', { name: 'Save Changes' });
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/Last name must be at least/i)).toBeInTheDocument();
    });
  });

  it('should show loading state when isLoading is true', () => {
    render(<ProfileForm user={mockUser} onSubmit={mockOnSubmit} isLoading={true} />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should disable Save Changes button when isLoading is true', async () => {
    const user = userEvent.setup();
    render(<ProfileForm user={mockUser} onSubmit={mockOnSubmit} isLoading={true} />);

    // Make form dirty
    const firstNameInput = screen.getByDisplayValue('John');
    await user.clear(firstNameInput);
    await user.type(firstNameInput, 'Jane');

    // Button should still be disabled due to loading
    const saveButton = screen.getByRole('button', { name: 'Loading...' });
    expect(saveButton).toBeDisabled();
  });

  it('should render Cancel button when onCancel is provided', () => {
    const mockOnCancel = vi.fn();
    render(<ProfileForm user={mockUser} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('should not render Cancel button when onCancel is not provided', () => {
    render(<ProfileForm user={mockUser} onSubmit={mockOnSubmit} />);

    expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
  });

  it('should call onCancel when Cancel button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnCancel = vi.fn();
    render(<ProfileForm user={mockUser} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('should disable Cancel button when isLoading is true', () => {
    const mockOnCancel = vi.fn();
    render(<ProfileForm user={mockUser} onSubmit={mockOnSubmit} onCancel={mockOnCancel} isLoading={true} />);

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    expect(cancelButton).toBeDisabled();
  });

  it('should hide buttons when isReadOnly is true', () => {
    render(<ProfileForm user={mockUser} onSubmit={mockOnSubmit} isReadOnly={true} />);

    expect(screen.queryByRole('button', { name: 'Save Changes' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
  });

  it('should disable form fields when isReadOnly is true', () => {
    render(<ProfileForm user={mockUser} onSubmit={mockOnSubmit} isReadOnly={true} />);

    const firstNameInput = screen.getByDisplayValue('John');
    const lastNameInput = screen.getByDisplayValue('Doe');
    const birthdateInput = screen.getByTestId('birthdate-input') as HTMLInputElement;

    expect(firstNameInput).toBeDisabled();
    expect(lastNameInput).toBeDisabled();
    expect(birthdateInput).toBeDisabled();
  });

  it('should handle user without birthdate', () => {
    const userWithoutBirthdate: User = {
      ...mockUser,
      birthdate: '',
    };

    render(<ProfileForm user={userWithoutBirthdate} onSubmit={mockOnSubmit} />);

    const birthdateInput = screen.getByTestId('birthdate-input') as HTMLInputElement;
    expect(birthdateInput.value).toBe('');
  });

  it('should format birthdate correctly', () => {
    const userWithDate: User = {
      ...mockUser,
      birthdate: '1990-01-15',
    };

    render(<ProfileForm user={userWithDate} onSubmit={mockOnSubmit} />);

    const birthdateInput = screen.getByTestId('birthdate-input') as HTMLInputElement;
    expect(birthdateInput.value).toBe('1990-01-15');
  });
});
