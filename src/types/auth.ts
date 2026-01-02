// Re-export types from database.ts for backward compatibility
export type { UserRole, Profile as UserProfile, Area } from './database';

export interface UserArea {
  user_id: string;
  area_id: string;
}

export { KAVYA_EMAIL_DOMAIN } from '@/contexts/AuthContext';
export type { AuthContextType } from '@/contexts/AuthContext';

export function isValidKavyaEmail(email: string): boolean {
  return email.toLowerCase().endsWith('@kavyaschool.edu.np');
}

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: ['all'],
  manager: ['view', 'add', 'edit', 'issue', 'return', 'reports'],
  staff: ['view', 'request', 'return'],
  viewer: ['view'],
};
