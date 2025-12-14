import { UseFormRegister, FieldErrors, FieldValues, Path } from 'react-hook-form';
import { Input } from './Input';

interface EmailFieldProps<T extends FieldValues> {
  register?: UseFormRegister<T>;
  emailField?: Path<T>;
  errors?: FieldErrors<T>;
  value?: string;
  disabled?: boolean;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
}

export const EmailField = <T extends FieldValues>({
  register,
  emailField,
  errors,
  value,
  disabled = false,
  placeholder = 'john.doe@example.com',
  helperText,
  required = true,
}: EmailFieldProps<T>) => {
  // If value is provided and disabled, render as read-only field
  if (value !== undefined && disabled) {
    return (
      <Input
        label="Email"
        type="email"
        value={value}
        disabled
        helperText={helperText}
      />
    );
  }

  // Otherwise render as editable field
  if (!register || !emailField) {
    return null;
  }

  return (
    <Input
      label="Email"
      type="email"
      placeholder={placeholder}
      autoComplete="email"
      error={errors?.[emailField]?.message as string | undefined}
      disabled={disabled}
      required={required}
      helperText={helperText}
      {...register(emailField, {
        setValueAs: (value: string) => value?.trim(),
      })}
    />
  );
};
