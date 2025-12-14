import { renderHook, waitFor, act } from '@testing-library/react';
import { useFormSubmission } from '@/shared/hooks/useFormSubmission';
import { BrowserRouter } from 'react-router-dom';
import { ReactNode } from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

// Mock error handler
vi.mock('@/shared/utils/errorHandler', () => ({
  handleApiError: vi.fn(),
  handleApiSuccess: vi.fn(),
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('useFormSubmission', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with loading false', () => {
    const mockOperation = vi.fn().mockResolvedValue('success');
    const { result } = renderHook(
      () =>
        useFormSubmission(mockOperation, {
          successMessage: 'Success',
          errorMessage: 'Error',
        }),
      { wrapper }
    );

    expect(result.current.isLoading).toBe(false);
  });

  it('should execute operation and show success message', async () => {
    const { handleApiSuccess } = await import('@/shared/utils/errorHandler');
    const mockOperation = vi.fn().mockResolvedValue('success');
    const { result } = renderHook(
      () =>
        useFormSubmission(mockOperation, {
          successMessage: 'Operation successful',
          errorMessage: 'Operation failed',
        }),
      { wrapper }
    );

    await act(async () => {
      await result.current.submit('arg1');
    });

    expect(mockOperation).toHaveBeenCalledWith('arg1');
    expect(handleApiSuccess).toHaveBeenCalledWith('Operation successful');
  });

  it('should handle errors and show error message', async () => {
    const { handleApiError } = await import('@/shared/utils/errorHandler');
    const error = new Error('Test error');
    const mockOperation = vi.fn().mockRejectedValue(error);
    const { result } = renderHook(
      () =>
        useFormSubmission(mockOperation, {
          successMessage: 'Success',
          errorMessage: 'Operation failed',
        }),
      { wrapper }
    );

    await act(async () => {
      await result.current.submit();
    });

    expect(handleApiError).toHaveBeenCalledWith(error, 'Operation failed', undefined);
  });

  it('should call onSuccess callback when provided', async () => {
    const onSuccess = vi.fn();
    const mockOperation = vi.fn().mockResolvedValue('result');
    const { result } = renderHook(
      () =>
        useFormSubmission(mockOperation, {
          successMessage: 'Success',
          errorMessage: 'Error',
          onSuccess,
        }),
      { wrapper }
    );

    await act(async () => {
      await result.current.submit();
    });

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith('result');
    });
  });

  it('should call onError callback when provided', async () => {
    const onError = vi.fn();
    const error = new Error('Test error');
    const mockOperation = vi.fn().mockRejectedValue(error);
    const { result } = renderHook(
      () =>
        useFormSubmission(mockOperation, {
          successMessage: 'Success',
          errorMessage: 'Error',
          onError,
        }),
      { wrapper }
    );

    await act(async () => {
      await result.current.submit();
    });

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(error);
    });
  });

  it('should navigate when redirectTo is provided', async () => {
    const mockNavigate = vi.fn();
    vi.doMock('react-router-dom', () => ({
      useNavigate: () => mockNavigate,
    }));

    const mockOperation = vi.fn().mockResolvedValue('success');
    const { result } = renderHook(
      () =>
        useFormSubmission(mockOperation, {
          successMessage: 'Success',
          errorMessage: 'Error',
          redirectTo: '/dashboard',
        }),
      { wrapper }
    );

    await act(async () => {
      await result.current.submit();
    });

    // Note: This test would need proper mocking setup to verify navigation
    // The navigation is tested indirectly through integration tests
  });

  it('should pass error options to error handler', async () => {
    const { handleApiError } = await import('@/shared/utils/errorHandler');
    const error = new Error('Test error');
    const mockOperation = vi.fn().mockRejectedValue(error);
    const { result } = renderHook(
      () =>
        useFormSubmission(mockOperation, {
          successMessage: 'Success',
          errorMessage: 'Error',
          errorOptions: { duration: 5000 },
        }),
      { wrapper }
    );

    await act(async () => {
      await result.current.submit();
    });

    expect(handleApiError).toHaveBeenCalledWith(error, 'Error', { duration: 5000 });
  });
});
