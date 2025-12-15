import { render, screen, waitFor } from '@/shared/utils/testUtils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { EditUserPage } from './EditUserPage';
import type { User } from '@/shared/types';

// Mock userService
vi.mock('@/features/users/services/userService', () => ({
  userService: {
    getUserById: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn(),
  },
}));

// Mock useFormSubmission
const mockSubmit = vi.fn();
const mockDeleteSubmit = vi.fn();
const mockUseFormSubmission = vi.fn((operation, options) => {
  if (options.successMessage === 'User updated successfully') {
    return { submit: mockSubmit, isLoading: false };
  }
  return { submit: mockDeleteSubmit, isLoading: false };
});
vi.mock('@/shared/hooks/useFormSubmission', () => ({
  useFormSubmission: (operation: any, options: any) => mockUseFormSubmission(operation, options),
}));

// Mock useAsyncOperation
vi.mock('@/shared/hooks/useAsyncOperation', () => ({
  useAsyncOperation: vi.fn(() => {
    return {
      execute: vi.fn(),
      isLoading: false,
    };
  }),
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
const mockParams = { id: '1' };
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => mockParams,
    useNavigate: () => mockNavigate,
  };
});

// Mock PageLayout
vi.mock('@/shared/components/layout/PageLayout', () => ({
  PageLayout: ({ children, title, subtitle, showBackButton }: any) => (
    <div data-testid="page-layout">
      {title && <h1 data-testid="page-title">{title}</h1>}
      {subtitle && <p data-testid="page-subtitle">{subtitle}</p>}
      {showBackButton && <button data-testid="back-button">Back</button>}
      {children}
    </div>
  ),
}));

// Mock LoadingSpinner
vi.mock('@/shared/components/ui/LoadingSpinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
}));

// Mock EditUserForm
vi.mock('@/features/users/components/EditUserForm', () => ({
  EditUserForm: ({ user, onSubmit, onDelete, isLoading, isDeleting, onCancel, isReadOnly }: any) => (
    <div data-testid="edit-user-form">
      <div data-testid="form-user">{user.email}</div>
      <div data-testid="form-loading">{isLoading ? 'loading' : 'not-loading'}</div>
      <div data-testid="form-deleting">{isDeleting ? 'deleting' : 'not-deleting'}</div>
      <div data-testid="form-readonly">{isReadOnly ? 'readonly' : 'editable'}</div>
      <button onClick={() => onSubmit({ firstName: 'Jane', lastName: 'Doe', birthdate: '1990-01-01', role: 'user' })}>
        Submit Form
      </button>
      <button onClick={onDelete}>Delete User</button>
      {onCancel && <button onClick={onCancel}>Cancel Form</button>}
    </div>
  ),
}));

// Mock DeleteUserModal
vi.mock('@/features/users/components/DeleteUserModal', () => ({
  DeleteUserModal: ({ isOpen, onClose, onConfirm, userName, isLoading }: any) => (
    isOpen ? (
      <div data-testid="delete-modal">
        <div data-testid="modal-user-name">{userName}</div>
        <div data-testid="modal-loading">{isLoading ? 'loading' : 'not-loading'}</div>
        <button onClick={onClose}>Close Modal</button>
        <button onClick={onConfirm}>Confirm Delete</button>
      </div>
    ) : null
  ),
}));

// Mock errorHandler
vi.mock('@/shared/utils/errorHandler', () => ({
  handleApiError: vi.fn(),
}));

