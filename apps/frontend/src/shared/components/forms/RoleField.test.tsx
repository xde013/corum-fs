import { render } from '@/shared/utils/testUtils';
import { screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { describe, it, expect } from 'vitest';
import { RoleField } from './RoleField';

interface TestFormData {
  role: string;
}

describe('RoleField', () => {
  const TestComponent = ({ disabled = false }: { disabled?: boolean }) => {
    const {
      register,
      formState: { errors },
    } = useForm<TestFormData>();

    return (
      <RoleField
        register={register}
        errors={errors}
        roleField="role"
        disabled={disabled}
      />
    );
  };

  it('should render role select with label', () => {
    render(<TestComponent />);

    const select = screen.getByLabelText(/role/i) as HTMLSelectElement;
    expect(select).toBeInTheDocument();
  });

  it('should render User and Admin options', () => {
    render(<TestComponent />);

    expect(screen.getByText('User')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<TestComponent disabled />);

    const select = screen.getByLabelText(/role/i) as HTMLSelectElement;
    expect(select).toBeDisabled();
  });
});
