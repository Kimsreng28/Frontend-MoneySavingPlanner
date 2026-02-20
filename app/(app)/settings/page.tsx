'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes'; // Add this import
import {
    Moon,
    Sun,
    Monitor,
    Globe,
    DollarSign,
    Calendar,
    Clock,
    Bell,
    Mail,
    Smartphone,
    Shield,
    Eye,
    EyeOff,
    Lock,
    User,
    Download,
    Upload,
    RotateCcw,
    AlertTriangle,
    Check,
    X,
    Save,
    Loader2,
    Palette,
    Volume2,
    VolumeX,
    Settings as SettingsIcon,
    ChevronRight,
    Users,
    Share2,
    BarChart,
    Zap,
    Heart,
    Star,
    Trash2,
    Award,
} from 'lucide-react';

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AppSidebar } from '@/components/app-sidebar';
import { Header } from '@/components/dashboard/header';
import { settingsService } from '@/api/settings';
import {
    UserSettings,
    ThemePreference,
    LanguagePreference,
    CurrencyDisplay,
    DateFormat,
    TimeFormat,
    NotificationSound,
} from '@/types/settings';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
    const router = useRouter();
    const { user, logout } = useAuth();
    const { toast } = useToast();
    const { theme, setTheme } = useTheme(); // Add this

    const [settings, setSettings] = useState<UserSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('appearance');
    const [showResetDialog, setShowResetDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showExportDialog, setShowExportDialog] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'pdf'>('json');
    const [exportDateRange, setExportDateRange] = useState<'all' | 'year' | 'month' | 'custom'>('all');
    const [exportCustomStart, setExportCustomStart] = useState('');
    const [exportCustomEnd, setExportCustomEnd] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    // Sync theme from settings to next-themes
    useEffect(() => {
        if (settings?.appearance?.themePreference) {
            setTheme(settings.appearance.themePreference);
        }
    }, [settings?.appearance?.themePreference, setTheme]);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const data = await settingsService.getSettings();
            setSettings(data);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to load settings',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleThemeChange = (value: ThemePreference) => {
        setSettings({
            ...settings!,
            appearance: { ...settings!.appearance, themePreference: value }
        });
        setTheme(value); // Immediately apply theme change
    };

    const handleSaveAppearance = async () => {
        if (!settings) return;
        setSaving(true);
        try {
            const updated = await settingsService.updateAppearance(settings.appearance);
            setSettings(prev => prev ? { ...prev, appearance: updated } : null);
            toast({
                title: 'Success',
                description: 'Appearance settings updated',
            });
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to update settings',
                variant: 'destructive',
            });
        } finally {
            setSaving(false);
        }
    };

    const handleSaveNotifications = async () => {
        if (!settings) return;
        setSaving(true);
        try {
            const updated = await settingsService.updateNotifications(settings.notifications);
            setSettings(prev => prev ? { ...prev, notifications: updated } : null);
            toast({
                title: 'Success',
                description: 'Notification settings updated',
            });
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to update settings',
                variant: 'destructive',
            });
        } finally {
            setSaving(false);
        }
    };

    const handleSavePrivacy = async () => {
        if (!settings) return;
        setSaving(true);
        try {
            const updated = await settingsService.updatePrivacy(settings.privacy);
            setSettings(prev => prev ? { ...prev, privacy: updated } : null);
            toast({
                title: 'Success',
                description: 'Privacy settings updated',
            });
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to update settings',
                variant: 'destructive',
            });
        } finally {
            setSaving(false);
        }
    };

    const handleSaveSecurity = async () => {
        if (!settings) return;
        setSaving(true);
        try {
            const updated = await settingsService.updateSecurity(settings.security);
            setSettings(prev => prev ? { ...prev, security: updated } : null);
            toast({
                title: 'Success',
                description: 'Security settings updated',
            });
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to update settings',
                variant: 'destructive',
            });
        } finally {
            setSaving(false);
        }
    };

    const handleSavePreferences = async () => {
        if (!settings) return;
        setSaving(true);
        try {
            const updated = await settingsService.updatePreferences(settings.preferences);
            setSettings(prev => prev ? { ...prev, preferences: updated } : null);
            toast({
                title: 'Success',
                description: 'Preferences updated',
            });
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to update preferences',
                variant: 'destructive',
            });
        } finally {
            setSaving(false);
        }
    };

    const handleResetToDefaults = async () => {
        try {
            const data = await settingsService.resetToDefaults();
            setSettings(data);
            setTheme(data.appearance.themePreference); // Sync theme after reset
            setShowResetDialog(false);
            toast({
                title: 'Success',
                description: 'Settings reset to defaults',
            });
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to reset settings',
                variant: 'destructive',
            });
        }
    };

    const handleExportData = async () => {
        try {
            const blob = await settingsService.exportData({
                includeProfile: true,
                includeGoals: true,
                includePlans: true,
                includeTasks: true,
                includeTransactions: true,
                dateRange: exportDateRange,
                startDate: exportCustomStart ? new Date(exportCustomStart) : undefined,
                endDate: exportCustomEnd ? new Date(exportCustomEnd) : undefined,
                format: exportFormat,
            });

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `savings-export-${new Date().toISOString()}.${exportFormat}`;
            a.click();
            window.URL.revokeObjectURL(url);

            setShowExportDialog(false);
            toast({
                title: 'Success',
                description: 'Data exported successfully',
            });
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to export data',
                variant: 'destructive',
            });
        }
    };

    const handleDeleteAccount = async () => {
        try {
            await settingsService.deleteAccount(deletePassword);
            await logout();
            router.push('/');
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to delete account',
                variant: 'destructive',
            });
        }
    };

    const breadcrumb = [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Settings', href: '/settings' },
    ];

    if (loading || !settings) {
        return (
            <ProtectedRoute>
                <SidebarProvider>
                    <AppSidebar />
                    <SidebarInset>
                        <Header title="Settings" subtitle="Manage your preferences" breadcrumb={breadcrumb} />
                        <Separator />
                        <div className="flex items-center justify-center min-h-[400px]">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    </SidebarInset>
                </SidebarProvider>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <Header title="Settings" subtitle="Manage your preferences" />
                    <Separator />

                    <div className="p-6">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
                                <TabsTrigger value="appearance" className="gap-2">
                                    <Palette className="h-4 w-4" />
                                    Appearance
                                </TabsTrigger>
                                <TabsTrigger value="notifications" className="gap-2">
                                    <Bell className="h-4 w-4" />
                                    Notifications
                                </TabsTrigger>
                                <TabsTrigger value="privacy" className="gap-2">
                                    <Eye className="h-4 w-4" />
                                    Privacy
                                </TabsTrigger>
                                <TabsTrigger value="security" className="gap-2">
                                    <Shield className="h-4 w-4" />
                                    Security
                                </TabsTrigger>
                                <TabsTrigger value="preferences" className="gap-2">
                                    <SettingsIcon className="h-4 w-4" />
                                    Preferences
                                </TabsTrigger>
                            </TabsList>

                            {/* Appearance Tab */}
                            <TabsContent value="appearance" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Theme & Display</CardTitle>
                                        <CardDescription>
                                            Customize how the application looks and feels
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-4">
                                            <Label>Theme Preference</Label>
                                            <div className="grid grid-cols-3 gap-4">
                                                {[
                                                    { value: ThemePreference.LIGHT, icon: Sun, label: 'Light' },
                                                    { value: ThemePreference.DARK, icon: Moon, label: 'Dark' },
                                                    { value: ThemePreference.SYSTEM, icon: Monitor, label: 'System' },
                                                ].map(({ value, icon: Icon, label }) => (
                                                    <Button
                                                        key={value}
                                                        variant="outline"
                                                        className={cn(
                                                            'flex flex-col items-center gap-2 h-auto py-4',
                                                            settings.appearance.themePreference === value && 'border-primary bg-primary/5'
                                                        )}
                                                        onClick={() => handleThemeChange(value)}
                                                    >
                                                        <Icon className="h-5 w-5" />
                                                        <span>{label}</span>
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Language</Label>
                                                <Select
                                                    value={settings.appearance.languagePreference}
                                                    onValueChange={(value: LanguagePreference) => setSettings({
                                                        ...settings,
                                                        appearance: { ...settings.appearance, languagePreference: value }
                                                    })}
                                                >
                                                    <SelectTrigger>
                                                        <Globe className="mr-2 h-4 w-4" />
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value={LanguagePreference.ENGLISH}>English</SelectItem>
                                                        <SelectItem value={LanguagePreference.SPANISH}>Español</SelectItem>
                                                        <SelectItem value={LanguagePreference.FRENCH}>Français</SelectItem>
                                                        <SelectItem value={LanguagePreference.GERMAN}>Deutsch</SelectItem>
                                                        <SelectItem value={LanguagePreference.CHINESE}>中文</SelectItem>
                                                        <SelectItem value={LanguagePreference.JAPANESE}>日本語</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Currency</Label>
                                                <Select
                                                    value={settings.appearance.currencyDisplay}
                                                    onValueChange={(value: CurrencyDisplay) => setSettings({
                                                        ...settings,
                                                        appearance: { ...settings.appearance, currencyDisplay: value }
                                                    })}
                                                >
                                                    <SelectTrigger>
                                                        <DollarSign className="mr-2 h-4 w-4" />
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value={CurrencyDisplay.USD}>USD ($)</SelectItem>
                                                        <SelectItem value={CurrencyDisplay.EUR}>EUR (€)</SelectItem>
                                                        <SelectItem value={CurrencyDisplay.GBP}>GBP (£)</SelectItem>
                                                        <SelectItem value={CurrencyDisplay.JPY}>JPY (¥)</SelectItem>
                                                        <SelectItem value={CurrencyDisplay.CAD}>CAD (C$)</SelectItem>
                                                        <SelectItem value={CurrencyDisplay.AUD}>AUD (A$)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Date Format</Label>
                                                <Select
                                                    value={settings.appearance.dateFormat}
                                                    onValueChange={(value: DateFormat) => setSettings({
                                                        ...settings,
                                                        appearance: { ...settings.appearance, dateFormat: value }
                                                    })}
                                                >
                                                    <SelectTrigger>
                                                        <Calendar className="mr-2 h-4 w-4" />
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value={DateFormat.MM_DD_YYYY}>MM/DD/YYYY</SelectItem>
                                                        <SelectItem value={DateFormat.DD_MM_YYYY}>DD/MM/YYYY</SelectItem>
                                                        <SelectItem value={DateFormat.YYYY_MM_DD}>YYYY-MM-DD</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Time Format</Label>
                                                <Select
                                                    value={settings.appearance.timeFormat}
                                                    onValueChange={(value: TimeFormat) => setSettings({
                                                        ...settings,
                                                        appearance: { ...settings.appearance, timeFormat: value }
                                                    })}
                                                >
                                                    <SelectTrigger>
                                                        <Clock className="mr-2 h-4 w-4" />
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value={TimeFormat.TWELVE_HOUR}>12-hour</SelectItem>
                                                        <SelectItem value={TimeFormat.TWENTY_FOUR_HOUR}>24-hour</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <Label>Compact View</Label>
                                                    <p className="text-sm text-muted-foreground">
                                                        Show more content with reduced spacing
                                                    </p>
                                                </div>
                                                <Switch
                                                    checked={settings.appearance.compactView}
                                                    onCheckedChange={(checked) => setSettings({
                                                        ...settings,
                                                        appearance: { ...settings.appearance, compactView: checked }
                                                    })}
                                                />
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <Label>Reduced Motion</Label>
                                                    <p className="text-sm text-muted-foreground">
                                                        Minimize animations throughout the app
                                                    </p>
                                                </div>
                                                <Switch
                                                    checked={settings.appearance.reducedMotion}
                                                    onCheckedChange={(checked) => setSettings({
                                                        ...settings,
                                                        appearance: { ...settings.appearance, reducedMotion: checked }
                                                    })}
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex justify-between">
                                        <Button variant="outline" onClick={() => fetchSettings()}>
                                            Cancel
                                        </Button>
                                        <Button onClick={handleSaveAppearance} disabled={saving}>
                                            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                            Save Changes
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </TabsContent>

                            {/* Notifications Tab */}
                            <TabsContent value="notifications" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Notification Preferences</CardTitle>
                                        <CardDescription>
                                            Choose how and when you want to be notified
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-medium">Channels</h3>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="h-4 w-4" />
                                                        <div>
                                                            <Label>Email Notifications</Label>
                                                            <p className="text-sm text-muted-foreground">
                                                                Receive updates via email
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Switch
                                                        checked={settings.notifications.emailNotifications}
                                                        onCheckedChange={(checked) => setSettings({
                                                            ...settings,
                                                            notifications: { ...settings.notifications, emailNotifications: checked }
                                                        })}
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Smartphone className="h-4 w-4" />
                                                        <div>
                                                            <Label>Push Notifications</Label>
                                                            <p className="text-sm text-muted-foreground">
                                                                Receive notifications on your device
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Switch
                                                        checked={settings.notifications.pushNotifications}
                                                        onCheckedChange={(checked) => setSettings({
                                                            ...settings,
                                                            notifications: { ...settings.notifications, pushNotifications: checked }
                                                        })}
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Bell className="h-4 w-4" />
                                                        <div>
                                                            <Label>In-App Notifications</Label>
                                                            <p className="text-sm text-muted-foreground">
                                                                Show notifications within the app
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Switch
                                                        checked={settings.notifications.inAppNotifications}
                                                        onCheckedChange={(checked) => setSettings({
                                                            ...settings,
                                                            notifications: { ...settings.notifications, inAppNotifications: checked }
                                                        })}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <Separator />

                                        <div className="space-y-4">
                                            <h3 className="text-sm font-medium">Sound</h3>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        {settings.notifications.notificationSound ? (
                                                            <Volume2 className="h-4 w-4" />
                                                        ) : (
                                                            <VolumeX className="h-4 w-4" />
                                                        )}
                                                        <div>
                                                            <Label>Notification Sound</Label>
                                                            <p className="text-sm text-muted-foreground">
                                                                Play sound for notifications
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Switch
                                                        checked={settings.notifications.notificationSound}
                                                        onCheckedChange={(checked) => setSettings({
                                                            ...settings,
                                                            notifications: { ...settings.notifications, notificationSound: checked }
                                                        })}
                                                    />
                                                </div>

                                                {settings.notifications.notificationSound && (
                                                    <div className="space-y-2">
                                                        <Label>Sound Preference</Label>
                                                        <Select
                                                            value={settings.notifications.soundPreference}
                                                            onValueChange={(value: NotificationSound) => setSettings({
                                                                ...settings,
                                                                notifications: { ...settings.notifications, soundPreference: value }
                                                            })}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value={NotificationSound.DEFAULT}>Default</SelectItem>
                                                                <SelectItem value={NotificationSound.GENTLE}>Gentle</SelectItem>
                                                                <SelectItem value={NotificationSound.ALERT}>Alert</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <Separator />

                                        <div className="space-y-4">
                                            <h3 className="text-sm font-medium">Reminders</h3>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <Label>Goal Reminders</Label>
                                                        <p className="text-sm text-muted-foreground">
                                                            Remind me about goal deadlines
                                                        </p>
                                                    </div>
                                                    <Switch
                                                        checked={settings.notifications.goalReminders}
                                                        onCheckedChange={(checked) => setSettings({
                                                            ...settings,
                                                            notifications: { ...settings.notifications, goalReminders: checked }
                                                        })}
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <Label>Task Reminders</Label>
                                                        <p className="text-sm text-muted-foreground">
                                                            Remind me about pending tasks
                                                        </p>
                                                    </div>
                                                    <Switch
                                                        checked={settings.notifications.taskReminders}
                                                        onCheckedChange={(checked) => setSettings({
                                                            ...settings,
                                                            notifications: { ...settings.notifications, taskReminders: checked }
                                                        })}
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <Label>Payment Reminders</Label>
                                                        <p className="text-sm text-muted-foreground">
                                                            Remind me about scheduled payments
                                                        </p>
                                                    </div>
                                                    <Switch
                                                        checked={settings.notifications.paymentReminders}
                                                        onCheckedChange={(checked) => setSettings({
                                                            ...settings,
                                                            notifications: { ...settings.notifications, paymentReminders: checked }
                                                        })}
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <Label>Milestone Celebrations</Label>
                                                        <p className="text-sm text-muted-foreground">
                                                            Celebrate when you reach milestones
                                                        </p>
                                                    </div>
                                                    <Switch
                                                        checked={settings.notifications.milestoneCelebrations}
                                                        onCheckedChange={(checked) => setSettings({
                                                            ...settings,
                                                            notifications: { ...settings.notifications, milestoneCelebrations: checked }
                                                        })}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <Separator />

                                        <div className="space-y-4">
                                            <h3 className="text-sm font-medium">Reports</h3>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <Label>Weekly Summary</Label>
                                                        <p className="text-sm text-muted-foreground">
                                                            Get a summary of your week
                                                        </p>
                                                    </div>
                                                    <Switch
                                                        checked={settings.notifications.weeklySummary}
                                                        onCheckedChange={(checked) => setSettings({
                                                            ...settings,
                                                            notifications: { ...settings.notifications, weeklySummary: checked }
                                                        })}
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <Label>Monthly Report</Label>
                                                        <p className="text-sm text-muted-foreground">
                                                            Receive detailed monthly reports
                                                        </p>
                                                    </div>
                                                    <Switch
                                                        checked={settings.notifications.monthlyReport}
                                                        onCheckedChange={(checked) => setSettings({
                                                            ...settings,
                                                            notifications: { ...settings.notifications, monthlyReport: checked }
                                                        })}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <Separator />

                                        <div className="space-y-4">
                                            <h3 className="text-sm font-medium">Quiet Hours</h3>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <Label>Enable Quiet Hours</Label>
                                                        <p className="text-sm text-muted-foreground">
                                                            Mute notifications during specific hours
                                                        </p>
                                                    </div>
                                                    <Switch
                                                        checked={settings.notifications.quietHoursEnabled}
                                                        onCheckedChange={(checked) => setSettings({
                                                            ...settings,
                                                            notifications: { ...settings.notifications, quietHoursEnabled: checked }
                                                        })}
                                                    />
                                                </div>

                                                {settings.notifications.quietHoursEnabled && (
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label>Start Time</Label>
                                                            <Input
                                                                type="time"
                                                                value={settings.notifications.quietHoursStart || '22:00'}
                                                                onChange={(e) => setSettings({
                                                                    ...settings,
                                                                    notifications: { ...settings.notifications, quietHoursStart: e.target.value }
                                                                })}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>End Time</Label>
                                                            <Input
                                                                type="time"
                                                                value={settings.notifications.quietHoursEnd || '07:00'}
                                                                onChange={(e) => setSettings({
                                                                    ...settings,
                                                                    notifications: { ...settings.notifications, quietHoursEnd: e.target.value }
                                                                })}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex justify-between">
                                        <Button variant="outline" onClick={() => fetchSettings()}>
                                            Cancel
                                        </Button>
                                        <Button onClick={handleSaveNotifications} disabled={saving}>
                                            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                            Save Changes
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </TabsContent>

                            {/* Privacy Tab */}
                            <TabsContent value="privacy" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Privacy Settings</CardTitle>
                                        <CardDescription>
                                            Control your privacy and data sharing preferences
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-medium">Profile Visibility</h3>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-4 w-4" />
                                                        <div>
                                                            <Label>Profile Visibility</Label>
                                                            <p className="text-sm text-muted-foreground">
                                                                Make your profile visible to others
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Switch
                                                        checked={settings.privacy.profileVisibility}
                                                        onCheckedChange={(checked) => setSettings({
                                                            ...settings,
                                                            privacy: { ...settings.privacy, profileVisibility: checked }
                                                        })}
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Award className="h-4 w-4" />
                                                        <div>
                                                            <Label>Show Achievements</Label>
                                                            <p className="text-sm text-muted-foreground">
                                                                Display your achievements on your profile
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Switch
                                                        checked={settings.privacy.showAchievements}
                                                        onCheckedChange={(checked) => setSettings({
                                                            ...settings,
                                                            privacy: { ...settings.privacy, showAchievements: checked }
                                                        })}
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Share2 className="h-4 w-4" />
                                                        <div>
                                                            <Label>Share Progress</Label>
                                                            <p className="text-sm text-muted-foreground">
                                                                Allow others to see your savings progress
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Switch
                                                        checked={settings.privacy.shareProgress}
                                                        onCheckedChange={(checked) => setSettings({
                                                            ...settings,
                                                            privacy: { ...settings.privacy, shareProgress: checked }
                                                        })}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <Separator />

                                        <div className="space-y-4">
                                            <h3 className="text-sm font-medium">Data Collection</h3>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <BarChart className="h-4 w-4" />
                                                        <div>
                                                            <Label>Analytics</Label>
                                                            <p className="text-sm text-muted-foreground">
                                                                Help us improve by sharing anonymous usage data
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Switch
                                                        checked={settings.privacy.allowAnalytics}
                                                        onCheckedChange={(checked) => setSettings({
                                                            ...settings,
                                                            privacy: { ...settings.privacy, allowAnalytics: checked }
                                                        })}
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="h-4 w-4" />
                                                        <div>
                                                            <Label>Marketing</Label>
                                                            <p className="text-sm text-muted-foreground">
                                                                Receive promotional offers and updates
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Switch
                                                        checked={settings.privacy.allowMarketing}
                                                        onCheckedChange={(checked) => setSettings({
                                                            ...settings,
                                                            privacy: { ...settings.privacy, allowMarketing: checked }
                                                        })}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <Separator />

                                        <div className="space-y-4">
                                            <h3 className="text-sm font-medium">Data Export</h3>
                                            <div className="flex items-center gap-4">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => setShowExportDialog(true)}
                                                >
                                                    <Download className="mr-2 h-4 w-4" />
                                                    Export My Data
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex justify-between">
                                        <Button variant="outline" onClick={() => fetchSettings()}>
                                            Cancel
                                        </Button>
                                        <Button onClick={handleSavePrivacy} disabled={saving}>
                                            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                            Save Changes
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
                                            Manage your account security preferences
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-medium">Login Security</h3>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Bell className="h-4 w-4" />
                                                        <div>
                                                            <Label>Login Alerts</Label>
                                                            <p className="text-sm text-muted-foreground">
                                                                Get notified of new login attempts
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Switch
                                                        checked={settings.security.loginAlerts}
                                                        onCheckedChange={(checked) => setSettings({
                                                            ...settings,
                                                            security: { ...settings.security, loginAlerts: checked }
                                                        })}
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Lock className="h-4 w-4" />
                                                        <div>
                                                            <Label>Trusted Devices Only</Label>
                                                            <p className="text-sm text-muted-foreground">
                                                                Only allow logins from trusted devices
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Switch
                                                        checked={settings.security.trustedDevicesOnly}
                                                        onCheckedChange={(checked) => setSettings({
                                                            ...settings,
                                                            security: { ...settings.security, trustedDevicesOnly: checked }
                                                        })}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <Separator />

                                        <div className="space-y-4">
                                            <h3 className="text-sm font-medium">Session Management</h3>
                                            <div className="space-y-2">
                                                <Label>Session Timeout (minutes)</Label>
                                                <div className="flex items-center gap-4">
                                                    <Slider
                                                        value={[settings.security.sessionTimeout]}
                                                        onValueChange={(value) => setSettings({
                                                            ...settings,
                                                            security: { ...settings.security, sessionTimeout: value[0] }
                                                        })}
                                                        min={5}
                                                        max={60}
                                                        step={5}
                                                        className="flex-1"
                                                    />
                                                    <span className="w-12 text-center">{settings.security.sessionTimeout}m</span>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    Automatically log out after inactivity
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex justify-between">
                                        <Button variant="outline" onClick={() => fetchSettings()}>
                                            Cancel
                                        </Button>
                                        <Button onClick={handleSaveSecurity} disabled={saving}>
                                            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                            Save Changes
                                        </Button>
                                    </CardFooter>
                                </Card>

                                <Card className="border-destructive">
                                    <CardHeader>
                                        <CardTitle className="text-destructive">Danger Zone</CardTitle>
                                        <CardDescription>
                                            Irreversible actions for your account
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">Reset All Settings</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Restore all settings to their default values
                                                </p>
                                            </div>
                                            <Button
                                                variant="outline"
                                                onClick={() => setShowResetDialog(true)}
                                            >
                                                <RotateCcw className="mr-2 h-4 w-4" />
                                                Reset
                                            </Button>
                                        </div>

                                        <Separator />

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">Delete Account</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Permanently delete your account and all data
                                                </p>
                                            </div>
                                            <Button
                                                variant="destructive"
                                                onClick={() => setShowDeleteDialog(true)}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Preferences Tab */}
                            <TabsContent value="preferences" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Dashboard Preferences</CardTitle>
                                        <CardDescription>
                                            Customize your dashboard experience
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-2">
                                            <Label>Dashboard Widgets</Label>
                                            <div className="flex items-center gap-4">
                                                <Slider
                                                    value={[settings.preferences.dashboardWidgets]}
                                                    onValueChange={(value) => setSettings({
                                                        ...settings,
                                                        preferences: { ...settings.preferences, dashboardWidgets: value[0] }
                                                    })}
                                                    min={3}
                                                    max={10}
                                                    step={1}
                                                    className="flex-1"
                                                />
                                                <span className="w-12 text-center">{settings.preferences.dashboardWidgets}</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                Number of widgets to show on dashboard
                                            </p>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex justify-between">
                                        <Button variant="outline" onClick={() => fetchSettings()}>
                                            Cancel
                                        </Button>
                                        <Button onClick={handleSavePreferences} disabled={saving}>
                                            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                            Save Changes
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Reset Settings Dialog */}
                    <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Reset All Settings</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will restore all settings to their default values. Your data will not be affected.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleResetToDefaults}>
                                    Reset
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    {/* Delete Account Dialog */}
                    <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete Account</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. All your data will be permanently deleted.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="space-y-4 py-4">
                                <Alert variant="destructive">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertTitle>Warning</AlertTitle>
                                    <AlertDescription>
                                        This will delete all your goals, plans, tasks, and transactions.
                                    </AlertDescription>
                                </Alert>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Enter your password to confirm</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={deletePassword}
                                        onChange={(e) => setDeletePassword(e.target.value)}
                                        placeholder="********"
                                    />
                                </div>
                            </div>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleDeleteAccount}
                                    className="bg-destructive hover:bg-destructive/90"
                                >
                                    Delete Account
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    {/* Export Data Dialog */}
                    <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Export Your Data</DialogTitle>
                                <DialogDescription>
                                    Choose the format and date range for your data export
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Export Format</Label>
                                    <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="json">JSON</SelectItem>
                                            <SelectItem value="csv">CSV</SelectItem>
                                            <SelectItem value="pdf">PDF</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Date Range</Label>
                                    <Select value={exportDateRange} onValueChange={(value: any) => setExportDateRange(value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Time</SelectItem>
                                            <SelectItem value="year">Past Year</SelectItem>
                                            <SelectItem value="month">Past Month</SelectItem>
                                            <SelectItem value="custom">Custom Range</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {exportDateRange === 'custom' && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Start Date</Label>
                                            <Input
                                                type="date"
                                                value={exportCustomStart}
                                                onChange={(e) => setExportCustomStart(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>End Date</Label>
                                            <Input
                                                type="date"
                                                value={exportCustomEnd}
                                                onChange={(e) => setExportCustomEnd(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setShowExportDialog(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleExportData}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Export
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </SidebarInset>
            </SidebarProvider>
        </ProtectedRoute>
    );
}