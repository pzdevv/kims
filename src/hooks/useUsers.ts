import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import type { Profile, UserRole } from '@/types/database';

export interface UserWithAreas extends Profile {
  areas: { id: string; name: string }[];
}

export function useUsers() {
  const [users, setUsers] = useState<UserWithAreas[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch user-area assignments
      const { data: userAreas, error: areasError } = await supabase
        .from('user_areas')
        .select('user_id, area_id, areas(id, name)');

      if (areasError) throw areasError;

      // Map areas to users
      const usersWithAreas: UserWithAreas[] = (profiles || []).map((profile) => {
        const areas = (userAreas || [])
          .filter((ua: any) => ua.user_id === profile.id)
          .map((ua: any) => ua.areas)
          .filter(Boolean);
        return { ...profile, areas };
      });

      setUsers(usersWithAreas);
      return usersWithAreas;
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive',
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Admin-only function to invite a new user
  const inviteUser = async (userData: {
    email: string;
    role: UserRole;
    areaIds?: string[];
  }) => {
    setLoading(true);
    try {
      // Verify current user is admin
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        const { data: currentProfile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', currentUser.id)
          .single();

        if (!currentProfile || (currentProfile as any).role !== 'admin') {
          toast({
            title: 'Error',
            description: 'Only administrators can invite new users',
            variant: 'destructive',
          });
          return null;
        }
      }

      // Validate email domain
      if (!userData.email.toLowerCase().endsWith('@kavyaschool.edu.np')) {
        toast({
          title: 'Error',
          description: 'Email must be from @kavyaschool.edu.np domain',
          variant: 'destructive',
        });
        return null;
      }

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', userData.email)
        .single();

      if (existingUser) {
        toast({
          title: 'Error',
          description: 'A user with this email already exists',
          variant: 'destructive',
        });
        return null;
      }

      // Create user with signUp - sends confirmation email
      const { error: signUpError } = await supabase.auth.signUp({
        email: userData.email,
        password: crypto.randomUUID(),
        options: {
          data: {
            role: userData.role,
            areaIds: userData.areaIds || [],
          },
          emailRedirectTo: `${window.location.origin}/auth/set-password`,
        }
      });

      if (signUpError) throw signUpError;

      toast({
        title: 'Invitation Sent!',
        description: `Invitation email sent to ${userData.email}.`
      });

      fetchUsers();
      return { success: true };
    } catch (error: any) {
      console.error('Error inviting user:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send invitation',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Reset user password
  const resetUserPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/set-password`,
      });

      if (error) throw error;

      toast({ title: 'Success', description: 'Password reset email sent' });
      return true;
    } catch (error: any) {
      console.error('Error resetting password:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send reset email',
        variant: 'destructive',
      });
      return false;
    }
  };

  const updateUser = async (
    userId: string,
    updates: Partial<Omit<Profile, 'id' | 'created_at'>>
  ) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates as any)
        .eq('id', userId);

      if (error) throw error;

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, ...updates } : u))
      );

      toast({ title: 'Success', description: 'User updated successfully' });
      return true;
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update user',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, role: UserRole) => {
    return updateUser(userId, { role });
  };

  const toggleUserActive = async (userId: string, isActive: boolean) => {
    return updateUser(userId, { is_active: isActive });
  };

  const assignAreasToUser = async (userId: string, areaIds: string[]) => {
    setLoading(true);
    try {
      // First, remove all existing area assignments
      const { error: deleteError } = await supabase
        .from('user_areas')
        .delete()
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      // Then, add new area assignments
      if (areaIds.length > 0) {
        const assignments = areaIds.map((areaId) => ({
          user_id: userId,
          area_id: areaId,
        }));

        const { error: insertError } = await supabase
          .from('user_areas')
          .insert(assignments as any);

        if (insertError) throw insertError;
      }

      // Update local state
      const { data: areas } = await supabase
        .from('areas')
        .select('id, name')
        .in('id', areaIds);

      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, areas: areas || [] } : u
        )
      );

      toast({ title: 'Success', description: 'User areas updated' });
      return true;
    } catch (error: any) {
      console.error('Error assigning areas:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update user areas',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    setLoading(true);
    try {
      // Soft delete by deactivating
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: false } as any)
        .eq('id', userId);

      if (error) throw error;

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_active: false } : u))
      );

      toast({ title: 'Success', description: 'User deactivated' });
      return true;
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete user',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getUserById = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error fetching user:', error);
      return null;
    }
  };

  return {
    users,
    loading,
    fetchUsers,
    inviteUser,
    resetUserPassword,
    updateUser,
    updateUserRole,
    toggleUserActive,
    assignAreasToUser,
    deleteUser,
    getUserById,
  };
}
