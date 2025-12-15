import { Control, UseFormRegister, FieldErrors, FieldValues, Path } from 'react-hook-form';
import { BirthdateField } from './BirthdateField';
import { RoleField } from './RoleField';

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
      <BirthdateField
        control={control}
        errors={errors}
        birthdateField={birthdateField}
        disabled={disabled}
      />

      <RoleField
        register={register}
        errors={errors}
        roleField={roleField}
        disabled={disabled}
      />
    </div>
  );
};
