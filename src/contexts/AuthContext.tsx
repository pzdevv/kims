import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthContextType, UserProfile, UserRole, Area } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users for testing (will be replaced with Supabase auth)
const DEMO_USERS: (UserProfile & { password: string })[] = [
  {
    id: '1',
    email: 'admin@kavyaschool.edu.np',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin',
    department: 'Administration',
    created_at: new Date().toISOString(),
    is_active: true,
  },
  {
    id: '2',
    email: 'manager@kavyaschool.edu.np',
    password: 'manager123',
    name: 'Manager User',
    role: 'manager',
    department: 'Science Department',
    created_at: new Date().toISOString(),
    is_active: true,
  },
  {
    id: '3',
    email: 'staff@kavyaschool.edu.np',
    password: 'staff123',
    name: 'Staff User',
    role: 'staff',
    department: 'Physics Lab',
    created_at: new Date().toISOString(),
    is_active: true,
  },
];

const DEMO_AREAS: Area[] = [
  { id: '1', name: 'Physics Lab', description: 'Physics laboratory equipment', created_at: new Date().toISOString() },
  { id: '2', name: 'Chemistry Lab', description: 'Chemistry laboratory equipment', created_at: new Date().toISOString() },
  { id: '3', name: 'Biology Lab', description: 'Biology laboratory equipment', created_at: new Date().toISOString() },
  { id: '4', name: 'Computer Lab', description: 'Computer and IT equipment', created_at: new Date().toISOString() },
  { id: '5', name: 'Library', description: 'Books and reading materials', created_at: new Date().toISOString() },
  { id: '6', name: 'Sports Room', description: 'Sports equipment and gear', created_at: new Date().toISOString() },
  { id: '7', name: 'Admin Office', description: 'Office supplies and equipment', created_at: new Date().toISOString() },
  { id: '8', name: 'Storeroom', description: 'General storage', created_at: new Date().toISOString() },
];

// Demo user-area assignments
const DEMO_USER_AREAS: Record<string, string[]> = {
  '1': ['1', '2', '3', '4', '5', '6', '7', '8'], // Admin has all areas
  '2': ['1', '2', '3'], // Manager has labs
  '3': ['1'], // Staff has only Physics Lab
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [userAreas, setUserAreas] = useState<Area[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('kavya_user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      const areaIds = DEMO_USER_AREAS[parsed.id] || [];
      setUserAreas(DEMO_AREAS.filter(a => areaIds.includes(a.id)));
    }
    setIsLoading(false);
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    const lowerEmail = email.toLowerCase();
    
    // Validate Kavya email domain
    if (!lowerEmail.endsWith('@kavyaschool.edu.np')) {
      return { error: 'Only @kavyaschool.edu.np email addresses are allowed' };
    }

    const foundUser = DEMO_USERS.find(
      u => u.email.toLowerCase() === lowerEmail && u.password === password
    );

    if (!foundUser) {
      return { error: 'Invalid email or password' };
    }

    if (!foundUser.is_active) {
      return { error: 'Your account has been deactivated' };
    }

    const { password: _, ...userWithoutPassword } = foundUser;
    setUser(userWithoutPassword);
    localStorage.setItem('kavya_user', JSON.stringify(userWithoutPassword));
    
    const areaIds = DEMO_USER_AREAS[foundUser.id] || [];
    setUserAreas(DEMO_AREAS.filter(a => areaIds.includes(a.id)));

    return { error: null };
  };

  const signUp = async (email: string, password: string, name: string): Promise<{ error: string | null }> => {
    const lowerEmail = email.toLowerCase();
    
    // Validate Kavya email domain
    if (!lowerEmail.endsWith('@kavyaschool.edu.np')) {
      return { error: 'Only @kavyaschool.edu.np email addresses are allowed' };
    }

    // Check if user already exists
    if (DEMO_USERS.some(u => u.email.toLowerCase() === lowerEmail)) {
      return { error: 'An account with this email already exists' };
    }

    // In demo mode, just return success message
    return { error: 'Sign up successful! Please wait for admin approval to access the system.' };
  };

  const signOut = async () => {
    setUser(null);
    setUserAreas([]);
    localStorage.removeItem('kavya_user');
  };

  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    return user.role === role;
  };

  const hasAreaAccess = (areaId: string): boolean => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return userAreas.some(a => a.id === areaId);
  };

  return (
    <AuthContext.Provider value={{ user, userAreas, isLoading, signIn, signUp, signOut, hasRole, hasAreaAccess }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
