"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Mail,
  User2,
  KeyRound,
  ExternalLink,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from "lucide-react";

import { useMe } from "@/features/auth/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarSrc } from "@/lib/avatar";
import { cn } from "@/lib/utils";

function SectionHeader({ title, description, right }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-1">
        <div className="text-base font-semibold">{title}</div>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}

function Row({ icon: Icon, title, value, actionLabel, onAction, disabled }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="rounded-lg border bg-background p-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>

        <div className="min-w-0">
          <div className="font-medium leading-none">{title}</div>
          <div className="mt-1 text-sm text-muted-foreground truncate">
            {value || "-"}
          </div>
        </div>
      </div>

      {actionLabel ? (
        <Button
          variant="ghost"
          className="h-8 px-3"
          onClick={onAction}
          disabled={disabled}
        >
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

function FullPageLoading() {
  return (
    <div className="min-h-[70vh] w-full grid place-items-center px-6">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3">
          <div className="rounded-xl border bg-background p-3">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="text-base font-semibold">
              Checking authentication…
            </div>
            <div className="text-sm text-muted-foreground">
              Making sure you’re not a raccoon wearing a hoodie.
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}

function ProviderCard({ name, connected, description, onManage, disabled }) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 rounded-xl border p-4",
        "bg-card/60",
      )}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <div className="font-medium">{name}</div>
          {connected ? (
            <Badge className="gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> Connected
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1">
              <XCircle className="h-3.5 w-3.5" /> Not connected
            </Badge>
          )}
        </div>
        <div className="mt-1 text-sm text-muted-foreground truncate">
          {description}
        </div>
      </div>

      <Button
        variant="outline"
        className="gap-2"
        onClick={onManage}
        disabled={disabled}
      >
        Manage <ExternalLink className="h-4 w-4" />
      </Button>
    </div>
  );
}

export default function AccountSettingsPage() {
  const router = useRouter();
  const { data, isLoading, isError } = useMe();

  const user = data?.user;
  const roleLabel = useMemo(() => user?.role ?? "-", [user?.role]);
  const googleConnected = Boolean(user?.google_id);

  if (isLoading) return <FullPageLoading />;

  if (isError || !user) {
    return (
      <div className="w-full px-6 py-8">
        <Card className="p-6">
          <div className="flex items-start gap-3">
            <div className="rounded-xl border bg-background p-3">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-lg font-semibold">You’re not signed in</div>
              <div className="text-sm text-muted-foreground">
                Session not found. Please log in again.
              </div>
              <div className="mt-4 flex gap-2">
                <Button onClick={() => router.replace("/login")}>
                  Go to Login
                </Button>
                <Button variant="outline" onClick={() => router.refresh()}>
                  Retry
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full px-6 py-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Account</h2>
          <p className="text-sm text-muted-foreground">
            Manage your profile, login methods, and security preferences.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Avatar className="h-11 w-11 rounded-xl">
            <AvatarImage
              src={getAvatarSrc(user.avatar)}
              alt={user.name}
              referrerPolicy="no-referrer"
              onError={(e) =>
                (e.currentTarget.src = "/avatars/default-profile.png")
              }
            />
            <AvatarFallback className="rounded-xl">
              {(user.name || "U").slice(0, 1).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="leading-tight">
            <div className="font-medium">{user.name}</div>
            <div className="text-xs text-muted-foreground truncate max-w-[260px]">
              {user.email}
            </div>
          </div>
        </div>
      </div>

      {/* Top summary strip */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground">
            Signed in as{" "}
            <span className="text-foreground font-medium">{user.name}</span> •
            Role{" "}
            <span className="text-foreground font-medium">{roleLabel}</span>
          </div>

          <Button
            variant="outline"
            className="h-9 gap-2"
            onClick={() => router.refresh()}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </Card>

      {/* Content */}
      <div className="space-y-6">
        {/* Profile card */}
        <Card className="p-5">
          <SectionHeader
            title="Profile"
            description="Basic information used across your account."
          />
          <div className="mt-4">
            <Row
              icon={User2}
              title="Display Name"
              value={user.name}
              actionLabel="Change"
              onAction={() => router.push("/dashboard/settings/username")}
            />
            <Separator />
            <Row
              icon={Mail}
              title="Email Address"
              value={user.email}
              actionLabel="Change"
              onAction={() => router.push("/dashboard/settings/email")}
            />
          </div>
        </Card>

        {/* Password card */}
        <Card className="p-5">
          <SectionHeader
            title="Login"
            description="Manage your password and sign-in methods."
          />
          <div className="mt-4">
            <Row
              icon={KeyRound}
              title="Password"
              value="••••••••"
              actionLabel="Change"
              onAction={() => router.push("/dashboard/settings/password")}
            />
          </div>
        </Card>

        {/* Connected accounts */}
        <Card className="p-5">
          <SectionHeader
            title="Connected accounts"
            description="Link external providers for sign-in and integrations."
          />
          <div className="mt-4 space-y-3">
            <ProviderCard
              name="Google"
              connected={googleConnected}
              description={
                googleConnected
                  ? "This account can be used to sign in."
                  : "Connect Google for easier sign-in."
              }
              onManage={() => alert("Coming soon: Google connect / disconnect")}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
