"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const LABELS = {
  dashboard: "Dashboard",
  settings: "Settings",
  account: "Account",
  billing: "Billing",
  notifications: "Notifications",
  security: "Security & Privacy",
  password: "Password",
  email: "Email Address",
  upgrade: "Upgrade to Pro",
};

function titleize(seg) {
  if (!seg) return "";
  const clean = seg.replace(/[-_]/g, " ");
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

export function DashboardBreadcrumb() {
  const pathname = usePathname(); // contoh: /dashboard/settings/account
  const segments = (pathname || "").split("/").filter(Boolean);

  // kalau bukan area dashboard, gak usah render
  if (segments[0] !== "dashboard") return null;

  const crumbs = segments.map((seg, idx) => {
    const href = "/" + segments.slice(0, idx + 1).join("/");
    const label = LABELS[seg] ?? titleize(seg);
    return { href, label };
  });

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((c, i) => {
          const isLast = i === crumbs.length - 1;

          return (
            <div key={c.href} className="flex items-center">
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{c.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={c.href}>{c.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>

              {!isLast && <BreadcrumbSeparator className="mx-2" />}
            </div>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
