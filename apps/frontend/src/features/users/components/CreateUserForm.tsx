import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/components/ui/Button';
import { createUserSchema, type CreateUserFormData } from '@/shared/utils/validation';
import { useNavigate } from 'react-router-dom';
import { NameFields } from '@/shared/components/forms/NameFields';
import { EmailField } from '@/shared/components/forms/EmailField';
import { PasswordField } from '@/shared/components/forms/PasswordField';
import { BirthdateField } from '@/shared/components/forms/BirthdateField';
import { RoleField } from '@/shared/components/forms/RoleField';

interface CreateUserFormProps {
  onSubmit: (data: CreateUserFormData) => Promise<void>;
  isLoading?: boolean;
}

export const CreateUserForm = ({ onSubmit, isLoading = false }: CreateUserFormProps) => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      role: 'user',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <NameFields
        register={register}
        errors={errors}
        firstNameField="firstName"
        lastNameField="lastName"
      />

      <EmailField
        register={register}
        emailField="email"
        errors={errors}
      />

      <PasswordField
        register={register}
        passwordField="password"
        errors={errors}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BirthdateField
          control={control}
          errors={errors}
          birthdateField="birthdate"
        />

        <RoleField
          register={register}
          errors={errors}
          roleField="role"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={() => navigate('/dashboard')}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          disabled={isLoading}
        >
          Create User
        </Button>
      </div>
    </form>
  );
};
