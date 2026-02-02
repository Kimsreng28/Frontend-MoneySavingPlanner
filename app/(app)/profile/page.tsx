'use client';

import { Header } from "@/components/dashboard/header";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
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
import { Calendar, Mail, Shield, User, Globe, DollarSign, TrendingUp, CreditCard, Upload, X, Camera } from "lucide-react";
import { format } from "date-fns";
import { useState, useEffect, useRef, ChangeEvent } from "react";
import { useToast } from "@/hooks/use-toast";
import apiClient, { getAvatarUrl } from "@/api/api-client";

export default function ProfilePage() {
  const { user, refreshToken } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(null);
  const [profileData, setProfileData] = useState({
    email: user?.email || '',
    currency: 'USD',
    country: 'United States',
    monthlyIncome: 5000,
    riskLevel: 'medium' as 'low' | 'medium' | 'high',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

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
              currency: response.data.currency || 'USD',
              country: response.data.country || 'United States',
              monthlyIncome: response.data.monthlyIncome || 5000,
              riskLevel: response.data.riskLevel || 'medium'
            }));

            // If user has avatar, fetch it
            if (response.data.avatarUrl) {
              fetchAvatar();
            }
          }
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
        currency: profileData.currency,
        country: profileData.country,
        monthlyIncome: profileData.monthlyIncome,
        riskLevel: profileData.riskLevel,
      });

      // Update avatar URL using the helper
      if (response.data?.id) {
        setAvatarUrl(getAvatarUrl(response.data.id));
      }

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

      // Update avatar URL using the helper
      if (response.data?.id) {
        setAvatarUrl(getAvatarUrl(response.data.id));
      }

      // Update local storage
      const updatedUser = { ...user, ...response.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      // Refresh token to trigger re-render
      await refreshToken();

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

      // Clear avatar URL
      setAvatarUrl(null);

      // Update local storage
      const updatedUser = { ...user, avatarUrl: null };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      // Refresh token to trigger re-render
      await refreshToken();

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

  // Handle avatar image loading error
  const handleAvatarError = () => {
    console.log('Avatar failed to load, clearing URL');
    setAvatarUrl(null);
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
                        <Upload className="h-4 w-4 mr-2" />
                        {isUploading ? "Uploading..." : "Change Avatar"}
                      </Button>
                      {avatarUrl && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={handleRemoveAvatar}
                          disabled={isUploading}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      )}
                    </div>

                    <CardTitle className="text-xl mt-4">
                      {user.email?.split("@")[0] || "User"}
                    </CardTitle>
                    <CardDescription>{user.email}</CardDescription>
                    <Badge className="mt-2" variant="secondary">
                      <Shield className="mr-2 h-3 w-3" />
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
                          Active
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-50 rounded-md">
                          <DollarSign className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Total Savings</p>
                          <p className="text-2xl font-bold">$12,450</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-green-50 rounded-md">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Monthly Goal</p>
                          <p className="text-2xl font-bold">85%</p>
                        </div>
                      </div>
                    </div>
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
                    <TabsTrigger value="financial">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Financial
                    </TabsTrigger>
                    <TabsTrigger value="security">
                      <Shield className="mr-2 h-4 w-4" />
                      Security
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
                                disabled={true} // Email cannot be changed
                                className="bg-muted"
                              />
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Email address cannot be changed
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

                  {/* Security Tab */}
                  <TabsContent value="security" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Security Settings</CardTitle>
                        <CardDescription>
                          Manage your account security and privacy
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Two-Factor Authentication</p>
                              <p className="text-sm text-muted-foreground">
                                Add an extra layer of security to your account
                              </p>
                            </div>
                            <Button variant="outline" size="sm">
                              Enable
                            </Button>
                          </div>
                          <Separator />
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Change Password</p>
                              <p className="text-sm text-muted-foreground">
                                Update your password regularly
                              </p>
                            </div>
                            <Button variant="outline" size="sm">
                              Change
                            </Button>
                          </div>
                          <Separator />
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Active Sessions</p>
                              <p className="text-sm text-muted-foreground">
                                Manage your active login sessions
                              </p>
                            </div>
                            <Button variant="outline" size="sm">
                              View All
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-destructive/20 bg-destructive/5">
                      <CardHeader>
                        <CardTitle className="text-destructive">Danger Zone</CardTitle>
                        <CardDescription>
                          Irreversible and destructive actions
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Delete Account</p>
                              <p className="text-sm text-muted-foreground">
                                Permanently delete your account and all data
                              </p>
                            </div>
                            <Button variant="destructive" size="sm">
                              Delete Account
                            </Button>
                          </div>
                        </div>
                      </CardContent>
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