import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/components/ui/Button';
import { updateUserSchema, type UpdateUserFormData } from '@/shared/utils/validation';
import type { User } from '@/shared/types';
import { format } from 'date-fns/format';
import { NameFields } from '@/shared/components/forms/NameFields';
import { EmailField } from '@/shared/components/forms/EmailField';
import { PasswordField } from '@/shared/components/forms/PasswordField';
import { BirthdateField } from '@/shared/components/forms/BirthdateField';
import { RoleField } from '@/shared/components/forms/RoleField';

interface EditUserFormProps {
  user: User;
  onSubmit: (data: UpdateUserFormData) => Promise<void>;
  onDelete: () => void;
  isLoading?: boolean;
  isDeleting?: boolean;
  onCancel?: () => void;
  isReadOnly?: boolean;
}

export const EditUserForm = ({
  user,
  onSubmit,
  onDelete,
  isLoading = false,
  isDeleting = false,
  onCancel,
  isReadOnly = false,
}: EditUserFormProps) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
  } = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      password: '',
      birthdate: user.birthdate ? format(new Date(user.birthdate), 'yyyy-MM-dd') : '',
      role: user.role,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <NameFields
        register={register}
        errors={errors}
        firstNameField="firstName"
        lastNameField="lastName"
        disabled={isReadOnly}
      />

      <EmailField
        value={user.email}
        disabled
        helperText="Email cannot be changed"
      />

      {!isReadOnly && (
        <PasswordField
          register={register}
          passwordField="password"
          errors={errors}
          label="Password (leave blank to keep current)"
          helperText="Only fill if you want to change the password. Must be 8-128 characters with uppercase, lowercase, number, and special character (@$!%*?&)"
          required={false}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BirthdateField
          control={control}
          errors={errors}
          birthdateField="birthdate"
          disabled={isReadOnly}
        />

        <RoleField
          register={register}
          errors={errors}
          roleField="role"
          disabled={isReadOnly}
        />
      </div>

      {!isReadOnly && (
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="danger"
            onClick={onDelete}
            isLoading={isDeleting}
            disabled={isDeleting || isLoading}
          >
            Delete User
          </Button>
          <div className="flex gap-3">
            {onCancel ? (
              <Button
                type="button"
                variant="secondary"
                onClick={onCancel}
                disabled={isLoading || isDeleting}
              >
                Cancel
              </Button>
            ) : (
              <Button
                type="button"
                variant="secondary"
                onClick={() => window.history.back()}
                disabled={isLoading || isDeleting}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              disabled={!isDirty || isLoading || isDeleting}
            >
              Save Changes
            </Button>
          </div>
        </div>
      )}
    </form>
  );
};
