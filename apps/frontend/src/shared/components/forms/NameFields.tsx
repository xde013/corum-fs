import { UseFormRegister, FieldErrors, FieldValues, Path } from 'react-hook-form';
import { Input } from './Input';

interface NameFieldsProps<T extends FieldValues> {
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  firstNameField: Path<T>;
  lastNameField: Path<T>;
  disabled?: boolean;
  firstNamePlaceholder?: string;
  lastNamePlaceholder?: string;
}

export const NameFields = <T extends FieldValues>({
  register,
  errors,
  firstNameField,
  lastNameField,
  disabled = false,
  firstNamePlaceholder = 'John',
  lastNamePlaceholder = 'Doe',
}: NameFieldsProps<T>) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Input
        label="First Name"
        placeholder={firstNamePlaceholder}
        error={errors[firstNameField]?.message as string | undefined}
        disabled={disabled}
        required
        {...register(firstNameField, {
          setValueAs: (value: string) => value?.trim(),
        })}
      />
      <Input
        label="Last Name"
        placeholder={lastNamePlaceholder}
        error={errors[lastNameField]?.message as string | undefined}
        disabled={disabled}
        required
        {...register(lastNameField, {
          setValueAs: (value: string) => value?.trim(),
        })}
      />
    </div>
  );
};
