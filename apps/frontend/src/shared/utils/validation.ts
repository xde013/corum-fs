import { z } from 'zod';

// Validation Constants
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
const PASSWORD_MESSAGE =
  'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)';

const NAME_MIN_LENGTH = 2;
const NAME_MAX_LENGTH = 50;

// Reusable Validation Schemas
const emailSchema = z.email('Please enter a valid email address');

const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
  .max(PASSWORD_MAX_LENGTH, `Password must be at most ${PASSWORD_MAX_LENGTH} characters`)
  .regex(PASSWORD_PATTERN, PASSWORD_MESSAGE);

const firstNameSchema = z
  .string()
  .min(NAME_MIN_LENGTH, `First name must be at least ${NAME_MIN_LENGTH} characters`)
  .max(NAME_MAX_LENGTH, `First name must be at most ${NAME_MAX_LENGTH} characters`);

const lastNameSchema = z
  .string()
  .min(NAME_MIN_LENGTH, `Last name must be at least ${NAME_MIN_LENGTH} characters`)
  .max(NAME_MAX_LENGTH, `Last name must be at most ${NAME_MAX_LENGTH} characters`);

// Helper function to validate birthdate is not in the future
const validateBirthdateNotFuture = (date: string): boolean => {
  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(23, 59, 59, 999); // Set to end of today
  return selectedDate <= today;
};

const birthdateSchema = z
  .string()
  .min(1, 'Birthdate is required')
  .refine(validateBirthdateNotFuture, {
    message: 'Birthdate cannot be in the future',
  });

const birthdateOptionalSchema = z
  .string()
  .min(1, 'Birthdate is required')
  .refine(
    (date) => {
      if (!date) return true; // Optional field, allow empty
      return validateBirthdateNotFuture(date);
    },
    {
      message: 'Birthdate cannot be in the future',
    }
  )
  .optional();

const roleSchema = z.enum(['user', 'admin'] as const);


// Form Schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: passwordSchema,
});

export const profileSchema = z.object({
  firstName: firstNameSchema,
  lastName: lastNameSchema,
  birthdate: birthdateSchema,
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const createUserSchema = z.object({
  firstName: firstNameSchema,
  lastName: lastNameSchema,
  email: emailSchema,
  password: passwordSchema,
  birthdate: birthdateSchema,
  role: roleSchema.optional(),
});

export const updateUserSchema = z.object({
  firstName: firstNameSchema.optional(),
  lastName: lastNameSchema.optional(),
  password: passwordSchema.optional().or(z.literal('')),
  birthdate: birthdateOptionalSchema,
  role: roleSchema.optional(),
});


export type LoginFormData = z.infer<typeof loginSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type UpdateUserFormData = z.infer<typeof updateUserSchema>;
