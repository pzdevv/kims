import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User,
  Shield,
  Save,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  department: z.string().optional(),
});

const passwordSchema = z.object({
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      phone: '',
      department: '',
    },
  });

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Load user data into form when user changes
  useEffect(() => {
    if (user) {
      profileForm.reset({
        name: user.name || '',
        phone: user.phone || '',
        department: user.department || '',
      });
    }
  }, [user, profileForm]);

  const handleProfileSave = async (data: z.infer<typeof profileSchema>) => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: data.name,
          phone: data.phone || null,
          department: data.department || null,
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', user.id);

      if (error) throw error;

      // Also update auth user metadata
      await supabase.auth.updateUser({
        data: { name: data.name }
      });

      toast({ title: 'Profile Updated', description: 'Your profile has been saved.' });

      // Refresh user data in context
      if (refreshUser) {
        await refreshUser();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (data: z.infer<typeof passwordSchema>) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword,
      });

      if (error) throw error;

      toast({ title: 'Password Changed', description: 'Your password has been updated.' });
      passwordForm.reset();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to change password',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="profile" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="animate-fade-in">
          <Card glass>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  <User className="h-4 w-4 text-primary" />
                </div>
                Profile Information
              </CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={profileForm.handleSubmit(handleProfileSave)} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      {...profileForm.register('name')}
                    />
                    {profileForm.formState.errors.name && (
                      <p className="text-sm text-destructive">
                        {profileForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      {...profileForm.register('phone')}
                      placeholder="+977 98XXXXXXXX"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      {...profileForm.register('department')}
                      placeholder="e.g., Administration"
                    />
                  </div>
                </div>

                {/* Role Display */}
                <div className="space-y-2">
                  <Label>Role</Label>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary capitalize">
                      {user?.role?.replace('_', ' ') || 'Manager'}
                    </span>
                    <span className="text-xs text-muted-foreground">Contact admin to change role</span>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="animate-fade-in">
          <Card glass>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-500/10 rounded-lg">
                  <Shield className="h-4 w-4 text-amber-500" />
                </div>
                Change Password
              </CardTitle>
              <CardDescription>Update your account password</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)} className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    {...passwordForm.register('newPassword')}
                    placeholder="Enter new password"
                  />
                  {passwordForm.formState.errors.newPassword && (
                    <p className="text-sm text-destructive">
                      {passwordForm.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...passwordForm.register('confirmPassword')}
                    placeholder="Confirm new password"
                  />
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-destructive">
                      {passwordForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Shield className="mr-2 h-4 w-4" />
                  )}
                  Update Password
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card glass className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-500/10 rounded-lg">
                  <Shield className="h-4 w-4 text-emerald-500" />
                </div>
                Account Information
              </CardTitle>
              <CardDescription>Your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-muted-foreground">Account Created</Label>
                  <p className="font-medium">
                    {user?.created_at
                      ? new Date(user.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Account Status</Label>
                  <p className="font-medium">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs ${user?.is_active !== false ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'
                      }`}>
                      {user?.is_active !== false ? 'Active' : 'Inactive'}
                    </span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
