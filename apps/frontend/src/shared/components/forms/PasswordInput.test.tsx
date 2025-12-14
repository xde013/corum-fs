import { render, screen, waitFor } from '@/shared/utils/testUtils';
import { PasswordInput } from './PasswordInput';
import { describe, it, expect } from 'vitest';
import userEvent from '@testing-library/user-event';

describe('PasswordInput', () => {
  it('should render password input with label', () => {
    render(<PasswordInput label="Password" />);
    const input = screen.getByLabelText('Password') as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.type).toBe('password');
  });

  it('should toggle password visibility when eye icon is clicked', async () => {
    const user = userEvent.setup();
    render(<PasswordInput label="Password" />);
    const input = screen.getByLabelText('Password') as HTMLInputElement;
    const toggleButton = screen.getByLabelText(/show password/i);

    expect(input.type).toBe('password');

    await user.click(toggleButton);
    await waitFor(() => {
      expect(input.type).toBe('text');
    });

    await user.click(toggleButton);
    await waitFor(() => {
      expect(input.type).toBe('password');
    });
  });

  it('should display error message', () => {
    render(<PasswordInput label="Password" error="Password is required" />);
    expect(screen.getByText('Password is required')).toBeInTheDocument();
  });

  it('should display helper text when no error', () => {
    render(
      <PasswordInput
        label="Password"
        helperText="Must be 8 characters"
      />
    );
    expect(screen.getByText('Must be 8 characters')).toBeInTheDocument();
  });

  it('should forward input props', () => {
    render(
      <PasswordInput
        label="Password"
        placeholder="Enter password"
        disabled
        autoComplete="new-password"
      />
    );
    const input = screen.getByLabelText('Password') as HTMLInputElement;
    expect(input.placeholder).toBe('Enter password');
    expect(input).toBeDisabled();
    expect(input).toHaveAttribute('autocomplete', 'new-password');
  });
});
