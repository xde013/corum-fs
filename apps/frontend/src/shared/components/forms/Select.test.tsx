import { render, screen } from '@/shared/utils/testUtils';
import { Select } from './Select';
import { describe, it, expect } from 'vitest';

describe('Select', () => {
  it('should render select with label', () => {
    render(
      <Select label="Test Select">
        <option value="1">Option 1</option>
      </Select>
    );
    expect(screen.getByLabelText('Test Select')).toBeInTheDocument();
  });

  it('should render options', () => {
    render(
      <Select label="Test Select">
        <option value="1">Option 1</option>
        <option value="2">Option 2</option>
      </Select>
    );
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });

  it('should display error message', () => {
    render(
      <Select label="Test Select" error="This field is required">
        <option value="1">Option 1</option>
      </Select>
    );
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('should render required indicator when required', () => {
    render(
      <Select label="Test Select" required>
        <option value="1">Option 1</option>
      </Select>
    );
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('should be disabled when disabled prop is true', () => {
    render(
      <Select label="Test Select" disabled>
        <option value="1">Option 1</option>
      </Select>
    );
    expect(screen.getByLabelText('Test Select')).toBeDisabled();
  });

  it('should forward select props', () => {
    render(
      <Select label="Test Select" defaultValue="1" name="test-select">
        <option value="1">Option 1</option>
      </Select>
    );
    const select = screen.getByLabelText('Test Select') as HTMLSelectElement;
    expect(select.value).toBe('1');
    expect(select).toHaveAttribute('name', 'test-select');
  });
});
