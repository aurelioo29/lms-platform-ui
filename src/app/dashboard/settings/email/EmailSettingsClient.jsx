"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, ShieldCheck, RefreshCw, Loader2 } from "lucide-react";

import { useMe, useUpdateEmail } from "@/features/auth/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { alertSuccess, handleApiError, alertInfo } from "@/lib/ui/alerts";

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

function Row({ icon: Icon, title, value, right }) {
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

function isValidEmail(email) {
  const e = String(email || "").trim();
  return e.length > 3 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

export default function EmailSettingsClient() {
  const router = useRouter();
  const { data, isLoading, isError } = useMe();
  const user = data?.user;

  const updateEmail = useUpdateEmail();

  const currentEmail = useMemo(() => user?.email ?? "-", [user?.email]);

  const [newEmail, setNewEmail] = useState("");

  const trimmed = newEmail.trim();
  const valid = isValidEmail(trimmed);
  const sameAsCurrent =
    trimmed.length > 0 &&
    trimmed.toLowerCase() === String(currentEmail).toLowerCase();

  const canSave = valid && !sameAsCurrent && !updateEmail.isPending;

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
      await updateEmail.mutateAsync(trimmed);

      await alertSuccess({
        title: "Berhasil",
        message: "Email berhasil diperbarui.",
      });

      setNewEmail("");
      router.refresh();
    } catch (err) {
      await handleApiError(err, {
        fallbackMessage: "Gagal update email. Coba lagi.",
      });
    }
  }

  async function onUseCurrent() {
    await alertInfo({
      title: "Tidak ada perubahan",
      message: "Email baru sama dengan email saat ini.",
    });
  }

  return (
    <div className="w-full px-6 py-6 space-y-6">
      {/* Page Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">Email Address</h2>
        <p className="text-sm text-muted-foreground">
          Update the email used for sign-in and account notifications.
        </p>
      </div>

      {/* Top summary strip */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground">
            Current email{" "}
            <span className="text-foreground font-medium">{currentEmail}</span>
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
            title="Change email address"
            description="Enter the new email you want to use for your account."
          />

          <div className="mt-4 text-sm text-muted-foreground">
            <ul className="list-disc pl-5 space-y-1">
              <li>Make sure you still have access to the new email.</li>
              <li>This email will be used for sign-in and notifications.</li>
            </ul>
          </div>

          <Separator className="my-5" />

          <Row icon={Mail} title="Current email address" value={currentEmail} />

          <Separator />

          <form onSubmit={onSave} className="py-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-lg border bg-background p-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
              </div>

              <div className="min-w-0 w-full max-w-md">
                <div className="flex items-center gap-2">
                  <Label className="font-medium" htmlFor="newEmail">
                    New email address
                  </Label>
                  <span className="text-[11px] font-medium text-red-500">
                    REQUIRED
                  </span>
                </div>

                <div className="mt-2">
                  <Input
                    id="newEmail"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="name@example.com"
                    autoComplete="email"
                  />
                </div>

                <div className="mt-2 text-xs text-muted-foreground">
                  Please enter a valid email format.
                </div>

                {sameAsCurrent ? (
                  <div className="mt-3 rounded-md border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                    The new email is the same as your current email.
                    <Button
                      type="button"
                      variant="link"
                      className="h-auto px-1 py-0 text-xs"
                      onClick={onUseCurrent}
                    >
                      OK
                    </Button>
                  </div>
                ) : null}

                <div className="mt-4">
                  <Button
                    type="submit"
                    disabled={!canSave}
                    className="min-w-[96px]"
                  >
                    {updateEmail.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving
                      </>
                    ) : (
                      "Save"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
