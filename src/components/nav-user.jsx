"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, LogOut, Sparkles, ChevronsUpDown } from "lucide-react";

import { useLogout } from "@/features/auth/use-auth";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { getAvatarSrc } from "@/lib/avatar";

function clearAuthCookies() {
  // kalau kamu punya cookie auth / laravel_session, bersihin di client
  document.cookie = "auth=; Path=/; Max-Age=0; SameSite=Lax";
  document.cookie = "XSRF-TOKEN=; Path=/; Max-Age=0; SameSite=Lax";
  document.cookie = "laravel_session=; Path=/; Max-Age=0; SameSite=Lax";
}

export function NavUser({ user }) {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const logoutMutation = useLogout();

  const go = (href) => {
    setOpen(false);
    router.push(href);
  };

  const onLogout = async () => {
    try {
      setOpen(false);
      await logoutMutation.mutateAsync(); // hit API logout
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      clearAuthCookies(); // bersihin token/cookies client
      router.replace("/login"); // replace biar ga bisa back
      router.refresh(); // refresh state
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage
                  src={getAvatarSrc(user?.avatar)}
                  alt={user?.name}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = "/avatars/default-profile.png";
                  }}
                />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user?.name}</span>
                <span className="truncate text-xs">{user?.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "top"}
            align="start"
            sideOffset={8}
            collisionPadding={10}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src={getAvatarSrc(user?.avatar)}
                    alt={user?.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.src = "/avatars/default-profile.png";
                    }}
                  />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>

                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user?.name}</span>
                  <span className="truncate text-xs">{user?.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  go("/dashboard/upgrade");
                }}
              >
                <Sparkles />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  go("/dashboard/settings/account");
                }}
              >
                <BadgeCheck />
                Account
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              disabled={logoutMutation.isPending}
              onSelect={(e) => {
                e.preventDefault();
                onLogout();
              }}
            >
              <LogOut />
              {logoutMutation.isPending ? "Logging out..." : "Log out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
