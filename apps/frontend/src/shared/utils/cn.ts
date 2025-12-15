import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  // Merge the input classes using clsx and twMerge e.g: cn('bg-red-500', 'text-white', 'p-2') => 'bg-red-500 text-white p-2'
  return twMerge(clsx(inputs));
}
