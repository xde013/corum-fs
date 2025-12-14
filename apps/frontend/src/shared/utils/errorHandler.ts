import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

/**
 * Handles API errors and displays appropriate toast messages
 * @param error - The error object (typically from axios)
 * @param defaultMessage - Default message to show if error doesn't have a specific message
 * @param options - Optional toast configuration
 */
export const handleApiError = (
  error: unknown,
  defaultMessage: string,
  options?: { duration?: number }
): void => {
  const axiosError = error as AxiosError<{ message?: string }>;
  const message = axiosError.response?.data?.message || defaultMessage;
  toast.error(message, options);
};

/**
 * Handles API success and displays success toast
 * @param message - Success message to display
 * @param options - Optional toast configuration
 */
export const handleApiSuccess = (
  message: string,
  options?: { duration?: number }
): void => {
  toast.success(message, options);
};
