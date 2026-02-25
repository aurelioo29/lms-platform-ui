"use client";

import * as React from "react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  GalleryVerticalEnd,
  Settings2,
  SquareTerminal,
  Activity,
  UserPlus,
} from "lucide-react";

import { useMe } from "@/features/auth/use-auth";
import { NavMain } from "@/components/nav-main";
import { NavModerator } from "@/components/nav-moderator";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavAdmin } from "./nav-admin";

const data = {
  user: {
    name: "User",
    email: "user@example.com",
    avatar: "/avatars/default-profile.png",
  },
  teams: [
    { name: "Acme Inc", logo: GalleryVerticalEnd, plan: "Enterprise" },
    { name: "Acme Corp.", logo: AudioWaveform, plan: "Startup" },
    { name: "Evil Corp.", logo: Command, plan: "Free" },
  ],
  navMain: [
    {
      title: "Playground",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        { title: "History", url: "#" },
        { title: "Starred", url: "#" },
        { title: "Settings", url: "#" },
      ],
    },
    {
      title: "Models",
      url: "#",
      icon: Bot,
      items: [
        { title: "Genesis", url: "#" },
        { title: "Explorer", url: "#" },
        { title: "Quantum", url: "#" },
      ],
    },
    {
      title: "Documentation",
      url: "#",
      icon: BookOpen,
      items: [
        { title: "Introduction", url: "#" },
        { title: "Get Started", url: "#" },
        { title: "Tutorials", url: "#" },
        { title: "Changelog", url: "#" },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        { title: "General", url: "#" },
        { title: "Team", url: "#" },
        { title: "Billing", url: "#" },
        { title: "Limits", url: "#" },
      ],
    },
  ],

  admins: [
    {
      title: "Manage Accounts",
      url: "#",
      icon: UserPlus,
      isActive: false,
      admins: [
        { title: "Students", url: "/dashboard/admin/manage-accounts/students" },
        { title: "Teachers", url: "/dashboard/admin/manage-accounts/teachers" },
      ],
    },
  ],

  moderator: [
    {
      name: "Activity Logs",
      url: "/dashboard/moderator/activity-logs",
      icon: Activity,
    },
  ],
};

export function AppSidebar(props) {
  const { data: meData, isLoading } = useMe();

  const apiUser = meData?.user;
  const user = apiUser ?? data.user;

  const role = apiUser?.role; // <= ini penting (pastikan backend kirim role)
  const isDeveloper = role === "developer";
  const isAdmin = role === "admin";
  const isStudent = role === "student";

  // aturan menu
  const canSeeAdminMenu = isAdmin || isDeveloper;
  const canSeeModeratorMenu = isDeveloper; // admin gak boleh

  const name = isLoading ? "Checking..." : (user?.name ?? "User");
  const email = isLoading ? "" : (user?.email ?? "");
  const avatar = user?.avatar ?? "/avatars/default-profile.png";

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>

      <SidebarContent>
        {canSeeAdminMenu && <NavAdmin admins={data.admins} />}
        {canSeeModeratorMenu && <NavModerator moderator={data.moderator} />}
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={{ name, email, avatar }} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
