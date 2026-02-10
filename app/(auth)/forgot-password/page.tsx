'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Command } from 'lucide-react';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const { forgotPassword } = useAuth();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await forgotPassword(email);
            setSubmitted(true);
            toast({
                title: 'Email Sent',
                description: 'Check your email for password reset instructions.',
            });
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to send reset email.',
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
                            <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
                            <CardDescription>
                                {submitted
                                    ? 'Check your email'
                                    : 'Enter your email to receive reset instructions'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {submitted ? (
                                <div className="space-y-4 text-center">
                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                                        <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-600">
                                        If an account exists with the email <strong>{email}</strong>,
                                        you will receive password reset instructions shortly.
                                    </p>
                                    <div className="space-y-2">
                                        <Button
                                            onClick={() => router.push('/login')}
                                            className="w-full"
                                        >
                                            Back to Login
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => setSubmitted(false)}
                                            className="w-full"
                                        >
                                            Try Another Email
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="you@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={loading || !email}
                                        className="w-full"
                                    >
                                        {loading ? 'Sending...' : 'Send Reset Instructions'}
                                    </Button>
                                    <div className="text-center">
                                        <Button
                                            variant="link"
                                            onClick={() => router.push('/login')}
                                            className="text-sm"
                                        >
                                            Back to Login
                                        </Button>
                                    </div>
                                </form>
                            )}
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