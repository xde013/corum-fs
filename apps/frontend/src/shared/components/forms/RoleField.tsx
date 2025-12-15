import { UseFormRegister, FieldErrors, FieldValues, Path } from 'react-hook-form';
import { Select } from './Select';

interface RoleFieldProps<T extends FieldValues> {
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  roleField: Path<T>;
  disabled?: boolean;
}

export const RoleField = <T extends FieldValues>({
  register,
  errors,
  roleField,
  disabled = false,
}: RoleFieldProps<T>) => {
  return (
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
  );
};
