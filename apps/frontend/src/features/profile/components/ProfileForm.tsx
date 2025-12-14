import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DatePicker } from '@/shared/components/forms/DatePicker';
import { Button } from '@/shared/components/ui/Button';
import { profileSchema, type ProfileFormData } from '@/shared/utils/validation';
import type { User } from '@/shared/types';
import { format } from 'date-fns/format';
import { NameFields } from '@/shared/components/forms/NameFields';
import { EmailField } from '@/shared/components/forms/EmailField';

interface ProfileFormProps {
  user: User;
  onSubmit: (data: ProfileFormData) => Promise<void>;
  isLoading?: boolean;
  onCancel?: () => void;
  isReadOnly?: boolean;
}

export const ProfileForm = ({ user, onSubmit, isLoading = false, onCancel, isReadOnly = false }: ProfileFormProps) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      birthdate: user.birthdate ? format(new Date(user.birthdate), 'yyyy-MM-dd') : '',
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

      <Controller
        name="birthdate"
        control={control}
        render={({ field }) => (
          <DatePicker
            label="Birthdate"
            value={field.value}
            onChange={field.onChange}
            error={errors.birthdate?.message}
            disabled={isReadOnly}
            required
          />
        )}
      />

      {!isReadOnly && (
        <div className="flex justify-end gap-3 pt-4">
          {onCancel && (
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            disabled={!isDirty || isLoading}
          >
            Save Changes
          </Button>
        </div>
      )}
    </form>
  );
};
