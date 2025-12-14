import { renderHook, waitFor, act } from '@/shared/utils/testUtils';
import { useAsyncOperation } from './useAsyncOperation';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('useAsyncOperation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with loading false', () => {
    const mockOperation = vi.fn().mockResolvedValue('success');
    const { result } = renderHook(() => useAsyncOperation(mockOperation));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should set loading to true during operation', async () => {
    const mockOperation = vi.fn(
      () => new Promise((resolve) => setTimeout(() => resolve('success'), 100))
    ) as (arg?: string) => Promise<string>;
    const { result } = renderHook(() => useAsyncOperation(mockOperation));

    let promise: Promise<string | undefined>;
    await act(async () => {
      promise = result.current.execute('test') as Promise<string | undefined>;
    });
    
    // Wait for loading state to be set (React state updates are async)
    await waitFor(() => {
      expect(result.current.isLoading).toBe(true);
    });
    
    await act(async () => {
      await promise!;
    });
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should execute operation successfully', async () => {
    const mockOperation = vi.fn().mockResolvedValue('success');
    const { result } = renderHook(() => useAsyncOperation(mockOperation));

    let value: string | undefined;
    await act(async () => {
      const executePromise = result.current.execute('arg1', 'arg2');
      value = await executePromise;
    });

    expect(mockOperation).toHaveBeenCalledWith('arg1', 'arg2');
    expect(value).toBe('success');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should handle errors and set error state', async () => {
    const error = new Error('Test error');
    const mockOperation = vi.fn().mockRejectedValue(error);
    const { result } = renderHook(() => useAsyncOperation(mockOperation));

    await act(async () => {
      try {
        await result.current.execute();
      } catch (e) {
        expect(e).toBe(error);
      }
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(error);
    });
  });

  it('should reset error on new execution', async () => {
    const error1 = new Error('Error 1');
    const error2 = new Error('Error 2');
    const mockOperation = vi
      .fn()
      .mockRejectedValueOnce(error1)
      .mockRejectedValueOnce(error2);
    
    const { result } = renderHook(() => useAsyncOperation(mockOperation));

    // First execution with error
    await act(async () => {
      try {
        await result.current.execute();
      } catch {
        // Expected
      }
    });

    await waitFor(() => {
      expect(result.current.error).toBe(error1);
    });

    // Second execution should reset error
    await act(async () => {
      try {
        await result.current.execute();
      } catch {
        // Expected
      }
    });

    await waitFor(() => {
      expect(result.current.error).toBe(error2);
    });
  });

  it('should handle operations with different return types', async () => {
    const mockOperation = vi.fn().mockResolvedValue({ id: 1, name: 'Test' });
    const { result } = renderHook(() => useAsyncOperation(mockOperation));

    let value: { id: number; name: string } | undefined;
    await act(async () => {
      value = await result.current.execute();
    });

    expect(value).toEqual({ id: 1, name: 'Test' });
  });
});
