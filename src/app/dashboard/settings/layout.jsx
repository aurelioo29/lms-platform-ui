"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const items = [
  { title: "Account", href: "/dashboard/settings/account" },
  { title: "Email Address", href: "/dashboard/settings/email" },
  { title: "Password", href: "/dashboard/settings/password" },
  { title: "Display Name", href: "/dashboard/settings/username" },
  { title: "Profile Photo", href: "/dashboard/settings/avatar" },
];

function isActive(pathname, href) {
  return pathname === href || pathname?.startsWith(href + "/");
}

export default function SettingsLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="w-full">
      <div className="mb-6 space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      {/* Mobile nav */}
      <div className="lg:hidden mb-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {items.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Button
                key={item.href}
                asChild
                variant={active ? "secondary" : "outline"}
                className={cn("shrink-0")}
              >
                <Link href={item.href}>{item.title}</Link>
              </Button>
            );
          })}
        </div>
        <Separator />
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block rounded-xl border bg-card p-2 h-fit sticky top-6">
          <div className="px-2 py-2 text-xs font-medium text-muted-foreground">
            ACCOUNT SETTINGS
          </div>
          <Separator className="my-2" />

          <nav className="flex flex-col gap-1">
            {items.map((item) => {
              const active = isActive(pathname, item.href);

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

        {/* Content */}
        <section className="min-w-0">{children}</section>
      </div>
    </div>
  );
}
