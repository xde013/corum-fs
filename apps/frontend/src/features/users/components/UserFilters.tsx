import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/shared/components/forms/Input';
import { Button } from '@/shared/components/ui/Button';
import { FiSearch, FiX } from 'react-icons/fi';
import type { UserListQuery } from '@/shared/types';

const filterSchema = z.object({
  search: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().optional(),
});

type FilterFormData = z.infer<typeof filterSchema>;

interface UserFiltersProps {
  onFilterChange: (filters: Partial<UserListQuery>) => void;
  initialFilters?: Partial<UserListQuery>;
}

export const UserFilters = ({
  onFilterChange,
  initialFilters = {},
}: UserFiltersProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FilterFormData>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      search: initialFilters.search || '',
      firstName: initialFilters.firstName || '',
      lastName: initialFilters.lastName || '',
      email: initialFilters.email || '',
    },
  });

  // Register inputs with trim transformation
  const searchRegister = register('search', {
    setValueAs: (value: string) => value?.trim(),
  });
  const firstNameRegister = register('firstName', {
    setValueAs: (value: string) => value?.trim(),
  });
  const lastNameRegister = register('lastName', {
    setValueAs: (value: string) => value?.trim(),
  });
  const emailRegister = register('email', {
    setValueAs: (value: string) => value?.trim(),
  });

  const onSubmit = (data: FilterFormData) => {
    const filters: Partial<UserListQuery> = {};
    
    // Trim all input values
    const trimmedSearch = data.search?.trim();
    const trimmedFirstName = data.firstName?.trim();
    const trimmedLastName = data.lastName?.trim();
    const trimmedEmail = data.email?.trim();
    
    if (trimmedSearch) {
      filters.search = trimmedSearch;
    } else {
      if (trimmedFirstName) filters.firstName = trimmedFirstName;
      if (trimmedLastName) filters.lastName = trimmedLastName;
      if (trimmedEmail) filters.email = trimmedEmail;
    }

    onFilterChange(filters);
  };

  const handleClear = () => {
    reset({
      search: '',
      firstName: '',
      lastName: '',
      email: '',
    });
    onFilterChange({});
  };

  const hasActiveFilters = 
    initialFilters.search ||
    initialFilters.firstName ||
    initialFilters.lastName ||
    initialFilters.email;

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex gap-3">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search by name or email..."
                className="pl-10"
                {...searchRegister}
              />
            </div>
          </div>
          <Button type="submit" variant="secondary">
           <FiSearch className="h-4 w-4 mr-1" />
          </Button>
          {hasActiveFilters && (
            <Button type="button" variant="secondary" onClick={handleClear}>
              <FiX className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
        >
          {showAdvanced ? 'Hide' : 'Show'} Advanced Filters
        </button>

        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <Input
              label="First Name"
              placeholder="Filter by first name"
              error={errors.firstName?.message}
              {...firstNameRegister}
            />
            <Input
              label="Last Name"
              placeholder="Filter by last name"
              error={errors.lastName?.message}
              {...lastNameRegister}
            />
            <Input
              label="Email"
              type="email"
              placeholder="Filter by email"
              error={errors.email?.message}
              {...emailRegister}
            />
          </div>
        )}
      </form>
    </div>
  );
};
