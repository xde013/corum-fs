import { render, screen } from '@/shared/utils/testUtils';
import { PasswordField } from './PasswordField';
import { useForm } from 'react-hook-form';
import { describe, it, expect } from 'vitest';

interface TestFormData {
  password: string;
}

describe('PasswordField', () => {
  it('should render password field with default label', () => {
    const TestComponent = () => {
      const {
        register,
        formState: { errors },
      } = useForm<TestFormData>();

      return (
        <PasswordField
          register={register}
          passwordField="password"
          errors={errors}
        />
      );
    };

    render(<TestComponent />);
    // Label includes asterisk for required field, so use flexible matcher
    const input = screen.getByLabelText(/^Password/i) as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.type).toBe('password');
  });

  it('should use custom label', () => {
    const TestComponent = () => {
      const {
        register,
        formState: { errors },
      } = useForm<TestFormData>();

      return (
        <PasswordField
          register={register}
          passwordField="password"
          errors={errors}
          label="New Password"
        />
      );
    };

    render(<TestComponent />);
    // Label includes asterisk for required field
    const input = screen.getByLabelText(/^New Password/i) as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.type).toBe('password');
  });

  it('should display default helper text', () => {
    const TestComponent = () => {
      const {
        register,
        formState: { errors },
      } = useForm<TestFormData>();

      return (
        <PasswordField
          register={register}
          passwordField="password"
          errors={errors}
        />
      );
    };

    render(<TestComponent />);
    expect(
      screen.getByText(/must be 8-128 characters/i)
    ).toBeInTheDocument();
  });

  it('should use custom helper text', () => {
    const TestComponent = () => {
      const {
        register,
        formState: { errors },
      } = useForm<TestFormData>();

      return (
        <PasswordField
          register={register}
          passwordField="password"
          errors={errors}
          helperText="Custom helper text"
        />
      );
    };

    render(<TestComponent />);
    expect(screen.getByText('Custom helper text')).toBeInTheDocument();
  });

  it('should be disabled when disabled prop is true', () => {
    const TestComponent = () => {
      const {
        register,
        formState: { errors },
      } = useForm<TestFormData>();

      return (
        <PasswordField
          register={register}
          passwordField="password"
          errors={errors}
          disabled
        />
      );
    };

    render(<TestComponent />);
    const input = screen.getByLabelText(/^Password/i) as HTMLInputElement;
    expect(input).toBeDisabled();
  });

  it('should use custom autoComplete', () => {
    const TestComponent = () => {
      const {
        register,
        formState: { errors },
      } = useForm<TestFormData>();

      return (
        <PasswordField
          register={register}
          passwordField="password"
          errors={errors}
          autoComplete="current-password"
        />
      );
    };

    render(<TestComponent />);
    const input = screen.getByLabelText(/^Password/i) as HTMLInputElement;
    expect(input).toHaveAttribute('autocomplete', 'current-password');
  });
});
