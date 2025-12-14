import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '../forms/Input';
import { DatePicker } from '../forms/DatePicker';
import { Button } from '../ui/Button';
import { profileSchema, type ProfileFormData } from '../../utils/validation';
import type { User } from '../../types';
import { format } from 'date-fns';

interface ProfileFormProps {
  user: User;
  onSubmit: (data: ProfileFormData) => Promise<void>;
  isLoading?: boolean;
}

export const ProfileForm = ({ user, onSubmit, isLoading = false }: ProfileFormProps) => {
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="First Name"
          error={errors.firstName?.message}
          {...register('firstName', {
            setValueAs: (value: string) => value?.trim(),
          })}
        />
        <Input
          label="Last Name"
          error={errors.lastName?.message}
          {...register('lastName', {
            setValueAs: (value: string) => value?.trim(),
          })}
        />
      </div>

      <Input
        label="Email"
        type="email"
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
          />
        )}
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          disabled={!isDirty || isLoading}
        >
          Save Changes
        </Button>
      </div>
    </form>
  );
};
