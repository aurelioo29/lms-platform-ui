"use client";

import * as React from "react";
import {
  AudioWaveform,
  BookOpen,
  Command,
  GalleryVerticalEnd,
  Activity,
  UserPlus,
  BookMarked,
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

  mainCourse: [
    {
      name: "List Courses",
      url: "/dashboard/courses",
      icon: BookOpen,
    },
    {
      name: "My Courses",
      url: "/dashboard/my-courses",
      icon: BookMarked,
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
    {
      title: "Manage Courses",
      url: "#",
      icon: BookOpen,
      isActive: false,
      admins: [
        { title: "List Courses", url: "/dashboard/admin/manage-courses" },
        {
          title: "List Discussions",
          url: "/dashboard/admin/manage-discussions",
        },
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
  const isTeacher = role === "teacher";

  // aturan menu
  const canSeeAdminMenu = isAdmin || isDeveloper;
  const canSeeModeratorMenu = isDeveloper; // admin gak boleh
  const canSeeMainCourse = isStudent || isAdmin || isDeveloper || isTeacher; // semua role boleh lihat main course

  const name = isLoading ? "Checking..." : (user?.name ?? "User");
  const email = isLoading ? "" : (user?.email ?? "");
  const avatar = user?.avatar ?? "/avatars/default-profile.png";

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>

      <SidebarContent>
        {canSeeMainCourse && <NavMain items={data.mainCourse} />}
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
