import { render, screen } from '@/shared/utils/testUtils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DashboardPage } from './DashboardPage';

// Mock useAuth
const mockUser = {
  id: '1',
  email: 'admin@example.com',
  firstName: 'Admin',
  lastName: 'User',
  role: 'admin' as const,
  birthdate: '1990-01-01',
  createdAt: '2020-01-01T00:00:00Z',
  updatedAt: '2020-01-01T00:00:00Z',
};

const mockUseAuth = vi.fn(() => ({
  user: mockUser,
  isAuthenticated: true,
  login: vi.fn(),
  logout: vi.fn(),
}));

vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock useUsersList
const mockUsersList = {
  users: [],
  isLoading: false,
  error: null,
  hasMore: false,
  count: 0,
  fetchUsers: vi.fn(),
  loadMore: vi.fn(),
  refresh: vi.fn(),
  setFilters: vi.fn(),
  setSort: vi.fn(),
};

vi.mock('@/features/users/hooks/useUsersList', () => ({
  useUsersList: vi.fn(() => mockUsersList),
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock PageLayout
vi.mock('@/shared/components/layout/PageLayout', () => ({
  PageLayout: ({ children, maxWidth }: any) => (
    <div data-testid="page-layout" data-max-width={maxWidth}>
      {children}
    </div>
  ),
}));

// Mock UsersListSection
vi.mock('@/features/users/components/UsersListSection', () => ({
  UsersListSection: ({ usersList, onRowClick, onEdit }: any) => (
    <div data-testid="users-list-section">
      <div data-testid="users-list-data">{JSON.stringify(usersList)}</div>
      <button onClick={() => onRowClick({ id: '1', email: 'test@example.com' })}>
        Test Row Click
      </button>
      <button onClick={() => onEdit({ id: '1', email: 'test@example.com' })}>
        Test Edit
      </button>
    </div>
  ),
}));

// Mock NonAdminMessage
vi.mock('@/features/dashboard/components/NonAdminMessage', () => ({
  NonAdminMessage: () => <div data-testid="non-admin-message">Non Admin Message</div>,
}));

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    });
  });

  it('should render PageLayout', () => {
    render(<DashboardPage />);

    expect(screen.getByTestId('page-layout')).toBeInTheDocument();
    expect(screen.getByTestId('page-layout')).toHaveAttribute('data-max-width', '7xl');
  });

  it('should render UsersListSection for admin users', () => {
    render(<DashboardPage />);

    expect(screen.getByTestId('users-list-section')).toBeInTheDocument();
    expect(screen.queryByTestId('non-admin-message')).not.toBeInTheDocument();
  });

  it('should render NonAdminMessage for non-admin users', () => {
    // Mock non-admin user
    mockUseAuth.mockReturnValueOnce({
      user: { ...mockUser, role: 'user' as const },
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(<DashboardPage />);

    expect(screen.getByTestId('non-admin-message')).toBeInTheDocument();
    expect(screen.queryByTestId('users-list-section')).not.toBeInTheDocument();
  });

  it('should call useUsersList with autoFetch true for admin users', async () => {
    render(<DashboardPage />);

    const { useUsersList } = await import('@/features/users/hooks/useUsersList');
    expect(vi.mocked(useUsersList)).toHaveBeenCalledWith({
      autoFetch: true,
    });
  });

  it('should call useUsersList with autoFetch false for non-admin users', async () => {
    // Mock non-admin user
    mockUseAuth.mockReturnValueOnce({
      user: { ...mockUser, role: 'user' as const },
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(<DashboardPage />);

    const { useUsersList } = await import('@/features/users/hooks/useUsersList');
    expect(vi.mocked(useUsersList)).toHaveBeenCalledWith({
      autoFetch: false,
    });
  });

  it('should navigate to edit page when row is clicked', async () => {
    const user = (await import('@testing-library/user-event')).default;
    const userEvent = user.setup();
    render(<DashboardPage />);

    const rowClickButton = screen.getByText('Test Row Click');
    await userEvent.click(rowClickButton);

    expect(mockNavigate).toHaveBeenCalledWith('/users/1/edit');
  });

  it('should navigate to edit page when edit is clicked', async () => {
    const user = (await import('@testing-library/user-event')).default;
    const userEvent = user.setup();
    render(<DashboardPage />);

    const editButton = screen.getByText('Test Edit');
    await userEvent.click(editButton);

    expect(mockNavigate).toHaveBeenCalledWith('/users/1/edit');
  });
});
