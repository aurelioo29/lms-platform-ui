"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, RefreshCw, Loader2, User2 } from "lucide-react";

import { useMe, useUpdateUsername } from "@/features/auth/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { alertSuccess, handleApiError } from "@/lib/ui/alerts";

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
              Please wait while we verify your session.
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

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatDate(d) {
  // kalau mau Indonesia: ganti "en-US" -> "id-ID"
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(d);
}

export default function UsernameSettingsClient() {
  const router = useRouter();
  const { data, isLoading, isError } = useMe();
  const user = data?.user;

  const updateUsername = useUpdateUsername();

  const windowDays = 60;

  const currentName = useMemo(() => user?.name ?? "-", [user?.name]);

  // policy: based on username_changed_at
  const lastChangedAt = user?.username_changed_at
    ? new Date(user.username_changed_at)
    : null;

  const nextAllowedAt = lastChangedAt
    ? addDays(lastChangedAt, windowDays)
    : null;

  const canChangeNow = !nextAllowedAt || new Date() >= nextAllowedAt;

  const daysRemaining =
    nextAllowedAt && !canChangeNow
      ? Math.max(
          1,
          Math.ceil((nextAllowedAt - new Date()) / (1000 * 60 * 60 * 24)),
        )
      : 0;

  const [name, setName] = useState("");

  const canSave =
    name.trim().length >= 2 && !updateUsername.isPending && canChangeNow;

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

  async function onSave(e) {
    e.preventDefault();
    if (!canSave) return;

    try {
      await updateUsername.mutateAsync(name.trim());

      await alertSuccess({
        title: "Berhasil",
        message: "Display name berhasil diperbarui.",
      });

      setName("");
      router.refresh();
    } catch (err) {
      await handleApiError(err, {
        fallbackMessage: "Gagal update display name. Coba lagi.",
      });
    }
  }

  return (
    <div className="w-full px-6 py-6 space-y-6">
      {/* Page Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">Display Name</h2>
        <p className="text-sm text-muted-foreground">
          Update how your name appears across the application.
        </p>
      </div>

      {/* Top summary strip */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground">
            Current name{" "}
            <span className="text-foreground font-medium">{currentName}</span>
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
        <Card className="p-5">
          <SectionHeader
            title="Change Display Name"
            description="Your display name is used across your profile and dashboard."
          />

          {/* Policy info (professional, includes date) */}
          <div className="mt-3 text-sm text-muted-foreground">
            <ul className="list-disc pl-5 space-y-1">
              <li>
                You can change your display name{" "}
                <span className="text-foreground font-semibold">
                  once every {windowDays} days
                </span>
                .
              </li>

              {nextAllowedAt ? (
                <li>
                  Next change available on{" "}
                  <span className="text-foreground font-semibold">
                    {formatDate(nextAllowedAt)}
                  </span>
                  {!canChangeNow ? (
                    <>
                      {" "}
                      (
                      <span className="text-foreground font-semibold">
                        {daysRemaining}
                      </span>{" "}
                      day{daysRemaining > 1 ? "s" : ""} remaining)
                    </>
                  ) : null}
                  .
                </li>
              ) : (
                <li>
                  You haven’t changed your display name yet, so you can update
                  it now.
                </li>
              )}
            </ul>
          </div>

          {!canChangeNow ? (
            <div className="mt-4 rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
              Display name updates are temporarily unavailable. Please try again
              after{" "}
              <span className="text-foreground font-medium">
                {formatDate(nextAllowedAt)}
              </span>
              .
            </div>
          ) : null}

          <Separator className="my-5" />

          {/* Form */}
          <form onSubmit={onSave} className="space-y-4 max-w-md">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="displayName">New display name</Label>
                <span className="text-[11px] font-medium text-red-500">
                  REQUIRED
                </span>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-lg border bg-background p-2">
                  <User2 className="h-4 w-4 text-muted-foreground" />
                </div>

                <div className="w-full">
                  <Input
                    id="displayName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your new display name"
                    autoComplete="name"
                    disabled={!canChangeNow}
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    Please use your real name or a professional display name.
                  </p>
                </div>
              </div>
            </div>

            <Button type="submit" className="min-w-[96px]" disabled={!canSave}>
              {updateUsername.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving
                </>
              ) : (
                "Save"
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
