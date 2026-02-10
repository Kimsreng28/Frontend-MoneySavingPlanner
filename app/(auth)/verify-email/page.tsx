'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, RefreshCw, Mail, ArrowLeft, Command } from 'lucide-react';
import Link from 'next/link';

export default function VerifyEmailPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const { verifyEmail, resendVerificationEmail } = useAuth();
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (token) {
            verifyEmailHandler();
        }
    }, [token]);

    const verifyEmailHandler = async () => {
        if (!token) return;

        setLoading(true);
        setStatus('verifying');

        try {
            const result = await verifyEmail(token);
            setStatus('success');
            setMessage(result.message);
            toast({
                title: 'Success!',
                description: result.message,
            });
        } catch (error: any) {
            setStatus('error');
            setMessage(error.message || 'Verification failed. Please try again.');
            toast({
                title: 'Error',
                description: error.message || 'Verification failed.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        const email = localStorage.getItem('pending_verification_email');
        if (!email) {
            setMessage('No email found. Please sign up again.');
            toast({
                title: 'Error',
                description: 'No email found. Please sign up again.',
                variant: 'destructive',
            });
            return;
        }

        setLoading(true);
        try {
            await resendVerificationEmail(email);
            setMessage('Verification email sent successfully!');
            toast({
                title: 'Success!',
                description: 'Verification email sent successfully!',
            });
        } catch (error: any) {
            setMessage(error.message || 'Failed to resend verification email.');
            toast({
                title: 'Error',
                description: error.message || 'Failed to resend verification email.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            <div className="flex flex-col gap-4 p-6 md:p-10">
                <div className="flex justify-center gap-2 md:justify-start">
                    <Link href="/" className="flex items-center gap-2 font-medium">
                        <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                            <Command className="size-4" />
                        </div>
                        Save Wise
                    </Link>
                </div>
                <div className="flex flex-1 items-center justify-center">
                    <Card className="w-full max-w-md">
                        <CardHeader className="text-center">
                            <CardTitle className="text-2xl font-bold">
                                {status === 'verifying' ? 'Verifying Email' : 'Email Verification'}
                            </CardTitle>
                            <CardDescription className="text-muted-foreground">
                                {status === 'verifying'
                                    ? 'Please wait while we verify your email...'
                                    : status === 'success'
                                        ? 'Your email has been verified successfully!'
                                        : status === 'error'
                                            ? 'There was an issue verifying your email'
                                            : 'Complete your account setup'}
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            {!token ? (
                                <>
                                    <div className="space-y-3">
                                        <p className="text-sm text-muted-foreground text-center">
                                            A verification link has been sent to your email address.
                                            Please check your inbox and click the link to verify your account.
                                        </p>
                                        <div className="bg-muted/50 p-4 rounded-lg border border-border">
                                            <ul className="text-sm text-muted-foreground space-y-2">
                                                <li className="flex items-center gap-2">
                                                    <div className="h-2 w-2 rounded-full bg-primary" />
                                                    Check your spam/junk folder if you don't see the email
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <div className="h-2 w-2 rounded-full bg-primary" />
                                                    The verification link expires in 24 hours
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <div className="h-2 w-2 rounded-full bg-primary" />
                                                    You need to verify your email before logging in
                                                </li>
                                            </ul>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handleResend}
                                        disabled={loading}
                                        className="w-full"
                                        size="lg"
                                    >
                                        {loading ? (
                                            <>
                                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Mail className="mr-2 h-4 w-4" />
                                                Resend Verification Email
                                            </>
                                        )}
                                    </Button>
                                </>
                            ) : (
                                <>
                                    {status === 'verifying' && (
                                        <div className="text-center space-y-4">
                                            <div className="mx-auto w-24 h-24 relative">
                                                <div className="absolute inset-0 rounded-full border-4 border-border animate-pulse" />
                                                <div className="absolute inset-4 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                                            </div>
                                            <p className="text-lg font-medium">Verifying your email...</p>
                                            <p className="text-sm text-muted-foreground">
                                                This should only take a moment
                                            </p>
                                        </div>
                                    )}

                                    {status === 'success' && (
                                        <div className="text-center space-y-6">
                                            <div className="mx-auto w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                                <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="text-xl font-semibold text-green-600 dark:text-green-400">
                                                    Email Verified!
                                                </h3>
                                                <p className="text-muted-foreground">
                                                    {message}
                                                </p>
                                            </div>
                                            <Button
                                                onClick={() => router.push('/login')}
                                                className="w-full"
                                                size="lg"
                                            >
                                                Go to Login
                                            </Button>
                                        </div>
                                    )}

                                    {status === 'error' && (
                                        <div className="text-center space-y-6">
                                            <div className="mx-auto w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                                <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="text-xl font-semibold text-red-600 dark:text-red-400">
                                                    Verification Failed
                                                </h3>
                                                <p className="text-muted-foreground">
                                                    {message}
                                                </p>
                                            </div>
                                            <div className="space-y-3">
                                                <Button
                                                    onClick={handleResend}
                                                    className="w-full"
                                                    size="lg"
                                                    variant="default"
                                                >
                                                    <Mail className="mr-2 h-4 w-4" />
                                                    Resend Verification Email
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => router.push('/signup')}
                                                    className="w-full"
                                                >
                                                    Sign Up Again
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            <div className="pt-4 border-t border-border">
                                <Button
                                    variant="ghost"
                                    onClick={() => router.push('/login')}
                                    className="w-full"
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to Login
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
            <div className="bg-muted relative hidden lg:block">
                <img
                    src="/images/wallet.png"
                    alt="Image"
                    className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                />
            </div>
        </div>
    );
}