/**
 * Validates redirect paths to prevent open redirect vulnerabilities
 * Only allows redirects to internal routes (relative paths starting with /)
 * and validates against a whitelist of allowed paths
 */

const ALLOWED_REDIRECT_PATHS = [
  '/dashboard',
  '/profile',
  '/users/new',
  '/users',
  '/auth/login',
  '/auth/forgot-password',
  '/auth/reset-password',
];

/**
 * Validates if a redirect path is safe to use
 * @param path - The path to validate
 * @returns The validated path or a default safe path
 */
export const validateRedirectPath = (path: string | undefined | null): string => {
  // Default to dashboard if no path provided
  if (!path) {
    return '/dashboard';
  }

  // Only allow relative paths (starting with /)
  // Reject absolute URLs, protocol-relative URLs, and javascript: schemes
  // Allow colons in route params (e.g., /users/:id) but reject protocol schemes
  if (!path.startsWith('/') || path.startsWith('//') || /^[a-zA-Z]+:/.test(path)) {
    return '/dashboard';
  }

  // Check if path is in whitelist or is a valid internal route pattern
  // Allow paths that start with allowed paths (e.g., /users/:id/edit)
  const isAllowed = ALLOWED_REDIRECT_PATHS.some((allowedPath) => {
    return path === allowedPath || path.startsWith(allowedPath + '/');
  });

  // Also allow paths that match common internal route patterns
  const isValidInternalRoute = /^\/[a-zA-Z0-9\-_/:]*$/.test(path);

  if (isAllowed || isValidInternalRoute) {
    return path;
  }

  // Default to dashboard for any invalid paths
  return '/dashboard';
};
