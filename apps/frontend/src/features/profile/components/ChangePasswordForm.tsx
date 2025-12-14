import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PasswordInput } from '@/shared/components/forms/PasswordInput';
import { Button } from '@/shared/components/ui/Button';
import { changePasswordSchema, type ChangePasswordFormData } from '@/shared/utils/validation';

interface ChangePasswordFormProps {
  onSubmit: (data: ChangePasswordFormData) => Promise<void>;
  isLoading?: boolean;
}

export const ChangePasswordForm = ({
  onSubmit,
  isLoading = false,
}: ChangePasswordFormProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const handleFormSubmit = async (data: ChangePasswordFormData) => {
    await onSubmit(data);
    reset();
    setIsExpanded(false);
  };

  if (!isExpanded) {
    return (
      <Button
        type="button"
        variant="secondary"
        onClick={() => setIsExpanded(true)}
      >
        Change Password
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <PasswordInput
        label="Current Password"
        error={errors.currentPassword?.message}
        required
        {...register('currentPassword')}
      />

      <PasswordInput
        label="New Password"
        error={errors.newPassword?.message}
        helperText="Must be 8-128 characters with uppercase, lowercase, number, and special character"
        required
        {...register('newPassword')}
      />

      <PasswordInput
        label="Confirm New Password"
        error={errors.confirmPassword?.message}
        required
        {...register('confirmPassword')}
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            setIsExpanded(false);
            reset();
          }}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          disabled={!isDirty || isLoading}
        >
          Change Password
        </Button>
      </div>
    </form>
  );
};
