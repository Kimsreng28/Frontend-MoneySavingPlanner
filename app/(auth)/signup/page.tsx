'use client';

import { SignupForm } from '@/components/signup-form';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Command } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSignup = async (data: {
    email: string;
    password: string;
    username?: string;
    confirmPassword?: string;
  }) => {
    setLoading(true);
    try {
      const result = await signup({
        email: data.email,
        password: data.password,
        username: data.username || '',
      });

      toast({
        title: 'Success!',
        description: result.message || 'Registration successful! Please check your email.',
      });

      // Redirect to verification page
      router.push('/verify-email');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Signup failed. Please try again.',
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
          <div className="w-full max-w-xs">
            <SignupForm onSubmit={handleSignup} loading={loading} />
          </div>
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