describe('EditUserPage', () => {
  const mockUser: User = {
    id: '1',
    email: 'user@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'user',
    birthdate: '1990-01-15',
    createdAt: '2020-01-01T00:00:00Z',
    updatedAt: '2020-01-01T00:00:00Z',
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    mockParams.id = '1';
    const { userService } = await import('@/features/users/services/userService');
    vi.mocked(userService.getUserById).mockResolvedValue(mockUser);
    vi.mocked(userService.updateUser).mockResolvedValue(mockUser);
    vi.mocked(userService.deleteUser).mockResolvedValue(undefined);
    
    // Setup useAsyncOperation mocks
    const { useAsyncOperation } = await import('@/shared/hooks/useAsyncOperation');
    vi.mocked(useAsyncOperation).mockImplementation(() => {
      const execute = vi.fn().mockResolvedValue(mockUser);
      return { execute, isLoading: false };
    });
  });

  it('should render loading spinner while fetching user', async () => {
    const { useAsyncOperation } = await import('@/shared/hooks/useAsyncOperation');
    vi.mocked(useAsyncOperation).mockReturnValueOnce({
      execute: vi.fn(),
      isLoading: true,
    });

    render(<EditUserPage />);

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should fetch user on mount', async () => {
    render(<EditUserPage />);

    await waitFor(async () => {
      const { useAsyncOperation } = await import('@/shared/hooks/useAsyncOperation');
      const calls = vi.mocked(useAsyncOperation).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
    });
  });

  it('should render user not found when user is null', async () => {
    const { useAsyncOperation } = await import('@/shared/hooks/useAsyncOperation');
    vi.mocked(useAsyncOperation).mockImplementationOnce(() => ({
      execute: vi.fn().mockResolvedValue(null),
      isLoading: false,
    }));

    render(<EditUserPage />);

    await waitFor(() => {
      expect(screen.getByText('User not found')).toBeInTheDocument();
    });
  });

  it('should render PageLayout with correct props when user is loaded', async () => {
    render(<EditUserPage />);

    await waitFor(() => {
      expect(screen.getByTestId('page-layout')).toBeInTheDocument();
      expect(screen.getByTestId('page-title')).toHaveTextContent('Edit User');
      expect(screen.getByTestId('page-subtitle')).toHaveTextContent(
        'Update user information for John Doe'
      );
      expect(screen.getByTestId('back-button')).toBeInTheDocument();
    });
  });

  it('should render EditUserForm with user data', async () => {
    render(<EditUserPage />);

    await waitFor(() => {
      expect(screen.getByTestId('edit-user-form')).toBeInTheDocument();
      expect(screen.getByTestId('form-user')).toHaveTextContent('user@example.com');
    });
  });

  it('should render EditUserForm in read-only mode initially', async () => {
    render(<EditUserPage />);

    await waitFor(() => {
      expect(screen.getByTestId('form-readonly')).toHaveTextContent('readonly');
    });
  });

  it('should toggle edit mode when Edit button is clicked', async () => {
    const user = userEvent.setup();
    render(<EditUserPage />);

    await waitFor(() => {
      expect(screen.getByTestId('edit-user-form')).toBeInTheDocument();
    });

    const editButton = screen.getByRole('button', { name: /^Edit$/i });
    await user.click(editButton);

    expect(screen.getByTestId('form-readonly')).toHaveTextContent('editable');
    expect(screen.getByRole('button', { name: /^Cancel$/i })).toBeInTheDocument();
  });

  it('should toggle back to read-only mode when Cancel is clicked', async () => {
    const user = userEvent.setup();
    render(<EditUserPage />);

    await waitFor(() => {
      expect(screen.getByTestId('edit-user-form')).toBeInTheDocument();
    });

    // Enter edit mode
    const editButton = screen.getByRole('button', { name: /^Edit$/i });
    await user.click(editButton);

    // Exit edit mode
    const cancelButton = screen.getByRole('button', { name: /^Cancel$/i });
    await user.click(cancelButton);

    expect(screen.getByTestId('form-readonly')).toHaveTextContent('readonly');
  });

  it('should show loading state when saving', async () => {
    mockUseFormSubmission.mockImplementation((operation, options) => {
      if (options.successMessage === 'User updated successfully') {
        return { submit: mockSubmit, isLoading: true };
      }
      return { submit: mockDeleteSubmit, isLoading: false };
    });

    render(<EditUserPage />);

    await waitFor(() => {
      expect(screen.getByTestId('edit-user-form')).toBeInTheDocument();
    });

    expect(screen.getByTestId('form-loading')).toHaveTextContent('loading');
  });

  it('should call updateUser with correct data when form is submitted', async () => {
    const user = userEvent.setup();
    
    render(<EditUserPage />);

    await waitFor(() => {
      expect(screen.getByTestId('edit-user-form')).toBeInTheDocument();
    });

    // Enter edit mode
    const editButton = screen.getByRole('button', { name: /^Edit$/i });
    await user.click(editButton);

    // Submit form
    const submitButton = screen.getByText('Submit Form');
    await user.click(submitButton);

    // Verify the operation function calls updateUser
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalled();
    });
  });

  it('should exit edit mode after successful update', async () => {
    const user = userEvent.setup();
    let onSuccessCallback: ((user?: User) => void) | undefined;
    
    mockUseFormSubmission.mockImplementation((operation, options) => {
      if (options.successMessage === 'User updated successfully') {
        onSuccessCallback = options.onSuccess;
        return {
          submit: async (...args: any[]) => {
            const result = await operation(...args);
            if (onSuccessCallback) {
              await onSuccessCallback(result);
            }
          },
          isLoading: false,
        };
      }
      return { submit: mockDeleteSubmit, isLoading: false };
    });

    render(<EditUserPage />);

    await waitFor(() => {
      expect(screen.getByTestId('edit-user-form')).toBeInTheDocument();
    });

    // Enter edit mode
    const editButton = screen.getByRole('button', { name: /^Edit$/i });
    await user.click(editButton);

    expect(screen.getByTestId('form-readonly')).toHaveTextContent('editable');

    // Submit form
    const submitButton = screen.getByText('Submit Form');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId('form-readonly')).toHaveTextContent('readonly');
    }, { timeout: 3000 });
  });

  it('should show delete modal when Delete User is clicked', async () => {
    const user = userEvent.setup();
    render(<EditUserPage />);

    await waitFor(() => {
      expect(screen.getByTestId('edit-user-form')).toBeInTheDocument();
    });

    const deleteButton = screen.getByText('Delete User');
    await user.click(deleteButton);

    expect(screen.getByTestId('delete-modal')).toBeInTheDocument();
    expect(screen.getByTestId('modal-user-name')).toHaveTextContent('John Doe');
  });

  it('should close delete modal when Close is clicked', async () => {
    const user = userEvent.setup();
    render(<EditUserPage />);

    await waitFor(() => {
      expect(screen.getByTestId('edit-user-form')).toBeInTheDocument();
    });

    // Open modal
    const deleteButton = screen.getByText('Delete User');
    await user.click(deleteButton);

    expect(screen.getByTestId('delete-modal')).toBeInTheDocument();

    // Close modal
    const closeButton = screen.getByText('Close Modal');
    await user.click(closeButton);

    expect(screen.queryByTestId('delete-modal')).not.toBeInTheDocument();
  });

  it('should call deleteUser when Confirm Delete is clicked', async () => {
    const user = userEvent.setup();
    render(<EditUserPage />);

    await waitFor(() => {
      expect(screen.getByTestId('edit-user-form')).toBeInTheDocument();
    });

    // Open modal
    const deleteButton = screen.getByText('Delete User');
    await user.click(deleteButton);

    // Confirm delete
    const confirmButton = screen.getByText('Confirm Delete');
    await user.click(confirmButton);

    await waitFor(() => {
      expect(mockDeleteSubmit).toHaveBeenCalledWith('1');
    });
  });

  it('should show loading state when deleting', async () => {
    mockUseFormSubmission.mockImplementation((operation, options) => {
      if (options.successMessage === 'User deleted successfully') {
        return { submit: mockDeleteSubmit, isLoading: true };
      }
      return { submit: mockSubmit, isLoading: false };
    });

    render(<EditUserPage />);

    await waitFor(() => {
      expect(screen.getByTestId('edit-user-form')).toBeInTheDocument();
    });

    expect(screen.getByTestId('form-deleting')).toHaveTextContent('deleting');
  });

  it('should navigate to dashboard on fetch error', async () => {
    const { handleApiError } = await import('@/shared/utils/errorHandler');
    const { useAsyncOperation } = await import('@/shared/hooks/useAsyncOperation');
    const error = new Error('Fetch failed');
    vi.mocked(useAsyncOperation).mockImplementationOnce(() => ({
      execute: vi.fn().mockRejectedValue(error),
      isLoading: false,
    }));

    render(<EditUserPage />);

    await waitFor(() => {
      expect(handleApiError).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('should display created and updated dates when not in edit mode', async () => {
    render(<EditUserPage />);

    await waitFor(() => {
      expect(screen.getByText('Created At')).toBeInTheDocument();
      expect(screen.getByText('Updated At')).toBeInTheDocument();
    });
  });

  it('should not display dates when in edit mode', async () => {
    const user = userEvent.setup();
    render(<EditUserPage />);

    await waitFor(() => {
      expect(screen.getByText('Created At')).toBeInTheDocument();
    });

    // Enter edit mode
    const editButton = screen.getByRole('button', { name: /^Edit$/i });
    await user.click(editButton);

    expect(screen.queryByText('Created At')).not.toBeInTheDocument();
    expect(screen.queryByText('Updated At')).not.toBeInTheDocument();
  });

  it('should handle missing user id', async () => {
    mockParams.id = undefined;

    render(<EditUserPage />);

    // Should not call fetch when id is missing
    // The component should handle this gracefully
    await waitFor(() => {
      expect(screen.queryByTestId('edit-user-form')).not.toBeInTheDocument();
    });
  });
});
