import { render, screen } from '@/shared/utils/testUtils';
import { EmailField } from './EmailField';
import { useForm } from 'react-hook-form';
import { describe, it, expect } from 'vitest';

interface TestFormData {
  email: string;
}

describe('EmailField', () => {
  it('should render editable email field when register and emailField are provided', () => {
    const EditableComponent = () => {
      const {
        register,
        formState: { errors },
      } = useForm<TestFormData>();

      return (
        <EmailField
          register={register}
          emailField="email"
          errors={errors}
        />
      );
    };

    render(<EditableComponent />);

    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    expect(emailInput).toBeInTheDocument();
    expect(emailInput.type).toBe('email');
    expect(emailInput).not.toBeDisabled();
  });

  it('should render read-only email field when value and disabled are provided', () => {
    render(
      <EmailField
        value="test@example.com"
        disabled
        helperText="Email cannot be changed"
      />
    );

    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    expect(emailInput).toBeInTheDocument();
    expect(emailInput.value).toBe('test@example.com');
    expect(emailInput).toBeDisabled();
    expect(screen.getByText('Email cannot be changed')).toBeInTheDocument();
  });

  it('should use custom placeholder', () => {
    const CustomComponent = () => {
      const {
        register,
        formState: { errors },
      } = useForm<TestFormData>();

      return (
        <EmailField
          register={register}
          emailField="email"
          errors={errors}
          placeholder="custom@example.com"
        />
      );
    };

    render(<CustomComponent />);

    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    expect(emailInput.placeholder).toBe('custom@example.com');
  });

  it('should display helper text', () => {
    render(
      <EmailField
        value="test@example.com"
        disabled
        helperText="This is helper text"
      />
    );

    expect(screen.getByText('This is helper text')).toBeInTheDocument();
  });

  it('should not render when neither register/emailField nor value are provided', () => {
    const { container } = render(<EmailField />);
    expect(container.firstChild).toBeNull();
  });
});
