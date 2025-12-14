import { render } from '@/shared/utils/testUtils';
// @ts-expect-error - screen is exported via export * from testUtils
import { screen } from '@/shared/utils/testUtils';
import { NameFields } from './NameFields';
import { useForm } from 'react-hook-form';
import { describe, it, expect } from 'vitest';

interface TestFormData {
  firstName: string;
  lastName: string;
}

const TestComponent = () => {
  const {
    register,
    formState: { errors },
  } = useForm<TestFormData>();

  return (
    <NameFields
      register={register}
      errors={errors}
      firstNameField="firstName"
      lastNameField="lastName"
    />
  );
};

describe('NameFields', () => {
  it('should render first name and last name fields', () => {
    render(<TestComponent />);

    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
  });

  it('should have correct placeholders', () => {
    render(<TestComponent />);

    const firstNameInput = screen.getByLabelText(/first name/i) as HTMLInputElement;
    const lastNameInput = screen.getByLabelText(/last name/i) as HTMLInputElement;

    expect(firstNameInput.placeholder).toBe('John');
    expect(lastNameInput.placeholder).toBe('Doe');
  });

  it('should use custom placeholders when provided', () => {
    const CustomComponent = () => {
      const {
        register,
        formState: { errors },
      } = useForm<TestFormData>();

      return (
        <NameFields
          register={register}
          errors={errors}
          firstNameField="firstName"
          lastNameField="lastName"
          firstNamePlaceholder="Jane"
          lastNamePlaceholder="Smith"
        />
      );
    };

    render(<CustomComponent />);

    const firstNameInput = screen.getByLabelText(/first name/i) as HTMLInputElement;
    const lastNameInput = screen.getByLabelText(/last name/i) as HTMLInputElement;

    expect(firstNameInput.placeholder).toBe('Jane');
    expect(lastNameInput.placeholder).toBe('Smith');
  });

  it('should disable fields when disabled prop is true', () => {
    const DisabledComponent = () => {
      const {
        register,
        formState: { errors },
      } = useForm<TestFormData>();

      return (
        <NameFields
          register={register}
          errors={errors}
          firstNameField="firstName"
          lastNameField="lastName"
          disabled
        />
      );
    };

    render(<DisabledComponent />);

    const firstNameInput = screen.getByLabelText(/first name/i) as HTMLInputElement;
    const lastNameInput = screen.getByLabelText(/last name/i) as HTMLInputElement;

    expect(firstNameInput).toBeDisabled();
    expect(lastNameInput).toBeDisabled();
  });

  it('should display error messages', () => {
    const ErrorComponent = () => {
      const { register } = useForm<TestFormData>();

      // Create mock errors object for testing
      const mockErrors = {
        firstName: { message: 'First name is required' },
        lastName: { message: 'Last name is required' },
      } as any;

      return (
        <NameFields
          register={register}
          errors={mockErrors}
          firstNameField="firstName"
          lastNameField="lastName"
        />
      );
    };

    render(<ErrorComponent />);

    expect(screen.getByText('First name is required')).toBeInTheDocument();
    expect(screen.getByText('Last name is required')).toBeInTheDocument();
  });
});
