import { MenuItem } from '@/data/types';

export function validateMenuItem(item: MenuItem): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!item.name) {
    errors.push('Name is required');
  }

  if (!item.category) {
    errors.push('Category is required');
  }

  if (!item.description) {
    errors.push('Description is required');
  }

  if (item.price <= 0) {
    errors.push('Price must be greater than 0');
  }

  if (item.stock < 0) {
    errors.push('Stock cannot be negative');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
} 