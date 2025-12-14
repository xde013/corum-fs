import { handleApiError, handleApiSuccess } from './errorHandler';
import toast from 'react-hot-toast';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe('errorHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handleApiError', () => {
    it('should call toast.error with error message from response', () => {
      const error = {
        response: {
          data: {
            message: 'Custom error message',
          },
        },
      };

      handleApiError(error, 'Default error message');

      expect(toast.error).toHaveBeenCalledWith('Custom error message', undefined);
    });

    it('should use default message when response message is not available', () => {
      const error = {
        response: {
          data: {},
        },
      };

      handleApiError(error, 'Default error message');

      expect(toast.error).toHaveBeenCalledWith('Default error message', undefined);
    });

    it('should use default message when response is not available', () => {
      const error = {};

      handleApiError(error, 'Default error message');

      expect(toast.error).toHaveBeenCalledWith('Default error message', undefined);
    });

    it('should pass options to toast.error', () => {
      const error = {
        response: {
          data: {
            message: 'Error message',
          },
        },
      };

      handleApiError(error, 'Default error message', { duration: 5000 });

      expect(toast.error).toHaveBeenCalledWith('Error message', { duration: 5000 });
    });
  });

  describe('handleApiSuccess', () => {
    it('should call toast.success with message', () => {
      handleApiSuccess('Success message');

      expect(toast.success).toHaveBeenCalledWith('Success message', undefined);
    });

    it('should pass options to toast.success', () => {
      handleApiSuccess('Success message', { duration: 3000 });

      expect(toast.success).toHaveBeenCalledWith('Success message', { duration: 3000 });
    });
  });
});
