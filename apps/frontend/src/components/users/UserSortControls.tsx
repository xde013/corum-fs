import { Select } from '../forms/Select';
import type { SortField, SortOrder } from '../../types';

interface UserSortControlsProps {
  sortBy: SortField;
  sortOrder: SortOrder;
  onSortChange: (sortBy: SortField, sortOrder: SortOrder) => void;
}

export const UserSortControls = ({
  sortBy,
  sortOrder,
  onSortChange,
}: UserSortControlsProps) => {
  const sortFields: { value: SortField; label: string }[] = [
    { value: 'createdAt', label: 'Created Date' },
    { value: 'updatedAt', label: 'Updated Date' },
    { value: 'firstName', label: 'First Name' },
    { value: 'lastName', label: 'Last Name' },
    { value: 'email', label: 'Email' },
    { value: 'birthdate', label: 'Birthdate' },
  ];

  return (
    <div className="flex items-center gap-3">
      <Select
        label="Sort By"
        value={sortBy}
        onChange={(e) =>
          onSortChange(e.target.value as SortField, sortOrder)
        }
        className="min-w-[150px]"
      >
        {sortFields.map((field) => (
          <option key={field.value} value={field.value}>
            {field.label}
          </option>
        ))}
      </Select>
      <Select
        label="Order"
        value={sortOrder}
        onChange={(e) =>
          onSortChange(sortBy, e.target.value as SortOrder)
        }
        className="min-w-[100px]"
      >
        <option value="ASC">Ascending</option>
        <option value="DESC">Descending</option>
      </Select>
    </div>
  );
};
