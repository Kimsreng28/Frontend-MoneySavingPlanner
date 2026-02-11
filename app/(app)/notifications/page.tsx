'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Bell,
    CheckCheck,
    Trash2,
    Filter,
    ChevronLeft,
    ChevronRight,
    Settings,
    Mail,
    Inbox,
    Archive,
    PieChart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { Header } from '@/components/dashboard/header';
import { NotificationItem } from '@/components/notifications/notification-item';
import { notificationService } from '@/api/notifications';
import { Notification, NotificationType, NotificationStats } from '@/types/notification';
import { format } from 'date-fns';

export default function NotificationsPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [stats, setStats] = useState<NotificationStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [filterType, setFilterType] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 10;

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user, activeTab, filterType, currentPage]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [notificationsRes, statsRes] = await Promise.all([
                notificationService.getNotifications({
                    page: currentPage,
                    limit,
                    isRead: activeTab === 'unread' ? false : activeTab === 'read' ? true : undefined,
                    type: filterType !== 'all' ? filterType : undefined,
                }),
                notificationService.getNotificationStats()
            ]);

            setNotifications(notificationsRes.notifications);
            setTotalPages(Math.ceil(notificationsRes.total / limit));
            setStats(statsRes);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id: string) => {
        try {
            await notificationService.markAsRead([id]);
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, isRead: true } : n)
            );
            fetchData(); // Refresh stats
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev =>
                prev.map(n => ({ ...n, isRead: true }))
            );
            fetchData();
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await notificationService.deleteNotification(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
            fetchData();
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };

    const handleDeleteAllRead = async () => {
        try {
            await notificationService.deleteAllRead();
            setNotifications(prev => prev.filter(n => !n.isRead));
            fetchData();
        } catch (error) {
            console.error('Failed to delete read notifications:', error);
        }
    };

    const getNotificationTypeCount = (type: string) => {
        return stats?.byType[type] || 0;
    };

    const breadcrumb = [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Notifications', href: '/notifications' },
    ];

    return (
        <ProtectedRoute>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <Header
                        title="Notifications"
                        subtitle="Stay updated with your savings activity"
                    />

                    <Separator />

                    <div className="p-6">
                        <div className="grid gap-6 lg:grid-cols-4">
                            {/* Stats Cards */}
                            <div className="lg:col-span-1 space-y-4">
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            Overview
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Inbox className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm">Total</span>
                                                </div>
                                                <span className="font-bold">{stats?.summary.totalCount || 0}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Bell className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm">Unread</span>
                                                </div>
                                                <span className="font-bold text-primary">
                                                    {stats?.summary.unreadCount || 0}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Archive className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm">Read</span>
                                                </div>
                                                <span className="font-bold">{stats?.summary.readCount || 0}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            By Type
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {Object.entries(stats?.byType || {}).map(([type, count]) => (
                                                <div key={type} className="flex items-center justify-between">
                                                    <span className="text-sm capitalize">{type.replace('_', ' ')}</span>
                                                    <Badge variant="secondary">{count}</Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            Actions
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        {stats?.summary.unreadCount ? (
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start"
                                                onClick={handleMarkAllAsRead}
                                            >
                                                <CheckCheck className="mr-2 h-4 w-4" />
                                                Mark all as read
                                            </Button>
                                        ) : null}

                                        {stats?.summary.readCount ? (
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start"
                                                onClick={handleDeleteAllRead}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Clear read notifications
                                            </Button>
                                        ) : null}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Notifications List */}
                            <div className="lg:col-span-3">
                                <Card className="border-t-4 border-t-primary">
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle className="text-2xl font-bold">
                                                    Notification Center
                                                </CardTitle>
                                                <CardDescription>
                                                    Manage your notifications and stay updated
                                                </CardDescription>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-4 mt-4">
                                            <Tabs
                                                value={activeTab}
                                                onValueChange={setActiveTab}
                                                className="flex-1"
                                            >
                                                <TabsList className="w-full">
                                                    <TabsTrigger value="all" className="flex-1">
                                                        All
                                                    </TabsTrigger>
                                                    <TabsTrigger value="unread" className="flex-1">
                                                        Unread
                                                        {stats?.summary.unreadCount ? (
                                                            <Badge variant="secondary" className="ml-2">
                                                                {stats.summary.unreadCount}
                                                            </Badge>
                                                        ) : null}
                                                    </TabsTrigger>
                                                    <TabsTrigger value="read" className="flex-1">
                                                        Read
                                                    </TabsTrigger>
                                                </TabsList>
                                            </Tabs>

                                            <Select value={filterType} onValueChange={setFilterType}>
                                                <SelectTrigger className="w-[180px]">
                                                    <Filter className="mr-2 h-4 w-4" />
                                                    <SelectValue placeholder="Filter by type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All types</SelectItem>
                                                    {Object.values(NotificationType).map(type => (
                                                        <SelectItem key={type} value={type}>
                                                            {type.replace('_', ' ')}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </CardHeader>

                                    <CardContent>
                                        {loading ? (
                                            <div className="space-y-4">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <div key={i} className="flex items-start gap-4">
                                                        <Skeleton className="h-10 w-10 rounded-full" />
                                                        <div className="flex-1 space-y-2">
                                                            <Skeleton className="h-4 w-1/4" />
                                                            <Skeleton className="h-3 w-3/4" />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : notifications.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                                <Bell className="h-16 w-16 mb-4 opacity-20" />
                                                <h3 className="text-lg font-medium">No notifications</h3>
                                                <p className="text-sm">
                                                    {activeTab === 'unread'
                                                        ? 'You have no unread notifications'
                                                        : activeTab === 'read'
                                                            ? 'You have no read notifications'
                                                            : "You haven't received any notifications yet"}
                                                </p>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="space-y-2">
                                                    {notifications.map((notification) => (
                                                        <NotificationItem
                                                            key={notification.id}
                                                            notification={notification}
                                                            onMarkAsRead={handleMarkAsRead}
                                                            onDelete={handleDelete}
                                                        />
                                                    ))}
                                                </div>

                                                {/* Pagination */}
                                                {totalPages > 1 && (
                                                    <div className="flex items-center justify-between mt-6 pt-6 border-t">
                                                        <p className="text-sm text-muted-foreground">
                                                            Page {currentPage} of {totalPages}
                                                        </p>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                                disabled={currentPage === 1}
                                                            >
                                                                <ChevronLeft className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                                disabled={currentPage === totalPages}
                                                            >
                                                                <ChevronRight className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </ProtectedRoute>
    );
}