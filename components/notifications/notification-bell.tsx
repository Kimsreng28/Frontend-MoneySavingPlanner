'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck, Trash2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { notificationService } from '@/api/notifications';
import { Notification } from '@/types/notification';
import { NotificationItem } from './notification-item';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export function NotificationBell() {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const page = useRef(1);
    const hasMore = useRef(true);

    useEffect(() => {
        if (user) {
            fetchNotifications();
            fetchUnreadCount();

            // Poll for new notifications every 30 seconds
            const interval = setInterval(fetchUnreadCount, 30000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const fetchNotifications = async (reset = false) => {
        if (!user) return;

        setLoading(true);
        try {
            if (reset) {
                page.current = 1;
                hasMore.current = true;
            }

            const response = await notificationService.getNotifications({
                page: page.current,
                limit: 10,
                isRead: activeTab === 'unread' ? false : undefined
            });

            setNotifications(prev =>
                reset ? response.notifications : [...prev, ...response.notifications]
            );

            hasMore.current = response.notifications.length === 10;
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUnreadCount = async () => {
        if (!user) return;
        try {
            const { count } = await notificationService.getUnreadCount();
            setUnreadCount(count);
        } catch (error) {
            console.error('Failed to fetch unread count:', error);
        }
    };

    const handleMarkAsRead = async (id: string) => {
        try {
            await notificationService.markAsRead([id]);
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, isRead: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
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
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await notificationService.deleteNotification(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
            if (!notifications.find(n => n.id === id)?.isRead) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };

    const handleDeleteAllRead = async () => {
        try {
            const { count } = await notificationService.deleteAllRead();
            setNotifications(prev => prev.filter(n => !n.isRead));
        } catch (error) {
            console.error('Failed to delete read notifications:', error);
        }
    };

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        fetchNotifications(true);
    };

    const loadMore = () => {
        if (!loading && hasMore.current) {
            page.current += 1;
            fetchNotifications();
        }
    };

    if (!user) return null;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </motion.span>
                    )}
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-[400px] p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-semibold">Notifications</h3>
                    <div className="flex gap-1">
                        {unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2"
                                onClick={handleMarkAllAsRead}
                            >
                                <CheckCheck className="h-4 w-4 mr-1" />
                                Mark all read
                            </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                            <Link href="/notifications">
                                <Settings className="h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={handleTabChange}>
                    <TabsList className="w-full rounded-none border-b">
                        <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
                        <TabsTrigger value="unread" className="flex-1">
                            Unread
                            {unreadCount > 0 && (
                                <span className="ml-1 text-xs bg-muted px-1.5 py-0.5 rounded-full">
                                    {unreadCount}
                                </span>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="m-0">
                        <NotificationList
                            notifications={notifications}
                            loading={loading}
                            hasMore={hasMore.current}
                            onLoadMore={loadMore}
                            onMarkAsRead={handleMarkAsRead}
                            onDelete={handleDelete}
                            onDeleteAllRead={handleDeleteAllRead}
                        />
                    </TabsContent>

                    <TabsContent value="unread" className="m-0">
                        <NotificationList
                            notifications={notifications}
                            loading={loading}
                            hasMore={hasMore.current}
                            onLoadMore={loadMore}
                            onMarkAsRead={handleMarkAsRead}
                            onDelete={handleDelete}
                            onDeleteAllRead={handleDeleteAllRead}
                        />
                    </TabsContent>
                </Tabs>
            </PopoverContent>
        </Popover>
    );
}

interface NotificationListProps {
    notifications: Notification[];
    loading: boolean;
    hasMore: boolean;
    onLoadMore: () => void;
    onMarkAsRead: (id: string) => void;
    onDelete: (id: string) => void;
    onDeleteAllRead: () => void;
}

function NotificationList({
    notifications,
    loading,
    hasMore,
    onLoadMore,
    onMarkAsRead,
    onDelete,
    onDeleteAllRead
}: NotificationListProps) {
    const hasReadNotifications = notifications.some(n => n.isRead);

    return (
        <>
            <ScrollArea className="h-[400px]">
                <AnimatePresence mode="popLayout">
                    {notifications.length === 0 && !loading ? (
                        <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                            <Bell className="h-12 w-12 mb-2 opacity-20" />
                            <p>No notifications</p>
                        </div>
                    ) : (
                        <div className="p-4">
                            {notifications.map((notification) => (
                                <NotificationItem
                                    key={notification.id}
                                    notification={notification}
                                    onMarkAsRead={onMarkAsRead}
                                    onDelete={onDelete}
                                />
                            ))}

                            {hasMore && (
                                <Button
                                    variant="ghost"
                                    className="w-full mt-2"
                                    onClick={onLoadMore}
                                    disabled={loading}
                                >
                                    {loading ? 'Loading...' : 'Load more'}
                                </Button>
                            )}
                        </div>
                    )}
                </AnimatePresence>
            </ScrollArea>

            {hasReadNotifications && (
                <div className="p-4 border-t">
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={onDeleteAllRead}
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear read notifications
                    </Button>
                </div>
            )}
        </>
    );
}