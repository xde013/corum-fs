import { UseFormRegister, FieldErrors, FieldValues, Path } from 'react-hook-form';
import { PasswordInput } from './PasswordInput';

interface PasswordFieldProps<T extends FieldValues> {
  register: UseFormRegister<T>;
  passwordField: Path<T>;
  errors: FieldErrors<T>;
  label?: string;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
}

export const PasswordField = <T extends FieldValues>({
  register,
  passwordField,
  errors,
  label = 'Password',
  placeholder = 'Enter password',
  helperText = 'Must be 8-128 characters with uppercase, lowercase, number, and special character (@$!%*?&)',
  required = true,
  disabled = false,
  autoComplete = 'new-password',
}: PasswordFieldProps<T>) => {
  return (
    <PasswordInput
      label={label}
      placeholder={placeholder}
      error={errors[passwordField]?.message as string | undefined}
      helperText={helperText}
      required={required}
      disabled={disabled}
      autoComplete={autoComplete}
      {...register(passwordField)}
    />
  );
};
