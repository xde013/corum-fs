import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAsyncOperation } from '@/shared/hooks/useAsyncOperation';
import { handleApiError, handleApiSuccess } from '@/shared/utils/errorHandler';

interface UseFormSubmissionOptions {
  successMessage: string;
  errorMessage: string;
  redirectTo?: string;
  redirectOptions?: { replace?: boolean };
  onSuccess?: (result?: any) => void | Promise<void>;
  onError?: (error: unknown) => void;
  errorOptions?: { duration?: number };
}

/**
 * Custom hook for handling form submissions with loading state, error handling, and success messages
 * @param operation - The async function to execute
 * @param options - Configuration options for the submission
 * @returns Object containing submit function and isLoading state
 */
export const useFormSubmission = <T extends (...args: any[]) => Promise<any>>(
  operation: T,
  options: UseFormSubmissionOptions
) => {
  const navigate = useNavigate();
  const { execute, isLoading } = useAsyncOperation(operation);

  const submit = useCallback(
    async (...args: Parameters<T>) => {
      try {
        const result = await execute(...args);
        handleApiSuccess(options.successMessage);
        
        // Execute success callback if provided
        if (options.onSuccess) {
          await options.onSuccess(result);
        }
        
        // Navigate if redirect path is provided
        if (options.redirectTo) {
          navigate(options.redirectTo, options.redirectOptions);
        }
      } catch (error) {
        handleApiError(error, options.errorMessage, options.errorOptions);
        
        // Execute error callback if provided
        if (options.onError) {
          options.onError(error);
        }
      }
    },
    [execute, navigate, options]
  );

  return { submit, isLoading };
};
