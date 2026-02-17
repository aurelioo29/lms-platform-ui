"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, RefreshCw, Loader2, KeyRound } from "lucide-react";

import { useMe, useUpdatePassword } from "@/features/auth/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { alertSuccess, handleApiError } from "@/lib/ui/alerts";
import { getPasswordStrength } from "@/lib/password-strength";

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

export default function PasswordSettingsClient() {
  const router = useRouter();
  const { data, isLoading, isError } = useMe();
  const user = data?.user;

  const updatePassword = useUpdatePassword();

  const email = useMemo(() => user?.email ?? "-", [user?.email]);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI checks
  const strength = useMemo(
    () => getPasswordStrength(newPassword),
    [newPassword],
  );

  const minOk = newPassword.length >= 8;
  const matchOk = newPassword.length > 0 && newPassword === confirmPassword;

  // Optional: require at least "Good" strength (level >= 2)
  // kalau mau longgar, ganti jadi `true`
  const strengthOk = newPassword.length === 0 ? false : strength.level >= 2;

  const canSave =
    currentPassword.length > 0 &&
    minOk &&
    matchOk &&
    strengthOk &&
    !updatePassword.isPending;

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
      await updatePassword.mutateAsync({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      });

      await alertSuccess({
        title: "Berhasil",
        message: "Password berhasil diperbarui.",
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      router.refresh();
    } catch (err) {
      await handleApiError(err, {
        fallbackMessage: "Gagal update password. Coba lagi.",
      });
    }
  }

  return (
    <div className="w-full px-6 py-6 space-y-6">
      {/* Page Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">Password</h2>
        <p className="text-sm text-muted-foreground">
          Update your password to keep your account secure.
        </p>
      </div>

      {/* Top summary strip */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground">
            Account:{" "}
            <span className="text-foreground font-medium">{email}</span>
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
            title="Change password"
            description="Use at least 8 characters and avoid common passwords."
            right={
              <div className="hidden sm:flex items-center gap-2 rounded-xl border bg-background px-3 py-2">
                <KeyRound className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Minimum 8 characters
                </span>
              </div>
            }
          />

          <Separator className="my-5" />

          <form onSubmit={onSave} className="space-y-5 max-w-md">
            {/* Current password */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="currentPassword">Current password</Label>
                <span className="text-[11px] font-medium text-red-500">
                  REQUIRED
                </span>
              </div>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
              />
              <p className="text-xs text-muted-foreground">
                Enter your current password to confirm this change.
              </p>
            </div>

            {/* New password */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="newPassword">New password</Label>
                <span className="text-[11px] font-medium text-red-500">
                  REQUIRED
                </span>
              </div>

              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />

              {/* Strength meter (simple + clean) */}
              {newPassword.length > 0 ? (
                <div className="pt-1 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Strength</span>
                    <span className="text-foreground font-medium">
                      {strength.label}
                    </span>
                  </div>

                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full ${strength.className}`}
                      style={{ width: `${strength.bar}%` }}
                    />
                  </div>

                  {strength.hints?.length ? (
                    <ul className="text-xs text-muted-foreground list-disc pl-5 space-y-1">
                      {strength.hints.map((h) => (
                        <li key={h}>{h}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Use a mix of letters, numbers, and symbols.
                </p>
              )}

              {!minOk && newPassword.length > 0 ? (
                <p className="text-xs text-destructive">
                  Password must be at least 8 characters.
                </p>
              ) : null}

              {newPassword.length > 0 && !strengthOk ? (
                <p className="text-xs text-destructive">
                  Password is too weak. Please use a stronger password.
                </p>
              ) : null}
            </div>

            {/* Confirm new password */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="confirmPassword">Confirm new password</Label>
                <span className="text-[11px] font-medium text-red-500">
                  REQUIRED
                </span>
              </div>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
              {confirmPassword.length > 0 && !matchOk ? (
                <p className="text-xs text-destructive">
                  Passwords do not match.
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Re-enter the new password to confirm.
                </p>
              )}
            </div>

            <Button type="submit" className="min-w-[96px]" disabled={!canSave}>
              {updatePassword.isPending ? (
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
