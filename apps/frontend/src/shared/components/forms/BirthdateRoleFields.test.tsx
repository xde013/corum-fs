import { render } from '@/shared/utils/testUtils';
import { screen } from '@testing-library/react';
import { BirthdateRoleFields } from './BirthdateRoleFields';
import { useForm } from 'react-hook-form';
import { describe, it, expect } from 'vitest';

interface TestFormData {
  birthdate: string;
  role: string;
}

describe('BirthdateRoleFields', () => {
  it('should render birthdate and role fields', () => {
    const TestComponent = () => {
      const {
        register,
        control,
        formState: { errors },
      } = useForm<TestFormData>();

      return (
        <BirthdateRoleFields
          control={control}
          register={register}
          errors={errors}
          birthdateField="birthdate"
          roleField="role"
        />
      );
    };

    render(<TestComponent />);
    // DatePicker uses a div, not an input, so check for label text directly
    expect(screen.getByText(/birthdate/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
  });

  it('should render role options', () => {
    const TestComponent = () => {
      const {
        register,
        control,
        formState: { errors },
      } = useForm<TestFormData>();

      return (
        <BirthdateRoleFields
          control={control}
          register={register}
          errors={errors}
          birthdateField="birthdate"
          roleField="role"
        />
      );
    };

    render(<TestComponent />);
    expect(screen.getByText('User')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('should disable fields when disabled prop is true', () => {
    const TestComponent = () => {
      const {
        register,
        control,
        formState: { errors },
      } = useForm<TestFormData>();

      return (
        <BirthdateRoleFields
          control={control}
          register={register}
          errors={errors}
          birthdateField="birthdate"
          roleField="role"
          disabled
        />
      );
    };

    render(<TestComponent />);
    const roleSelect = screen.getByLabelText(/role/i) as HTMLSelectElement;
    expect(roleSelect).toBeDisabled();
  });
});
