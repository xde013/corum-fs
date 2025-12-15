import { render, screen } from '@/shared/utils/testUtils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateUserPage } from './CreateUserPage';

// Mock userService
vi.mock('@/shared/services/api/userService', () => ({
  userService: {
    createUser: vi.fn(),
  },
}));

// Mock useFormSubmission
const mockSubmit = vi.fn();
const mockUseFormSubmission = vi.fn(() => ({
  submit: mockSubmit,
  isLoading: false,
}));
vi.mock('@/shared/hooks/useFormSubmission', () => ({
  useFormSubmission: (operation: any, options: any) => mockUseFormSubmission(operation, options),
}));

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

// Mock CreateUserForm
vi.mock('@/features/users/components/CreateUserForm', () => ({
  CreateUserForm: ({ onSubmit, isLoading }: any) => (
    <div data-testid="create-user-form">
      <div data-testid="form-loading">{isLoading ? 'loading' : 'not-loading'}</div>
      <button onClick={() => onSubmit({ firstName: 'John', lastName: 'Doe', email: 'john@example.com', password: 'Pass123!', birthdate: '1990-01-01', role: 'user' })}>
        Submit Form
      </button>
    </div>
  ),
}));

describe('CreateUserPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseFormSubmission.mockReturnValue({
      submit: mockSubmit,
      isLoading: false,
    });
  });

  it('should render PageLayout with correct props', () => {
    render(<CreateUserPage />);

    expect(screen.getByTestId('page-layout')).toBeInTheDocument();
    expect(screen.getByTestId('page-title')).toHaveTextContent('Create New User');
    expect(screen.getByTestId('page-subtitle')).toHaveTextContent('Add a new user to the system');
    expect(screen.getByTestId('back-button')).toBeInTheDocument();
  });

  it('should render CreateUserForm', () => {
    render(<CreateUserPage />);

    expect(screen.getByTestId('create-user-form')).toBeInTheDocument();
  });

  it('should configure useFormSubmission with correct options', () => {
    render(<CreateUserPage />);

    expect(mockUseFormSubmission).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        successMessage: 'User created successfully',
        errorMessage: 'Failed to create user. Please try again.',
        redirectTo: '/dashboard',
      })
    );
  });

  it('should pass isLoading to CreateUserForm', () => {
    mockUseFormSubmission.mockReturnValue({
      submit: mockSubmit,
      isLoading: true,
    });

    render(<CreateUserPage />);

    expect(screen.getByTestId('form-loading')).toHaveTextContent('loading');
  });

  it('should call createUser with correct data when form is submitted', async () => {
    const user = (await import('@testing-library/user-event')).default;
    const userEvent = user.setup();
    const { userService } = await import('@/shared/services/api/userService');
    
    render(<CreateUserPage />);

    const submitButton = screen.getByText('Submit Form');
    await userEvent.click(submitButton);

    // Verify the operation function calls createUser
    const operationCall = mockUseFormSubmission.mock.calls[0][0];
    await operationCall({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'Pass123!',
      birthdate: '1990-01-01',
      role: 'user',
    });

    expect(userService.createUser).toHaveBeenCalledWith({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'Pass123!',
      birthdate: '1990-01-01',
      role: 'user',
    });
  });
});
