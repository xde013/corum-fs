import { render, screen } from '@/shared/utils/testUtils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { DeleteUserModal } from './DeleteUserModal';

describe('DeleteUserModal', () => {
  const mockOnClose = vi.fn();
  const mockOnConfirm = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when isOpen is false', () => {
    render(
      <DeleteUserModal
        isOpen={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        userName="John Doe"
      />
    );

    expect(screen.queryByText('Delete User')).not.toBeInTheDocument();
  });

  it('should render when isOpen is true', () => {
    render(
      <DeleteUserModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        userName="John Doe"
      />
    );

    expect(
      screen.getByRole('heading', { name: 'Delete User' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });

  it('should display user name in message', () => {
    render(
      <DeleteUserModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        userName="Jane Smith"
      />
    );

    expect(screen.getByText(/Jane Smith/)).toBeInTheDocument();
    expect(
      screen.getByText(/Are you sure you want to delete/)
    ).toBeInTheDocument();
  });

  it('should call onClose when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <DeleteUserModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        userName="John Doe"
      />
    );

    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it('should call onConfirm when delete button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <DeleteUserModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        userName="John Doe"
      />
    );

    const deleteButton = screen.getByRole('button', { name: 'Delete' });
    await user.click(deleteButton);

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  it('should disable buttons when isLoading is true', () => {
    render(
      <DeleteUserModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        userName="John Doe"
        isLoading={true}
      />
    );

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    // When isLoading is true, Button shows "Loading..." instead of children
    const deleteButton = screen.getByRole('button', { name: 'Loading...' });

    expect(cancelButton).toBeDisabled();
    expect(deleteButton).toBeDisabled();
  });
});
