import { render, screen } from '@/shared/utils/testUtils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { UserSortControls } from './UserSortControls';

describe('UserSortControls', () => {
  const mockOnSortChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render sort by and order selects', () => {
    render(
      <UserSortControls
        sortBy="createdAt"
        sortOrder="DESC"
        onSortChange={mockOnSortChange}
      />
    );

    expect(screen.getByLabelText('Sort By')).toBeInTheDocument();
    expect(screen.getByLabelText('Order')).toBeInTheDocument();
  });

  it('should display current sortBy value', () => {
    render(
      <UserSortControls
        sortBy="firstName"
        sortOrder="ASC"
        onSortChange={mockOnSortChange}
      />
    );

    const sortBySelect = screen.getByLabelText('Sort By') as HTMLSelectElement;
    expect(sortBySelect.value).toBe('firstName');
  });

  it('should display current sortOrder value', () => {
    render(
      <UserSortControls
        sortBy="createdAt"
        sortOrder="ASC"
        onSortChange={mockOnSortChange}
      />
    );

    const orderSelect = screen.getByLabelText('Order') as HTMLSelectElement;
    expect(orderSelect.value).toBe('ASC');
  });

  it('should call onSortChange when sortBy changes', async () => {
    const user = userEvent.setup();
    render(
      <UserSortControls
        sortBy="createdAt"
        sortOrder="DESC"
        onSortChange={mockOnSortChange}
      />
    );

    const sortBySelect = screen.getByLabelText('Sort By');
    await user.selectOptions(sortBySelect, 'firstName');

    expect(mockOnSortChange).toHaveBeenCalledWith('firstName', 'DESC');
  });

  it('should call onSortChange when sortOrder changes', async () => {
    const user = userEvent.setup();
    render(
      <UserSortControls
        sortBy="createdAt"
        sortOrder="DESC"
        onSortChange={mockOnSortChange}
      />
    );

    const orderSelect = screen.getByLabelText('Order');
    await user.selectOptions(orderSelect, 'ASC');

    expect(mockOnSortChange).toHaveBeenCalledWith('createdAt', 'ASC');
  });

  it('should render all sort field options', () => {
    render(
      <UserSortControls
        sortBy="createdAt"
        sortOrder="DESC"
        onSortChange={mockOnSortChange}
      />
    );

    const sortBySelect = screen.getByLabelText('Sort By');
    expect(sortBySelect.querySelector('option[value="createdAt"]')).toBeInTheDocument();
    expect(sortBySelect.querySelector('option[value="updatedAt"]')).toBeInTheDocument();
    expect(sortBySelect.querySelector('option[value="firstName"]')).toBeInTheDocument();
    expect(sortBySelect.querySelector('option[value="lastName"]')).toBeInTheDocument();
    expect(sortBySelect.querySelector('option[value="email"]')).toBeInTheDocument();
    expect(sortBySelect.querySelector('option[value="birthdate"]')).toBeInTheDocument();
  });
});
