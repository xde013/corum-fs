import { render, screen } from '@/shared/utils/testUtils';
import { Input } from './Input';
import { describe, it, expect } from 'vitest';

describe('Input', () => {
  it('should render input with label', () => {
    render(<Input label="Test Input" />);
    expect(screen.getByLabelText('Test Input')).toBeInTheDocument();
  });

  it('should render required indicator when required', () => {
    render(<Input label="Required Input" required />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('should display error message', () => {
    render(<Input label="Test Input" error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('should display helper text when no error', () => {
    render(<Input label="Test Input" helperText="Helper text" />);
    expect(screen.getByText('Helper text')).toBeInTheDocument();
  });

  it('should not display helper text when error is present', () => {
    render(
      <Input
        label="Test Input"
        helperText="Helper text"
        error="Error message"
      />
    );
    expect(screen.queryByText('Helper text')).not.toBeInTheDocument();
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });

  it('should apply error styling when error is present', () => {
    const { container } = render(
      <Input label="Test Input" error="Error message" />
    );
    const input = container.querySelector('input');
    expect(input).toHaveClass('border-red-300');
  });

  it('should forward input props', () => {
    render(
      <Input
        label="Test Input"
        type="email"
        placeholder="Enter email"
        disabled
      />
    );
    const input = screen.getByLabelText('Test Input') as HTMLInputElement;
    expect(input.type).toBe('email');
    expect(input.placeholder).toBe('Enter email');
    expect(input).toBeDisabled();
  });
});
