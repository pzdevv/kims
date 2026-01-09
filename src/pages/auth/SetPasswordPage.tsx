import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { Loader2, UserPlus, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const setupSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

export default function SetPasswordPage() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [userEmail, setUserEmail] = useState('');

    const form = useForm({
        resolver: zodResolver(setupSchema),
        defaultValues: {
            name: '',
            password: '',
            confirmPassword: '',
        },
    });

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserEmail(user.email || '');
            } else {
                navigate('/auth/login');
            }
        };
        checkAuth();
    }, [navigate]);

    const handleSubmit = async (data: z.infer<typeof setupSchema>) => {
        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            // Update password
            const { error: passwordError } = await supabase.auth.updateUser({
                password: data.password,
                data: { name: data.name }
            });

            if (passwordError) throw passwordError;

            // Update profile with name
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ name: data.name } as any)
                .eq('id', user.id);

            if (profileError) {
                console.error('Profile update error:', profileError);
            }

            setIsSuccess(true);
            toast({
                title: 'Account Setup Complete!',
                description: 'Redirecting to dashboard...',
            });

            setTimeout(() => {
                navigate('/dashboard');
            }, 1500);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to complete setup',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                        <CardTitle>Account Setup Complete!</CardTitle>
                        <CardDescription>Redirecting to dashboard...</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <UserPlus className="h-12 w-12 text-primary mx-auto mb-4" />
                    <CardTitle>Complete Your Account</CardTitle>
                    <CardDescription>
                        {userEmail && `Welcome! Set up your account for ${userEmail}`}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name *</Label>
                            <Input
                                id="name"
                                placeholder="Enter your full name"
                                {...form.register('name')}
                            />
                            {form.formState.errors.name && (
                                <p className="text-sm text-destructive">
                                    {form.formState.errors.name.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password *</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Create a password (min 8 characters)"
                                {...form.register('password')}
                            />
                            {form.formState.errors.password && (
                                <p className="text-sm text-destructive">
                                    {form.formState.errors.password.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password *</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="Confirm your password"
                                {...form.register('confirmPassword')}
                            />
                            {form.formState.errors.confirmPassword && (
                                <p className="text-sm text-destructive">
                                    {form.formState.errors.confirmPassword.message}
                                </p>
                            )}
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <UserPlus className="mr-2 h-4 w-4" />
                            )}
                            Complete Setup
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
