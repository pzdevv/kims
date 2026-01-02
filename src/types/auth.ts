export type UserRole = 'admin' | 'manager' | 'staff' | 'viewer';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string;
  phone?: string;
  created_at: string;
  is_active: boolean;
}

export interface Area {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface UserArea {
  user_id: string;
  area_id: string;
}

export interface AuthContextType {
  user: UserProfile | null;
  userAreas: Area[];
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  hasAreaAccess: (areaId: string) => boolean;
}

export const KAVYA_EMAIL_DOMAIN = '@kavyaschool.edu.np';

export function isValidKavyaEmail(email: string): boolean {
  return email.toLowerCase().endsWith(KAVYA_EMAIL_DOMAIN);
}

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: ['all'],
  manager: ['view', 'add', 'edit', 'issue', 'return', 'reports'],
  staff: ['view', 'request', 'return'],
  viewer: ['view'],
};
