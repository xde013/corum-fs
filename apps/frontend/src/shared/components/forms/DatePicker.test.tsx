import { render, screen, waitFor } from '@/shared/utils/testUtils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { DatePicker } from './DatePicker';

// Mock react-day-picker
vi.mock('react-day-picker', () => ({
  DayPicker: ({ onSelect, selected }: any) => (
    <div data-testid="day-picker">
      <button
        data-testid="select-date"
        onClick={() => onSelect?.(new Date('2020-01-15'))}
      >
        Select Date
      </button>
      {selected && <span data-testid="selected-date">Selected</span>}
    </div>
  ),
}));

describe('DatePicker', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with label', () => {
    render(<DatePicker label="Birthdate" onChange={mockOnChange} />);
    expect(screen.getByText('Birthdate')).toBeInTheDocument();
  });

  it('should show required indicator when required', () => {
    render(<DatePicker label="Birthdate" required onChange={mockOnChange} />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('should display placeholder when no date selected', () => {
    render(<DatePicker label="Birthdate" onChange={mockOnChange} />);
    expect(screen.getByText('Select a date')).toBeInTheDocument();
  });

  it('should open picker when clicked', async () => {
    const user = userEvent.setup();
    render(<DatePicker label="Birthdate" onChange={mockOnChange} />);

    const input = screen.getByText('Select a date').closest('div');
    if (input) {
      await user.click(input);
      await waitFor(() => {
        expect(screen.getByTestId('day-picker')).toBeInTheDocument();
      });
    }
  });

  it('should call onChange when date is selected', async () => {
    const user = userEvent.setup();
    render(<DatePicker label="Birthdate" onChange={mockOnChange} />);

    const input = screen.getByText('Select a date').closest('div');
    if (input) {
      await user.click(input);
      await waitFor(() => {
        expect(screen.getByTestId('day-picker')).toBeInTheDocument();
      });

      const selectButton = screen.getByTestId('select-date');
      await user.click(selectButton);

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith('2020-01-15');
      });
    }
  });

  it('should display formatted date when value is provided', () => {
    render(
      <DatePicker
        label="Birthdate"
        value="2020-01-15"
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('Jan 15, 2020')).toBeInTheDocument();
  });

  it('should display error message when error prop is provided', () => {
    render(
      <DatePicker
        label="Birthdate"
        error="Invalid date"
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('Invalid date')).toBeInTheDocument();
  });

  it('should display helper text when provided', () => {
    render(
      <DatePicker
        label="Birthdate"
        helperText="Select your birthdate"
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('Select your birthdate')).toBeInTheDocument();
  });

  it('should not display helper text when error is present', () => {
    render(
      <DatePicker
        label="Birthdate"
        error="Invalid date"
        helperText="Select your birthdate"
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('Invalid date')).toBeInTheDocument();
    expect(screen.queryByText('Select your birthdate')).not.toBeInTheDocument();
  });

  it('should be disabled when disabled prop is true', () => {
    const { container } = render(
      <DatePicker label="Birthdate" disabled onChange={mockOnChange} />
    );

    // The disabled class is applied to the clickable div
    const disabledElement = container.querySelector('.cursor-not-allowed');
    expect(disabledElement).toBeInTheDocument();
  });

  it('should not open picker when disabled', async () => {
    const user = userEvent.setup();
    render(
      <DatePicker label="Birthdate" disabled onChange={mockOnChange} />
    );

    const input = screen.getByText('Select a date').closest('div');
    if (input) {
      await user.click(input);
      await waitFor(() => {
        expect(screen.queryByTestId('day-picker')).not.toBeInTheDocument();
      });
    }
  });

  it('should work as controlled component', async () => {
    userEvent.setup();
    const { rerender } = render(
      <DatePicker label="Birthdate" value="2020-01-15" onChange={mockOnChange} />
    );

    expect(screen.getByText('Jan 15, 2020')).toBeInTheDocument();

    rerender(
      <DatePicker label="Birthdate" value="2021-02-20" onChange={mockOnChange} />
    );

    expect(screen.getByText('Feb 20, 2021')).toBeInTheDocument();
  });
});
