'use client';

import { Header } from "@/components/dashboard/header";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Calendar, Mail, Shield, User, Globe, DollarSign, TrendingUp,
  CreditCard, Upload, X, Camera, UserIcon, Key, Smartphone,
  Monitor, LogOut, Check, Eye, EyeOff, QrCode, Copy, CheckCircle,
  AlertCircle, Loader2,
  BadgeCheck, PiggyBank, Target, Award
} from "lucide-react";
import { format } from "date-fns";
import { useState, useEffect, useRef, ChangeEvent } from "react";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/api/api-client";
import { dashboardService } from "@/types/dashboard";
import { goalService } from "@/api/goals";
import { taskService } from "@/api/tasks";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { TwoFactorSetup } from "@/types/two-factore";
import { Session } from "@/types/session";
import { formatCurrency } from "@/lib/utils";

export default function ProfilePage() {
  const { user, refreshToken, logout } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(null);

  // Real data states
  const [totalSavings, setTotalSavings] = useState(0);
  const [monthlyGoalProgress, setMonthlyGoalProgress] = useState(0);
  const [activeGoalsCount, setActiveGoalsCount] = useState(0);
  const [completedGoalsCount, setCompletedGoalsCount] = useState(0);
  const [pendingTasksCount, setPendingTasksCount] = useState(0);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  const [profileData, setProfileData] = useState({
    email: user?.email || '',
    username: user?.username || '',
    currency: 'USD',
    country: 'United States',
    monthlyIncome: 5000,
    riskLevel: 'medium' as 'low' | 'medium' | 'high',
    createdAt: user?.createdAt || '',
  });

  // Change password states
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Two-factor authentication states
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
  const [twoFactorSetup, setTwoFactorSetup] = useState<TwoFactorSetup | null>(null);
  const [twoFactorToken, setTwoFactorToken] = useState('');
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(false);
  const [isSettingUp2FA, setIsSettingUp2FA] = useState(false);
  const [isVerifying2FA, setIsVerifying2FA] = useState(false);
  const [showDisable2FA, setShowDisable2FA] = useState(false);
  const [disable2FAToken, setDisable2FAToken] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  // Active sessions states
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [revokeSessionId, setRevokeSessionId] = useState<string | null>(null);
  const [showRevokeAll, setShowRevokeAll] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch real savings data
  const fetchSavingsData = async () => {
    try {
      setIsLoadingStats(true);

      // Get dashboard data for total savings
      const dashboardData = await dashboardService.getDashboardData();
      setTotalSavings(dashboardData.summary.financial.totalSaved);

      // Get goals data
      const goalsData = await goalService.getAllGoals();
      const activeGoals = goalsData.filter(g => !g.isCompleted).length;
      const completedGoals = goalsData.filter(g => g.isCompleted).length;
      setActiveGoalsCount(activeGoals);
      setCompletedGoalsCount(completedGoals);

      // Calculate monthly goal progress (overall progress from dashboard)
      setMonthlyGoalProgress(dashboardData.summary.goals.overallProgress);

      // Get tasks data
      const tasksData = await taskService.getAllTasks();
      const pendingTasks = tasksData.filter(t => !t.isCompleted).length;
      setPendingTasksCount(pendingTasks);

    } catch (error: any) {
      console.error('Failed to fetch savings data:', error);

      // Fallback to goals data if dashboard fails
      try {
        const goalsData = await goalService.getAllGoals();
        const totalSaved = goalsData.reduce((sum, goal) => sum + Number(goal.currentAmount), 0);
        const totalTarget = goalsData.reduce((sum, goal) => sum + Number(goal.targetAmount), 0);
        const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

        setTotalSavings(totalSaved);
        setMonthlyGoalProgress(overallProgress);
        setActiveGoalsCount(goalsData.filter(g => !g.isCompleted).length);
        setCompletedGoalsCount(goalsData.filter(g => g.isCompleted).length);
      } catch (goalsError) {
        console.error('Failed to fetch goals data:', goalsError);
        // Set default values if both fail
        setTotalSavings(0);
        setMonthlyGoalProgress(0);
      }
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Fetch user profile data including avatar
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        if (user?.id) {
          // Fetch user profile to get updated data
          const response = await apiClient.get(`/users/profile`);
          if (response.data) {
            setProfileData(prev => ({
              ...prev,
              email: response.data.email,
              username: response.data.username || '',
              currency: response.data.currency || 'USD',
              country: response.data.country || 'United States',
              monthlyIncome: response.data.monthlyIncome || 5000,
              riskLevel: response.data.riskLevel || 'medium',
              createdAt: response.data.createdAt || prev.createdAt,
            }));

            // Check 2FA status
            setIsTwoFactorEnabled(response.data.isTwoFactorEnabled || false);

            // If user has avatar, fetch it
            if (response.data.avatarUrl) {
              fetchAvatar();
            }
          }

          // Fetch savings data
          await fetchSavingsData();
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
      }
    };

    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  // Function to fetch avatar as blob
  const fetchAvatar = async () => {
    try {
      const response = await apiClient.get(`/users/avatar/${user?.id}`, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const dataUrl = URL.createObjectURL(blob);
      setAvatarDataUrl(dataUrl);
    } catch (error: any) {
      console.error('Failed to load avatar:', error);
      if (error.response?.status === 404) {
        // Avatar not found, clear the data URL
        setAvatarDataUrl(null);
      }
    }
  };

  // Load active sessions
  const loadActiveSessions = async () => {
    try {
      setIsLoadingSessions(true);
      const response = await apiClient.get('/users/sessions');
      setSessions(response.data);
    } catch (error: any) {
      console.error('Failed to load sessions:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load active sessions",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSessions(false);
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (avatarDataUrl) {
        URL.revokeObjectURL(avatarDataUrl);
      }
    };
  }, [avatarDataUrl]);

  const getInitials = (email: string) => {
    if (!email) return 'US';
    const parts = email.split("@")[0];
    if (parts.includes(".")) {
      return parts
        .split(".")
        .map((part) => part.charAt(0))
        .join("")
        .toUpperCase()
        .substring(0, 2);
    }
    return parts.substring(0, 2).toUpperCase();
  };

  const handleSave = async () => {
    try {
      const response = await apiClient.put('/users/profile', {
        username: profileData.username,
        currency: profileData.currency,
        country: profileData.country,
        monthlyIncome: profileData.monthlyIncome,
        riskLevel: profileData.riskLevel,
      });

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.response?.data?.message || "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  const handleChangePassword = async () => {
    // Validation
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      await apiClient.post('/users/change-password', {
        currentPassword,
        newPassword,
        confirmPassword,
      });

      toast({
        title: "Success",
        description: "Password changed successfully",
      });

      // Reset form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowChangePassword(false);

      // Logout user to apply new password
      toast({
        title: "Please Re-login",
        description: "Please login again with your new password",
      });
      setTimeout(() => {
        logout();
      }, 2000);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to change password",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSetupTwoFactor = async () => {
    setIsSettingUp2FA(true);
    try {
      const response = await apiClient.post('/users/two-factor/setup');
      setTwoFactorSetup(response.data);
      setShowTwoFactorSetup(true);

      // Generate backup codes
      const codes = Array.from({ length: 10 }, () =>
        Math.random().toString(36).substring(2, 8).toUpperCase()
      );
      setBackupCodes(codes);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to setup two-factor authentication",
        variant: "destructive",
      });
    } finally {
      setIsSettingUp2FA(false);
    }
  };

  const handleVerifyTwoFactor = async () => {
    if (!twoFactorToken) {
      toast({
        title: "Error",
        description: "Please enter the verification code",
        variant: "destructive",
      });
      return;
    }

    if (twoFactorToken.length !== 6) {
      toast({
        title: "Error",
        description: "Verification code must be 6 digits",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying2FA(true);
    try {
      await apiClient.post('/users/two-factor/verify', { token: twoFactorToken });

      // Fetch updated profile to get 2FA status
      const profileResponse = await apiClient.get('/users/profile');
      setIsTwoFactorEnabled(profileResponse.data.isTwoFactorEnabled || true);

      setShowTwoFactorSetup(false);
      setTwoFactorSetup(null);
      setTwoFactorToken('');
      setShowBackupCodes(true);

      toast({
        title: "Success",
        description: "Two-factor authentication enabled successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Invalid verification code",
        variant: "destructive",
      });
    } finally {
      setIsVerifying2FA(false);
    }
  };

  const handleDisableTwoFactor = async () => {
    if (!disable2FAToken) {
      toast({
        title: "Error",
        description: "Please enter the verification code",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiClient.post('/users/two-factor/disable', { token: disable2FAToken });
      setIsTwoFactorEnabled(false);
      setShowDisable2FA(false);
      setDisable2FAToken('');

      toast({
        title: "Success",
        description: "Two-factor authentication disabled successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Invalid verification code",
        variant: "destructive",
      });
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await apiClient.delete(`/users/sessions/${sessionId}`);
      await loadActiveSessions();
      toast({
        title: "Success",
        description: "Session revoked successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to revoke session",
        variant: "destructive",
      });
    }
  };

  const handleRevokeAllSessions = async () => {
    try {
      await apiClient.delete('/users/sessions');
      await loadActiveSessions();
      setShowRevokeAll(false);

      // Logout current session
      toast({
        title: "All Sessions Revoked",
        description: "Please login again",
      });
      setTimeout(() => {
        logout();
      }, 2000);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to revoke sessions",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Copied to clipboard",
    });
  };

  const copyBackupCodes = () => {
    const codesText = backupCodes.join('\n');
    navigator.clipboard.writeText(codesText);
    toast({
      title: "Copied",
      description: "All backup codes copied to clipboard",
    });
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file (JPG, PNG, GIF, etc.)",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await apiClient.post('/users/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Fetch new avatar after upload
      await fetchAvatar();

      // Update local storage
      if (user) {
        const updatedUser = {
          ...user,
          avatarUrl: response.data?.avatarUrl || null
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      toast({
        title: "Avatar Updated",
        description: "Your profile picture has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.response?.data?.message || "Failed to upload avatar",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      await apiClient.delete('/users/avatar');

      // Clear avatar data URL
      setAvatarDataUrl(null);

      // Update local storage
      if (user) {
        const updatedUser = { ...user, avatarUrl: null };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      toast({
        title: "Avatar Removed",
        description: "Your profile picture has been removed.",
      });
    } catch (error: any) {
      toast({
        title: "Remove Failed",
        description: error.response?.data?.message || "Failed to remove avatar",
        variant: "destructive",
      });
    }
  };

  // Show loading or return null if user is not available
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <Header title="Profile" subtitle="Manage your account settings" />
          <div className="flex flex-1 flex-col gap-6 p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - User Info */}
              <div className="lg:col-span-1 space-y-6">
                <Card>
                  <CardHeader className="text-center">
                    <div className="flex justify-center mb-4 relative group">
                      <Avatar className="h-24 w-24 cursor-pointer" onClick={handleAvatarClick}>
                        {avatarDataUrl ? (
                          <AvatarImage src={avatarDataUrl} alt={user.email} />
                        ) : (
                          <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
                        )}
                        <AvatarFallback className="text-lg bg-primary/10 text-primary">
                          {getInitials(user.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <Camera className="h-8 w-8 text-white" />
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>

                    <div className="flex justify-center gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleAvatarClick}
                        disabled={isUploading}
                      >
                        <Upload className="h-4 w-4" />
                        {isUploading ? "Uploading..." : "Change Avatar"}
                      </Button>
                      {avatarDataUrl && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={handleRemoveAvatar}
                          disabled={isUploading}
                        >
                          <X className="h-4 w-4" />
                          Remove
                        </Button>
                      )}
                    </div>

                    <CardTitle className="text-xl mt-4">
                      {user.username}
                    </CardTitle>
                    <CardDescription>{user.email}</CardDescription>
                    <Badge className="mt-2" variant="secondary">
                      <User className="h-3 w-3" />
                      {user.role?.charAt(0).toUpperCase() + user.role?.slice(1) || "User"}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Member Since</span>
                        <span className="text-sm text-muted-foreground">
                          {user.createdAt ? format(new Date(user.createdAt), "MMM yyyy") : "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Status</span>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <CheckCircle className="h-3 w-3" />
                          Active
                        </Badge>
                      </div>
                      {isTwoFactorEnabled && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">2FA</span>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex-inline">
                            <BadgeCheck className="h-4 w-4" />
                            Enabled
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Quick Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {isLoadingStats ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : (
                      <>
                        {/* Total Savings */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                              <PiggyBank className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">Total Savings</p>
                              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {formatCurrency(totalSavings)}
                              </p>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* Monthly Goal Progress */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg">
                              <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">Overall Progress</p>
                              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {Math.round(monthlyGoalProgress)}%
                              </p>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* Goals Stats */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 bg-muted/50 rounded-lg">
                            <p className="text-xs text-muted-foreground">Active Goals</p>
                            <p className="text-xl font-bold">{activeGoalsCount}</p>
                          </div>
                          <div className="text-center p-3 bg-muted/50 rounded-lg">
                            <p className="text-xs text-muted-foreground">Completed</p>
                            <p className="text-xl font-bold">{completedGoalsCount}</p>
                          </div>
                        </div>

                        {/* Tasks Stats */}
                        <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-amber-100 dark:bg-amber-800 rounded-full">
                              <Calendar className="h-4 w-4 text-amber-600 dark:text-amber-300" />
                            </div>
                            <div>
                              <p className="text-xs text-amber-700 dark:text-amber-300">Pending Tasks</p>
                              <p className="text-lg font-bold text-amber-700 dark:text-amber-300">
                                {pendingTasksCount}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="link"
                            size="sm"
                            className="text-amber-700 dark:text-amber-300"
                            onClick={() => window.location.href = '/tasks'}
                          >
                            View Tasks
                          </Button>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Profile Details */}
              <div className="lg:col-span-2 space-y-6">
                <Tabs defaultValue="personal" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="personal">
                      <User className="mr-2 h-4 w-4" />
                      Personal
                    </TabsTrigger>
                    <TabsTrigger value="security" onClick={loadActiveSessions}>
                      <Shield className="mr-2 h-4 w-4" />
                      Security
                    </TabsTrigger>
                    <TabsTrigger value="financial">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Financial
                    </TabsTrigger>
                  </TabsList>

                  {/* Personal Information Tab */}
                  <TabsContent value="personal" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>
                          Update your personal details and contact information
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <Input
                                id="email"
                                value={profileData.email}
                                disabled={true}
                                className="bg-muted"
                              />
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Email address cannot be changed
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <div className="flex items-center gap-2">
                              <UserIcon className="h-4 w-4 text-muted-foreground" />
                              <Input
                                id="username"
                                value={profileData.username}
                                disabled={!isEditing}
                                onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                              />
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Your unique username
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="country">Country</Label>
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4 text-muted-foreground" />
                              <Input
                                id="country"
                                value={profileData.country}
                                disabled={!isEditing}
                                onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
                          {isEditing ? "Cancel" : "Edit Profile"}
                        </Button>
                        {isEditing && (
                          <Button onClick={handleSave}>Save Changes</Button>
                        )}
                      </CardFooter>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Account Preferences</CardTitle>
                        <CardDescription>
                          Manage your account preferences and notification settings
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Email Notifications</p>
                            <p className="text-sm text-muted-foreground">
                              Receive email updates about your savings
                            </p>
                          </div>
                          <div className="h-6 w-11 rounded-full bg-primary/20 flex items-center justify-end p-1">
                            <div className="h-4 w-4 rounded-full bg-primary"></div>
                          </div>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Weekly Reports</p>
                            <p className="text-sm text-muted-foreground">
                              Get weekly savings reports
                            </p>
                          </div>
                          <div className="h-6 w-11 rounded-full bg-muted flex items-center p-1">
                            <div className="h-4 w-4 rounded-full bg-muted-foreground"></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Security Tab */}
                  <TabsContent value="security" className="space-y-6">
                    {/* Change Password Card */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Change Password</CardTitle>
                        <CardDescription>
                          Update your password to keep your account secure
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Password Security</p>
                            <p className="text-sm text-muted-foreground">
                              Keep your password strong and unique
                            </p>
                          </div>
                          <Dialog open={showChangePassword} onOpenChange={setShowChangePassword}>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Key className="mr-2 h-4 w-4" />
                                Change Password
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                <DialogTitle>Change Password</DialogTitle>
                                <DialogDescription>
                                  Enter your current password and new password
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="current-password">Current Password</Label>
                                  <div className="relative">
                                    <Input
                                      id="current-password"
                                      type={showCurrentPassword ? "text" : "password"}
                                      value={currentPassword}
                                      onChange={(e) => setCurrentPassword(e.target.value)}
                                      disabled={isChangingPassword}
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    >
                                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="new-password">New Password</Label>
                                  <div className="relative">
                                    <Input
                                      id="new-password"
                                      type={showNewPassword ? "text" : "password"}
                                      value={newPassword}
                                      onChange={(e) => setNewPassword(e.target.value)}
                                      disabled={isChangingPassword}
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                                      onClick={() => setShowNewPassword(!showNewPassword)}
                                    >
                                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    Must be at least 8 characters long
                                  </p>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                                  <div className="relative">
                                    <Input
                                      id="confirm-password"
                                      type={showConfirmPassword ? "text" : "password"}
                                      value={confirmPassword}
                                      onChange={(e) => setConfirmPassword(e.target.value)}
                                      disabled={isChangingPassword}
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                  </div>
                                </div>
                              </div>
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => setShowChangePassword(false)}
                                  disabled={isChangingPassword}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={handleChangePassword}
                                  disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                                >
                                  {isChangingPassword ? "Changing..." : "Change Password"}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Two-Factor Authentication Card */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Two-Factor Authentication</CardTitle>
                        <CardDescription>
                          Add an extra layer of security to your account
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">2FA Status</p>
                            <p className="text-sm text-muted-foreground">
                              {isTwoFactorEnabled ? (
                                <span className="text-green-600 flex items-center gap-1">
                                  <BadgeCheck className="h-4 w-4" /> Enabled
                                </span>
                              ) : (
                                "Not enabled"
                              )}
                            </p>
                          </div>
                          {isTwoFactorEnabled ? (
                            <AlertDialog open={showDisable2FA} onOpenChange={setShowDisable2FA}>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  Disable 2FA
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Disable Two-Factor Authentication</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Enter the verification code from your authenticator app to disable 2FA.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="disable-2fa-token">Verification Code</Label>
                                    <Input
                                      id="disable-2fa-token"
                                      value={disable2FAToken}
                                      onChange={(e) => setDisable2FAToken(e.target.value)}
                                      placeholder="Enter 6-digit code"
                                      maxLength={6}
                                    />
                                  </div>
                                </div>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={handleDisableTwoFactor}>
                                    Disable 2FA
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleSetupTwoFactor}
                              disabled={isSettingUp2FA}
                            >
                              <Smartphone className="mr-2 h-4 w-4" />
                              {isSettingUp2FA ? "Setting up..." : "Enable 2FA"}
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Two-Factor Setup Dialog */}
                    <Dialog open={showTwoFactorSetup} onOpenChange={setShowTwoFactorSetup}>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Setup Two-Factor Authentication</DialogTitle>
                          <DialogDescription>
                            Scan the QR code with your authenticator app
                          </DialogDescription>
                        </DialogHeader>
                        {twoFactorSetup && (
                          <div className="space-y-4">
                            <div className="flex flex-col items-center space-y-4">
                              <img
                                src={twoFactorSetup.qrCodeUrl}
                                alt="QR Code"
                                className="h-48 w-48 border rounded-lg"
                              />
                              <div className="text-center space-y-2">
                                <p className="text-sm font-medium">Or enter this code manually:</p>
                                <div className="flex items-center justify-center gap-2">
                                  <code className="bg-muted px-3 py-1 rounded-md text-sm font-mono">
                                    {twoFactorSetup.secret}
                                  </code>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(twoFactorSetup.secret)}
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="2fa-token">Verification Code</Label>
                              <Input
                                id="2fa-token"
                                value={twoFactorToken}
                                onChange={(e) => setTwoFactorToken(e.target.value)}
                                placeholder="Enter 6-digit code"
                                maxLength={6}
                                className="text-center text-lg tracking-widest"
                              />
                            </div>
                          </div>
                        )}
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowTwoFactorSetup(false);
                              setTwoFactorSetup(null);
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleVerifyTwoFactor}
                            disabled={!twoFactorToken || twoFactorToken.length !== 6 || isVerifying2FA}
                          >
                            {isVerifying2FA ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {isVerifying2FA ? "Verifying..." : "Verify & Enable"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    {/* Backup Codes Dialog */}
                    <Dialog open={showBackupCodes} onOpenChange={setShowBackupCodes}>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Save Your Backup Codes</DialogTitle>
                          <DialogDescription>
                            Save these codes in a safe place. Each code can be used only once.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="bg-muted p-4 rounded-lg">
                            <div className="grid grid-cols-2 gap-2">
                              {backupCodes.map((code, index) => (
                                <div
                                  key={index}
                                  className="text-center font-mono text-sm p-2 bg-background rounded"
                                >
                                  {code}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <Button
                              variant="outline"
                              onClick={copyBackupCodes}
                              size="sm"
                            >
                              <Copy className="mr-2 h-4 w-4" />
                              Copy All
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                const text = backupCodes.join('\n');
                                const blob = new Blob([text], { type: 'text/plain' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = 'backup-codes.txt';
                                a.click();
                                URL.revokeObjectURL(url);
                              }}
                              size="sm"
                            >
                              Download
                            </Button>
                          </div>
                          <div className="flex items-start gap-2 text-sm text-yellow-600 bg-yellow-50 p-3 rounded-lg">
                            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <p>
                              These codes are only shown once. Store them securely!
                            </p>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button onClick={() => setShowBackupCodes(false)}>
                            I've Saved These Codes
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    {/* Active Sessions Card */}
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle>Active Sessions</CardTitle>
                            <CardDescription>
                              Manage your active login sessions
                            </CardDescription>
                          </div>
                          <AlertDialog open={showRevokeAll} onOpenChange={setShowRevokeAll}>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <LogOut className="mr-2 h-4 w-4" />
                                Revoke All
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Revoke All Sessions</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will log you out from all devices. You will need to login again.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleRevokeAllSessions}>
                                  Revoke All
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {isLoadingSessions ? (
                          <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          </div>
                        ) : sessions.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <Monitor className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No active sessions found</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {sessions.map((session) => (
                              <div
                                key={session.id}
                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-muted rounded-md">
                                    <Monitor className="h-4 w-4" />
                                  </div>
                                  <div>
                                    <p className="font-medium">{session.device}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {session.browser} • {session.location} •{" "}
                                      {format(new Date(session.lastActive), "MMM d, h:mm a")}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {session.current && (
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                      Current
                                    </Badge>
                                  )}
                                  {!session.current && (
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => setRevokeSessionId(session.id)}
                                        >
                                          Revoke
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Revoke Session</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            This will log out this device immediately.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => handleRevokeSession(session.id)}
                                          >
                                            Revoke
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Financial Information Tab */}
                  <TabsContent value="financial" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Financial Settings</CardTitle>
                        <CardDescription>
                          Configure your financial preferences and goals
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="currency">Currency</Label>
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              <Input
                                id="currency"
                                value={profileData.currency}
                                disabled={!isEditing}
                                onChange={(e) => setProfileData({ ...profileData, currency: e.target.value })}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="monthlyIncome">Monthly Income</Label>
                            <div className="flex items-center gap-2">
                              <Input
                                id="monthlyIncome"
                                type="number"
                                value={profileData.monthlyIncome}
                                disabled={!isEditing}
                                onChange={(e) => setProfileData({ ...profileData, monthlyIncome: Number(e.target.value) })}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Risk Tolerance</Label>
                          <div className="flex gap-2">
                            {(['low', 'medium', 'high'] as const).map((level) => (
                              <Button
                                key={level}
                                type="button"
                                variant={profileData.riskLevel === level ? "default" : "outline"}
                                size="sm"
                                onClick={() => isEditing && setProfileData({ ...profileData, riskLevel: level })}
                                disabled={!isEditing}
                                className="capitalize"
                              >
                                {level}
                              </Button>
                            ))}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {profileData.riskLevel === 'low' && 'Prefer stable, low-risk investments'}
                            {profileData.riskLevel === 'medium' && 'Balance between risk and return'}
                            {profileData.riskLevel === 'high' && 'Comfortable with high-risk, high-return investments'}
                          </p>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button onClick={handleSave} disabled={!isEditing}>
                          Save Financial Settings
                        </Button>
                      </CardFooter>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}