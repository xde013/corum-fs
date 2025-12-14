import { Control, Controller, UseFormRegister, FieldErrors, FieldValues, Path } from 'react-hook-form';
import { DatePicker } from './DatePicker';
import { Select } from './Select';

interface BirthdateRoleFieldsProps<T extends FieldValues> {
  control: Control<T>;
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  birthdateField: Path<T>;
  roleField: Path<T>;
  disabled?: boolean;
}

export const BirthdateRoleFields = <T extends FieldValues>({
  control,
  register,
  errors,
  birthdateField,
  roleField,
  disabled = false,
}: BirthdateRoleFieldsProps<T>) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      <Select
        label="Role"
        error={errors[roleField]?.message as string | undefined}
        disabled={disabled}
        required
        {...register(roleField)}
      >
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </Select>
    </div>
  );
};
