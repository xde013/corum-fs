import { useState, useCallback } from 'react';

/**
 * Custom hook for managing async operations with loading state and error handling
 * @param operation - The async function to execute
 * @returns Object containing execute function, isLoading state, and error state
 */
export const useAsyncOperation = <T extends (...args: any[]) => Promise<any>>(
  operation: T
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (...args: Parameters<T>): Promise<ReturnType<T> | undefined> => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await operation(...args);
        return result;
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [operation]
  );

  return { execute, isLoading, error };
};
