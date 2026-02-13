import type { Category } from '../../types.ts';

export function isCategoryNameUnique(name: string, existingCategories: Category[], excludeId?: string): boolean {
  return !existingCategories.some(cat => cat.name.toLowerCase() === name.trim().toLowerCase() && cat.id !== excludeId);
}
