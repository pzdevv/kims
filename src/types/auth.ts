// Re-export types from database.ts for backward compatibility
export type { Profile as UserProfile, Area } from './database';

// Updated role system - only 3 roles
export type UserRole = 'admin' | 'general_manager' | 'manager';

export interface UserArea {
  user_id: string;
  area_id: string;
}

export { KAVYA_EMAIL_DOMAIN } from '@/contexts/AuthContext';
export type { AuthContextType } from '@/contexts/AuthContext';

export function isValidKavyaEmail(email: string): boolean {
  return email.toLowerCase().endsWith('@kavyaschool.edu.np');
}

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: ['all', 'manage_users', 'manage_areas', 'manage_categories', 'manage_inventory', 'manage_transactions'],
  general_manager: ['manage_areas', 'manage_categories', 'manage_inventory', 'manage_transactions'],
  manager: ['view', 'manage_inventory', 'manage_transactions'],
};

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  general_manager: 'General Manager',
  manager: 'Manager',
};
