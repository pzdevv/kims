import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { isValidKavyaEmail } from '@/types/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

const forgotPasswordSchema = z.object({
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Please enter a valid email')
        .refine(
            (email) => isValidKavyaEmail(email),
            'Only @kavyaschool.edu.np emails are allowed'
        ),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const { toast } = useToast();

    const {
        register,
        handleSubmit,
        formState: { errors },
        getValues,
    } = useForm<ForgotPasswordFormValues>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: '',
        },
    });

    const onSubmit = async (data: ForgotPasswordFormValues) => {
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
                redirectTo: `${window.location.origin}/auth/set-password`,
            });

            if (error) throw error;

            setEmailSent(true);
            toast({
                title: 'Reset Email Sent',
                description: 'Check your inbox for the password reset link.',
            });
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to send reset email. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden px-4">
            {/* Subtle gradient orbs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/15 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

            <div className="w-full max-w-md z-10 animate-fade-in">
                {/* Back link */}
                <Link
                    to="/auth/login"
                    className="inline-flex items-center text-slate-400 hover:text-white transition-colors mb-6"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to login
                </Link>

                <Card className="bg-slate-900/80 backdrop-blur-xl border-slate-700/50 shadow-2xl">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-primary/20 flex items-center justify-center">
                            {emailSent ? (
                                <CheckCircle className="h-7 w-7 text-primary" />
                            ) : (
                                <Mail className="h-7 w-7 text-primary" />
                            )}
                        </div>
                        <CardTitle className="text-2xl font-bold text-white">
                            {emailSent ? 'Check Your Email' : 'Forgot Password?'}
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                            {emailSent
                                ? `We've sent a password reset link to ${getValues('email')}`
                                : "No worries! Enter your email and we'll send you reset instructions."
                            }
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {emailSent ? (
                            <div className="space-y-4">
                                <div className="p-4 bg-primary/10 rounded-xl border border-primary/20">
                                    <p className="text-sm text-slate-300">
                                        Didn't receive the email? Check your spam folder or make sure you entered the correct email address.
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    className="w-full bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:text-white"
                                    onClick={() => setEmailSent(false)}
                                >
                                    Try another email
                                </Button>
                                <Button className="w-full" asChild>
                                    <Link to="/auth/login">Return to login</Link>
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-slate-300">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="your.name@kavyaschool.edu.np"
                                        {...register('email')}
                                        className={`bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500 focus-visible:ring-primary ${errors.email ? 'border-destructive' : ''
                                            }`}
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-destructive">{errors.email.message}</p>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Mail className="mr-2 h-4 w-4" />
                                            Send Reset Link
                                        </>
                                    )}
                                </Button>
                            </form>
                        )}
                    </CardContent>
                </Card>

                {/* Footer */}
                <p className="text-slate-600 text-xs uppercase tracking-widest text-center mt-8">
                    Kavya School · Inventory Portal
                </p>
            </div>
        </div>
    );
}
