import { CreateUserForm } from '@/features/users/components/CreateUserForm';
import { userService } from '@/shared/services/api/userService';
import type { CreateUserFormData } from '@/shared/utils/validation';
import { PageLayout } from '@/shared/components/layout/PageLayout';
import { useFormSubmission } from '@/shared/hooks/useFormSubmission';

export const CreateUserPage = () => {
  const createUserOperation = async (data: CreateUserFormData) => {
    await userService.createUser({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      birthdate: data.birthdate,
      role: data.role,
    });
  };

  const { submit: handleSubmit, isLoading } = useFormSubmission(createUserOperation, {
    successMessage: 'User created successfully',
    errorMessage: 'Failed to create user. Please try again.',
    redirectTo: '/dashboard',
  });

  return (
    <PageLayout
      title="Create New User"
      subtitle="Add a new user to the system"
      showBackButton
    >
      <div className="bg-white shadow rounded-lg p-6">
        <CreateUserForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </PageLayout>
  );
};
