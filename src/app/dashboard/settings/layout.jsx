// app/dashboard/settings/layout.jsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const items = [
  //   { title: "Overview", href: "/dashboard/settings" },
  { title: "Account", href: "/dashboard/settings/account" },
  { title: "Email Address", href: "/dashboard/settings/email" },
  { title: "Password", href: "/dashboard/settings/password" },
  //   { title: "Notifications", href: "/dashboard/settings/notifications" },
  //   { title: "Billing", href: "/dashboard/settings/billing" },
];

export default function SettingsLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        {/* Left Settings Nav */}
        <aside className="rounded-xl border bg-card p-2">
          <div className="px-2 py-2 text-xs font-medium text-muted-foreground">
            ACCOUNT SETTINGS
          </div>
          <Separator className="my-2" />

          <nav className="flex flex-col gap-1">
            {items.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/dashboard/settings" &&
                  pathname?.startsWith(item.href));

              return (
                <Button
                  key={item.href}
                  asChild
                  variant={active ? "secondary" : "ghost"}
                  className={cn("justify-start")}
                >
                  <Link href={item.href}>{item.title}</Link>
                </Button>
              );
            })}
          </nav>
        </aside>

        {/* Right Content */}
        <section className="min-w-0">{children}</section>
      </div>
    </div>
  );
}
