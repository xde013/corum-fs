import { render, screen } from '@/shared/utils/testUtils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { UsersListSection } from './UsersListSection';
import type { UseUsersListReturn } from '@/features/users/hooks/useUsersList';
import type { User } from '@/shared/types';

// Mocks
const mockBulkDeleteUsers = vi.fn();
const mockDeleteUser = vi.fn();
const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();

vi.mock('@/features/users/services/userService', () => ({
  userService: {
    bulkDeleteUsers: (...args: any[]) => mockBulkDeleteUsers(...args),
    deleteUser: (...args: any[]) => mockDeleteUser(...args),
  },
}));

vi.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: (...args: any[]) => mockToastSuccess(...args),
    error: (...args: any[]) => mockToastError(...args),
  },
}));

let latestUsersTableProps: any;

vi.mock('./UsersTable', () => ({
  UsersTable: (props: any) => {
    latestUsersTableProps = props;
    return (
      <div data-testid="users-table">
        <button
          type="button"
          onClick={() => props.onToggleUserSelection?.('1')}
        >
          Toggle Select User 1
        </button>
        <button
          type="button"
          onClick={() =>
            props.onDelete?.({
              id: '1',
              firstName: 'John',
              lastName: 'Doe',
            } as User)
          }
        >
          Trigger Single Delete
        </button>
      </div>
    );
  },
}));

let latestDeleteUserModalProps: any;

vi.mock('./DeleteUserModal', () => ({
  DeleteUserModal: (props: any) => {
    latestDeleteUserModalProps = props;
    if (!props.isOpen) return null;
    return (
      <div data-testid="delete-user-modal">
        <span data-testid="delete-user-name">{props.userName}</span>
        <button type="button" onClick={props.onConfirm}>
          Confirm Delete
        </button>
        <button type="button" onClick={props.onClose}>
          Close
        </button>
      </div>
    );
  },
}));

const createMockUsersList = (overrides: Partial<UseUsersListReturn> = {}): UseUsersListReturn => {
  const users: User[] = [
    {
      id: '1',
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'user',
      birthdate: '1990-01-01',
      createdAt: '2020-01-01T00:00:00Z',
      updatedAt: '2020-01-01T00:00:00Z',
    },
  ];

  const base: any = {
    users,
    isLoading: false,
    filters: {},
    sortBy: 'createdAt',
    sortOrder: 'DESC',
    hasMore: false,
    count: users.length,
    handleFilterChange: vi.fn(),
    handleSortChange: vi.fn(),
    handleLoadMore: vi.fn(),
    refresh: vi.fn(),
    fetchUsers: vi.fn(),
  };

  return {
    ...base,
    ...overrides,
  } as UseUsersListReturn;
};

describe('UsersListSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should perform bulk delete for selected users', async () => {
    const user = userEvent.setup();
    const usersList = createMockUsersList();
    mockBulkDeleteUsers.mockResolvedValue({
      deleted: 1,
      failed: [],
      message: 'Successfully deleted 1 user(s)',
    });

    render(
      <UsersListSection
        usersList={usersList}
        showCreateButton={false}
      />
    );

    // Initially, bulk delete button should not be visible
    expect(
      screen.queryByRole('button', { name: /Delete selected/i })
    ).not.toBeInTheDocument();

    // Select a user via mocked table control
    const toggleButton = screen.getByText('Toggle Select User 1');
    await user.click(toggleButton);

    // Bulk delete button should appear with correct count
    const bulkDeleteButton = screen.getByRole('button', {
      name: /Delete selected \(1\)/i,
    });
    expect(bulkDeleteButton).toBeInTheDocument();

    // Click bulk delete
    await user.click(bulkDeleteButton);

    // Modal should open with bulk delete user name
    expect(screen.getByTestId('delete-user-modal')).toBeInTheDocument();
    expect(screen.getByTestId('delete-user-name')).toHaveTextContent(
      '1 selected user(s)'
    );

    // Confirm delete
    const confirmButton = screen.getByText('Confirm Delete');
    await user.click(confirmButton);

    expect(mockBulkDeleteUsers).toHaveBeenCalledWith(['1']);
    expect(mockDeleteUser).not.toHaveBeenCalled();
    expect(usersList.refresh).toHaveBeenCalled();

    // After successful bulk delete, selection should be cleared
    expect(
      screen.queryByRole('button', { name: /Delete selected/i })
    ).not.toBeInTheDocument();
  });

  it('should perform single delete when deleting one user from table', async () => {
    const user = userEvent.setup();
    const usersList = createMockUsersList();
    mockDeleteUser.mockResolvedValue(undefined);

    render(
      <UsersListSection
        usersList={usersList}
        showCreateButton={false}
      />
    );

    // Trigger single delete via mocked table control
    const singleDeleteButton = screen.getByText('Trigger Single Delete');
    await user.click(singleDeleteButton);

    // Modal should open with the user's full name
    expect(screen.getByTestId('delete-user-modal')).toBeInTheDocument();
    expect(screen.getByTestId('delete-user-name')).toHaveTextContent('John Doe');

    // Confirm delete
    const confirmButton = screen.getByText('Confirm Delete');
    await user.click(confirmButton);

    expect(mockDeleteUser).toHaveBeenCalledWith('1');
    expect(mockBulkDeleteUsers).not.toHaveBeenCalled();
    expect(usersList.refresh).toHaveBeenCalled();
  });
});

