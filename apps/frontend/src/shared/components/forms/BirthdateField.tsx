import { Control, Controller, FieldErrors, FieldValues, Path } from 'react-hook-form';
import { DatePicker } from './DatePicker';

interface BirthdateFieldProps<T extends FieldValues> {
  control: Control<T>;
  errors: FieldErrors<T>;
  birthdateField: Path<T>;
  disabled?: boolean;
}

export const BirthdateField = <T extends FieldValues>({
  control,
  errors,
  birthdateField,
  disabled = false,
}: BirthdateFieldProps<T>) => {
  return (
    <Controller
      name={birthdateField}
      control={control}
      render={({ field }) => (
        <DatePicker
          label="Birthdate"
          value={field.value}
          onChange={field.onChange}
          error={errors[birthdateField]?.message as string | undefined}
          disabled={disabled}
          required
        />
      )}
    />
  );
};
