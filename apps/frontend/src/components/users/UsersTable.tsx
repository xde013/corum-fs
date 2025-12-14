import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table';
import { FiChevronUp, FiChevronDown, FiChevronsDown } from 'react-icons/fi';
import type { User, SortField, SortOrder } from '../../types';

interface UsersTableProps {
  data: User[];
  onRowClick?: (user: User) => void;
  isLoading?: boolean;
  sortBy?: SortField;
  sortOrder?: SortOrder;
  onSortChange?: (sortBy: SortField, sortOrder: SortOrder) => void;
}

export const UsersTable = ({
  data,
  onRowClick,
  isLoading = false,
  sortBy,
  sortOrder,
  onSortChange,
}: UsersTableProps) => {
  const handleHeaderClick = (field: SortField) => {
    if (!onSortChange) return;
    
    // Toggle sort order if clicking the same field, otherwise default to ASC
    if (sortBy === field) {
      const newOrder = sortOrder === 'ASC' ? 'DESC' : 'ASC';
      onSortChange(field, newOrder);
    } else {
      onSortChange(field, 'ASC');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortBy !== field) {
      return <FiChevronsDown className="h-4 w-4 text-gray-400" />;
    }
    return sortOrder === 'ASC' ? (
      <FiChevronUp className="h-4 w-4" />
    ) : (
      <FiChevronDown className="h-4 w-4" />
    );
  };

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'firstName',
      header: 'First Name',
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: 'lastName',
      header: 'Last Name',
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: (info) => {
        const role = info.getValue() as string;
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              role === 'admin'
                ? 'bg-purple-100 text-purple-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {role.toUpperCase()}
          </span>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Created At',
      cell: (info) => {
        const date = new Date(info.getValue() as string);
        return date.toLocaleDateString();
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true, // Use server-side sorting
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No users found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="max-h-[600px] overflow-y-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const field = header.column.id as SortField;
                  const isSortable = ['firstName', 'lastName', 'email', 'createdAt'].includes(field);
                  
                  return (
                    <th
                      key={header.id}
                      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 ${
                        isSortable && onSortChange
                          ? 'cursor-pointer hover:bg-gray-100'
                          : ''
                      }`}
                      onClick={
                        isSortable && onSortChange
                          ? () => handleHeaderClick(field as SortField)
                          : undefined
                      }
                    >
                      <div className="flex items-center gap-2">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {isSortable && onSortChange && (
                          <span className="flex flex-col">
                            {getSortIcon(field as SortField)}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={`hover:bg-gray-50 ${
                  onRowClick ? 'cursor-pointer' : ''
                }`}
                onClick={() => onRowClick?.(row.original)}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
