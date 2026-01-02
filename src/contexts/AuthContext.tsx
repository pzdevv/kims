import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { Profile, Area, UserRole } from '@/types/database';
import type { User, Session } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

export interface AuthContextType {
  user: Profile | null;
  session: Session | null;
  userAreas: Area[];
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  hasAreaAccess: (areaId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const KAVYA_EMAIL_DOMAIN = '@kavyaschool.edu.np';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<Profile | null>(null);
  const [userAreas, setUserAreas] = useState<Area[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch user profile and areas from database
  const fetchUserData = async (authUser: User) => {
    try {
      console.log('Fetching user data for:', authUser.email);

      // Fetch profile
      let { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          // Profile missing, create it (Self-healing)
          console.log('Profile missing, creating default profile...');
          const newProfile = {
            id: authUser.id,
            email: authUser.email!,
            name: authUser.user_metadata.name || authUser.email!.split('@')[0],
            role: 'viewer' as UserRole, // Defaults to viewer
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          const { error: insertError } = await supabase
            .from('profiles')
            .insert([newProfile] as any);

          if (insertError) {
            console.error('Error creating profile:', insertError);
            toast({
              title: "Profile Creation Failed",
              description: "Could not create user profile. Please contact support.",
              variant: "destructive"
            });
            // Don't set user if we failed to create a valid profile
            // This prevents "Ghost Viewer" state
            return;
          }

          setUser(newProfile as any);
        } else {
          console.error('Error fetching profile:', profileError);
          toast({
            title: "Database Error",
            description: "Failed to load user profile. Please try again.",
            variant: "destructive"
          });
        }
      } else {
        // Profile loaded successfully
        console.log('Profile loaded:', profile);
        setUser(profile as any);
      }

      // Fetch user areas if we have a user
      const { data: userAreaData, error: areasError } = await supabase
        .from('user_areas')
        .select('area_id, areas(*)')
        .eq('user_id', authUser.id);

      if (areasError) {
        console.error('Error fetching user areas:', areasError);
      }

      const areas = userAreaData
        ?.map((ua: any) => ua.areas)
        .filter((a): a is Area => a !== null) || [];
      setUserAreas(areas);

    } catch (error) {
      console.error('Error in fetchUserData:', error);
      toast({
        title: "System Error",
        description: "An unexpected error occurred while loading userdata.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        if (session?.user) {
          await fetchUserData(session.user);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        setSession(session);

        if (event === 'SIGNED_OUT') {
          setUser(null);
          setUserAreas([]);
          setIsLoading(false);
        } else if (session?.user) {
          // If manually triggered by signIn, fetching might already happen
          // But redundancy ensures consistency
          if (event !== 'SIGNED_IN') {
            // SIGNED_IN handled by signIn function for immediate feedback
            // But for token refresh etc, we might want to refresh data?
            // For now, minimal fetches to avoid loops
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    setIsLoading(true);
    const lowerEmail = email.toLowerCase();

    if (!lowerEmail.endsWith(KAVYA_EMAIL_DOMAIN)) {
      setIsLoading(false);
      return { error: 'Only @kavyaschool.edu.np email addresses are allowed' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: lowerEmail,
        password,
      });

      if (error) {
        setIsLoading(false);
        return { error: error.message };
      }

      if (data.user) {
        setSession(data.session);
        // Await the fetch to ensure correct role is loaded before redirecting
        await fetchUserData(data.user);
      }

      return { error: null };
    } catch (err: any) {
      console.error("Login exception:", err);
      return { error: err.message || "An unexpected error occurred" };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string): Promise<{ error: string | null }> => {
    setIsLoading(true);
    const lowerEmail = email.toLowerCase();

    if (!lowerEmail.endsWith(KAVYA_EMAIL_DOMAIN)) {
      setIsLoading(false);
      return { error: 'Only @kavyaschool.edu.np email addresses are allowed' };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: lowerEmail,
        password,
        options: {
          data: { name: name },
        },
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').insert([{
          id: data.user.id,
          email: lowerEmail,
          name: name,
          role: 'viewer',
          is_active: false,
        }] as any);

        if (profileError) console.error('Error creating profile:', profileError);
      }

      return { error: 'Sign up successful! Please wait for admin approval.' };
    } catch (err: any) {
      return { error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      setUser(null);
      setUserAreas([]);
      setSession(null);
    }
  };

  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (Array.isArray(role)) return role.includes(user.role);
    return user.role === role;
  };

  const hasAreaAccess = (areaId: string): boolean => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return userAreas.some(a => a.id === areaId);
  };

  return (
    <AuthContext.Provider value={{ user, session, userAreas, isLoading, signIn, signUp, signOut, hasRole, hasAreaAccess }}>
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
