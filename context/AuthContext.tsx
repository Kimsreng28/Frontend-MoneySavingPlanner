'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, LoginCredentials, SignupCredentials, AuthResponse } from '@/api/auth';

interface AuthUser {
    id: string;
    email: string;
    username: string;
    role: string;
    isVerified: boolean;
    avatarUrl?: string;
    createdAt?: string;
    isTwoFactorEnabled?: boolean;
}

interface AuthContextType {
    user: AuthUser | null;
    isLoading: boolean;
    login: (credentials: LoginCredentials) => Promise<AuthResponse>;
    signup: (credentials: SignupCredentials) => Promise<{ message: string; user: any }>;
    verifyEmail: (token: string) => Promise<{ message: string }>;
    resendVerificationEmail: (email: string) => Promise<{ message: string }>;
    forgotPassword: (email: string) => Promise<{ message: string }>;
    resetPassword: (token: string, newPassword: string, confirmPassword: string) => Promise<{ message: string }>;
    logout: () => Promise<void>;
    refreshToken: () => Promise<void>;
    updateUser: (userData: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

// Helper functions for cookies
const setCookie = (name: string, value: string, days: number) => {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value}; ${expires}; path=/; SameSite=Lax`;
};

const getCookie = (name: string): string | null => {
    if (typeof document === 'undefined') return null;

    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
};

const deleteCookie = (name: string) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initAuth = () => {
            if (typeof window !== 'undefined') {
                const storedUser = localStorage.getItem('user');
                const cookieToken = getCookie('access_token');

                if (storedUser && cookieToken) {
                    try {
                        const parsedUser = JSON.parse(storedUser);
                        setUser(parsedUser);
                    } catch (error) {
                        console.error('AuthProvider: Error parsing stored user:', error);
                        localStorage.removeItem('user');
                    }
                } else if (!cookieToken) {
                    setUser(null);
                    localStorage.removeItem('user');
                }
            }
            setIsLoading(false);
        };

        initAuth();
    }, []);

    const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
        setIsLoading(true);
        try {
            const response = await authService.login(credentials);

            if (response.user) {
                // Store tokens and user data
                localStorage.setItem('access_token', response.accessToken);
                localStorage.setItem('refresh_token', response.refreshToken);
                localStorage.setItem('user_id', response.user.id);
                localStorage.setItem('user', JSON.stringify(response.user));

                // Set cookies for middleware
                setCookie('access_token', response.accessToken, 1);
                setCookie('refresh_token', response.refreshToken, 7);

                setUser(response.user);
            }

            return response;
        } catch (error: any) {
            console.error('AuthProvider: Login error:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const signup = async (credentials: SignupCredentials) => {
        setIsLoading(true);
        try {
            const result = await authService.signup(credentials);

            // Store email for verification page
            localStorage.setItem('pending_verification_email', credentials.email);

            return result;
        } catch (error: any) {
            console.error('AuthProvider: Signup error:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const verifyEmail = async (token: string) => {
        try {
            return await authService.verifyEmail(token);
        } catch (error: any) {
            console.error('AuthProvider: Verify email error:', error);
            throw error;
        }
    };

    const resendVerificationEmail = async (email: string) => {
        try {
            return await authService.resendVerificationEmail(email);
        } catch (error: any) {
            console.error('AuthProvider: Resend verification email error:', error);
            throw error;
        }
    };

    const forgotPassword = async (email: string) => {
        try {
            return await authService.forgotPassword(email);
        } catch (error: any) {
            console.error('AuthProvider: Forgot password error:', error);
            throw error;
        }
    };

    const resetPassword = async (token: string, newPassword: string, confirmPassword: string) => {
        try {
            return await authService.resetPassword(token, newPassword, confirmPassword);
        } catch (error: any) {
            console.error('AuthProvider: Reset password error:', error);
            throw error;
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            const userId = localStorage.getItem('user_id');
            if (userId) {
                await authService.logout(userId);
            }
        } catch (error) {
            console.error('AuthProvider: Logout error:', error);
        } finally {
            // Clear all storage
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user_id');
            localStorage.removeItem('user');
            localStorage.removeItem('pending_verification_email');

            // Clear cookies
            deleteCookie('access_token');
            deleteCookie('refresh_token');

            setUser(null);
            setIsLoading(false);

            // Redirect to login
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
        }
    };

    const refreshToken = async () => {
        try {
            const userId = localStorage.getItem('user_id');
            const refreshToken = localStorage.getItem('refresh_token');

            if (userId && refreshToken) {
                const response = await authService.refreshToken(userId, refreshToken);
                localStorage.setItem('access_token', response.accessToken);
                setCookie('access_token', response.accessToken, 1);
            }
        } catch (error) {
            console.error('AuthProvider: Token refresh failed:', error);
            logout();
        }
    };

    const updateUser = (userData: Partial<AuthUser>) => {
        if (user) {
            const updatedUser = { ...user, ...userData };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            isLoading,
            login,
            signup,
            verifyEmail,
            resendVerificationEmail,
            forgotPassword,
            resetPassword,
            logout,
            refreshToken,
            updateUser
        }}>
            {children}
        </AuthContext.Provider>
    );
};