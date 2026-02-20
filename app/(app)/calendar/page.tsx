'use client';

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { AppSidebar } from '@/components/app-sidebar';
import { Header } from '@/components/dashboard/header';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { CalendarView } from '@/components/calendar/calendar-view';
import { EnhancedCalendarView } from '@/components/calendar/enhanced-calendar-view';

export default function CalendarPage() {
    const breadcrumb = [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Calendar', href: '/calendar' },
    ];

    return (
        <ProtectedRoute>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <Header
                        title="Calendar"
                        subtitle="View and manage your schedule"
                    />
                    <Separator />

                    <div className="p-6">
                        <EnhancedCalendarView />
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </ProtectedRoute>
    );
}