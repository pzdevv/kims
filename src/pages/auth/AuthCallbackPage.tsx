import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AuthCallbackPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Setting up your account...');

    useEffect(() => {
        const handleAuthCallback = async () => {
            try {
                // Wait for Supabase to process the auth callback
                await new Promise(resolve => setTimeout(resolve, 500));

                // Check URL hash for tokens (confirmation/magic link flow)
                const hashParams = new URLSearchParams(window.location.hash.substring(1));
                const accessToken = hashParams.get('access_token');
                const type = hashParams.get('type');

                if (accessToken) {
                    // Set the session from URL tokens
                    const { error } = await supabase.auth.setSession({
                        access_token: accessToken,
                        refresh_token: hashParams.get('refresh_token') || '',
                    });

                    if (error) throw error;
                }

                // Get current session
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) throw sessionError;

                if (session?.user) {
                    // Check if this is a new user who needs to set password
                    // New users coming from signup confirmation have type 'signup'
                    const isNewUser = type === 'signup' || type === 'invite';

                    if (isNewUser) {
                        // Redirect to set password page
                        setStatus('success');
                        setMessage('Please set your password...');
                        setTimeout(() => navigate('/auth/set-password'), 500);
                    } else {
                        // Existing user, go to dashboard
                        setStatus('success');
                        setMessage('Welcome back! Redirecting to dashboard...');
                        setTimeout(() => navigate('/dashboard'), 1000);
                    }
                } else {
                    throw new Error('Authentication failed. Please try again.');
                }
            } catch (error: any) {
                console.error('Auth callback error:', error);
                setStatus('error');
                setMessage(error.message || 'Failed to complete login. Please try again.');
            }
        };

        handleAuthCallback();
    }, [navigate, searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4">
                        {status === 'loading' && (
                            <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        )}
                        {status === 'success' && (
                            <CheckCircle className="h-12 w-12 text-green-500" />
                        )}
                        {status === 'error' && (
                            <XCircle className="h-12 w-12 text-red-500" />
                        )}
                    </div>
                    <CardTitle>
                        {status === 'loading' && 'Setting Up Your Account'}
                        {status === 'success' && 'Welcome to KIMS!'}
                        {status === 'error' && 'Login Failed'}
                    </CardTitle>
                    <CardDescription>{message}</CardDescription>
                </CardHeader>
                {status === 'error' && (
                    <CardContent className="text-center space-y-2">
                        <Button onClick={() => navigate('/auth/login')}>
                            Go to Login
                        </Button>
                    </CardContent>
                )}
            </Card>
        </div>
    );
}
