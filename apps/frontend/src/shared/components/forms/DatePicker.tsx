import { forwardRef, useState, useEffect, useRef } from 'react';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns/format';
import { FiCalendar } from 'react-icons/fi';
import { cn } from '@/shared/utils/cn';
import 'react-day-picker/dist/style.css';

interface DatePickerProps {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  id?: string;
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ label, value, onChange, error, helperText, disabled, required, id, className }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [internalDate, setInternalDate] = useState<Date | undefined>(
      value ? new Date(value) : undefined
    );
    const pickerRef = useRef<HTMLDivElement>(null);

    const inputId = id || `datepicker-${label?.toLowerCase().replace(/\s+/g, '-')}`;

    // Derive selectedDate from value prop (controlled) or internal state (uncontrolled)
    const selectedDate = value !== undefined ? (value ? new Date(value) : undefined) : internalDate;

    // Close picker when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
      }
    }, [isOpen]);

    const handleDateSelect = (date: Date | undefined) => {
      if (date) {
        // Update internal state only if component is uncontrolled
        if (value === undefined) {
          setInternalDate(date);
        }
        onChange?.(format(date, 'yyyy-MM-dd'));
        setIsOpen(false);
      }
    };

    const displayValue = selectedDate ? format(selectedDate, 'MMM dd, yyyy') : '';

    // Disable future dates
    const isDateDisabled = (date: Date) => {
      const today = new Date();
      today.setHours(23, 59, 59, 999); // Set to end of today
      return date > today;
    };

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative" ref={pickerRef}>
          <div
            ref={ref as any}
            onClick={() => !disabled && setIsOpen(!isOpen)}
            className={cn(
              'w-full px-3 py-2 pr-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors cursor-pointer bg-white',
              error
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-300',
              disabled && 'bg-gray-50 cursor-not-allowed opacity-50',
              className
            )}
          >
            <div className="flex items-center justify-between">
              <span className={selectedDate ? 'text-gray-900' : 'text-gray-500'}>
                {selectedDate ? displayValue : 'Select a date'}
              </span>
              <FiCalendar className="h-5 w-5 text-gray-400" />
            </div>
          </div>

          {isOpen && !disabled && (
            <div className="absolute z-20 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3">
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={(date) => disabled || isDateDisabled(date)}
                captionLayout="dropdown"
                fromYear={1900}
                toYear={new Date().getFullYear()}
              />
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

DatePicker.displayName = 'DatePicker';
