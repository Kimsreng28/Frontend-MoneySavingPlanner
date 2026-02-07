"use client";

import { Bell, Search, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "../ui/sidebar";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface HeaderProps {
  title: string;
  subtitle?: string;
  breadcrumb?: BreadcrumbItem[];
}

export const Header = ({ title, subtitle, breadcrumb = [] }: HeaderProps) => {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render a skeleton/loading state while on server or before mount
    return (
      <header className="flex items-center justify-between gap-2 p-4">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div className="flex flex-col">
            <h1 className="text-3xl font-display font-bold text-foreground">
              {title}
            </h1>
            {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="pl-10 w-64 h-10 bg-muted rounded-xl animate-pulse" />
          </div>
          <div className="w-10 h-10 bg-muted rounded-full animate-pulse" />
        </div>
      </header>
    );
  }

  return (
    <header className="flex flex-col gap-4 p-4">
      {/* Breadcrumb Navigation */}
      {breadcrumb.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {breadcrumb.map((item, index) => (
            <div key={item.href} className="flex items-center gap-2">
              {index > 0 && <ChevronRight className="w-4 h-4" />}
              <Link
                href={item.href}
                className={`hover:text-foreground transition-colors ${index === breadcrumb.length - 1 ? "text-foreground font-medium" : ""
                  }`}
              >
                {item.label}
              </Link>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div className="flex flex-col">
            <h1 className="text-3xl font-display font-bold text-foreground">
              {title}
              {user?.username && breadcrumb.length === 0 && (
                <span className="text-muted-foreground">,&nbsp;{user.username}</span>
              )}
            </h1>
            {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
          </div>
        </div>

        {user && (
          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-10 w-64 bg-card border-border rounded-xl"
              />
            </div>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};  