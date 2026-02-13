"use client";

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  MonitorCog,
  Moon,
  Sparkles,
  Sun,
  SunMoon,
  User,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useTheme } from "next-themes";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import apiClient from "@/api/api-client"; // Use apiClient instead of getAvatarUrl

export function NavUser() {
  const { isMobile } = useSidebar();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(null);

  // Fetch avatar when user changes
  useEffect(() => {
    let objectUrl: string | null = null;

    const fetchAvatar = async () => {
      if (!user?.id) {
        setAvatarDataUrl(null);
        return;
      }

      try {
        const response = await apiClient.get(`/users/avatar/${user.id}`, {
          responseType: "blob",
        });

        const blob = new Blob([response.data], {
          type: response.headers["content-type"],
        });

        objectUrl = URL.createObjectURL(blob);
        setAvatarDataUrl(objectUrl);
      } catch (error: any) {
        if (error.response?.status === 404) {
          setAvatarDataUrl(null);
          return;
        }

        console.error("Failed to load avatar:", error);
        setAvatarDataUrl(null);
      }
    };

    fetchAvatar();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [user?.id]);

  const getInitials = (email: string) => {
    if (!email) return 'U';
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

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleProfile = () => {
    router.push("/profile");
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                {avatarDataUrl ? (
                  <AvatarImage
                    src={avatarDataUrl}
                    alt={user?.email || "User"}
                    onError={() => {
                      setAvatarDataUrl(null);
                    }}
                  />
                ) : null}
                <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
                  {user ? getInitials(user.email) : "U"}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {user?.username || "User"}
                </span>
                <span className="truncate text-xs">
                  {user?.email || "user@example.com"}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  {avatarDataUrl ? (
                    <AvatarImage
                      src={avatarDataUrl}
                      alt={user?.email || "User"}
                    />
                  ) : (
                    <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
                      {user ? getInitials(user.email) : "U"}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {user?.username || "User"}
                  </span>
                  <span className="truncate text-xs">
                    {user?.email || "user@example.com"}
                  </span>
                  {user?.role && (
                    <span className="mt-1 truncate text-xs text-muted-foreground">
                      Role: {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  )}
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={handleProfile}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {/* Theme dropdown menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="cursor-pointer"
                  >
                    <SunMoon className="mr-2 h-4 w-4" /> Theme
                  </DropdownMenuItem>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
                    <DropdownMenuRadioItem value="light">
                      <Sun className="mr-2 h-4 w-4" />
                      Light
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="dark">
                      <Moon className="mr-2 h-4 w-4" />
                      Dark
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="system">
                      <MonitorCog className="mr-2 h-4 w-4" />
                      System
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenuItem>
                <CreditCard className="mr-2 h-4 w-4" />
                Billing
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}