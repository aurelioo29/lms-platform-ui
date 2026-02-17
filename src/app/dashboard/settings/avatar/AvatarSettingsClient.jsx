"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  RefreshCw,
  Loader2,
  ImagePlus,
  Trash2,
} from "lucide-react";

import {
  useMe,
  useUpdateAvatar,
  useRemoveAvatar,
} from "@/features/auth/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarSrc } from "@/lib/avatar";
import { alertConfirm, alertSuccess, handleApiError } from "@/lib/ui/alerts";

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

export default function AvatarSettingsClient() {
  const router = useRouter();
  const { data, isLoading, isError } = useMe();
  const user = data?.user;

  const updateAvatar = useUpdateAvatar();
  const removeAvatar = useRemoveAvatar();

  const fileRef = useRef(null);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const currentAvatar = useMemo(
    () => getAvatarSrc(user?.avatar),
    [user?.avatar],
  );
  const displayName = useMemo(() => user?.name ?? "U", [user?.name]);
  const email = useMemo(() => user?.email ?? "-", [user?.email]);

  const effectivePreview = previewUrl || currentAvatar;

  function onPickFile() {
    fileRef.current?.click();
  }

  function onFileChange(e) {
    const f = e.target.files?.[0];
    if (!f) return;

    const okTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!okTypes.includes(f.type)) {
      handleApiError(
        { message: "Invalid file type" },
        { fallbackMessage: "Upload JPG, PNG, atau WebP." },
      );
      e.target.value = "";
      return;
    }

    // max 10MB (ikut backend)
    if (f.size > 10 * 1024 * 1024) {
      handleApiError(
        { message: "File too large" },
        { fallbackMessage: "Maksimal 10MB ya." },
      );
      e.target.value = "";
      return;
    }

    setFile(f);
    const url = URL.createObjectURL(f);
    setPreviewUrl(url);
  }

  function clearSelection() {
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl("");
    if (fileRef.current) fileRef.current.value = "";
  }

  async function onSave() {
    if (!file || updateAvatar.isPending) return;

    try {
      await updateAvatar.mutateAsync(file);
      await alertSuccess({
        title: "Berhasil",
        message: "Avatar berhasil diperbarui.",
      });
      clearSelection();
      router.refresh();
    } catch (e) {
      await handleApiError(e, {
        fallbackMessage: "Gagal upload avatar. Coba lagi.",
      });
    }
  }

  async function onRemove() {
    if (removing || removeAvatar.isPending) return;

    const res = await alertConfirm({
      title: "Hapus foto profil?",
      message: "Foto profil akan dihapus dan dikembalikan ke default.",
      confirmText: "Ya, hapus",
      cancelText: "Batal",
    });

    if (!res.isConfirmed) return;

    setRemoving(true);
    try {
      await removeAvatar.mutateAsync();

      await alertSuccess({
        title: "Berhasil",
        message: "Foto profil berhasil dihapus.",
      });

      clearSelection();
      router.refresh();
    } catch (e) {
      await handleApiError(e, {
        fallbackMessage: "Gagal menghapus foto profil. Coba lagi.",
      });
    } finally {
      setRemoving(false);
    }
  }

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
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">Profile Photo</h2>
        <p className="text-sm text-muted-foreground">
          Update your avatar shown across the dashboard.
        </p>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground">
            Signed in as{" "}
            <span className="text-foreground font-medium">{displayName}</span> •{" "}
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

      <div className="space-y-6">
        <Card className="p-5">
          <SectionHeader
            title="Change profile photo"
            description="Upload a square image for best results. JPG/PNG/WebP, max 10MB."
          />

          <Separator className="my-5" />

          <div className="flex flex-col sm:flex-row gap-6 sm:items-start">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 rounded-2xl">
                <AvatarImage
                  src={effectivePreview}
                  alt={displayName}
                  referrerPolicy="no-referrer"
                  onError={(e) =>
                    (e.currentTarget.src = "/avatars/default-profile.png")
                  }
                />
                <AvatarFallback className="rounded-2xl">
                  {displayName.slice(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-1">
                <div className="font-medium leading-none">{displayName}</div>
                <div className="text-sm text-muted-foreground">{email}</div>
                {file ? (
                  <div className="text-xs text-muted-foreground">
                    Selected:{" "}
                    <span className="font-medium text-foreground">
                      {file.name}
                    </span>
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground">
                    No new photo selected.
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap gap-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={onFileChange}
                />

                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={onPickFile}
                >
                  <ImagePlus className="h-4 w-4" />
                  Choose photo
                </Button>

                <Button
                  className="gap-2"
                  onClick={onSave}
                  disabled={!file || updateAvatar.isPending}
                >
                  {updateAvatar.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving
                    </>
                  ) : (
                    "Save"
                  )}
                </Button>

                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={clearSelection}
                  disabled={!file && !previewUrl}
                >
                  Cancel
                </Button>

                <Button
                  variant="outline"
                  className="gap-2 border-destructive/40 text-destructive hover:text-destructive"
                  onClick={onRemove}
                  disabled={removing || removeAvatar.isPending}
                >
                  {removing || removeAvatar.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Removing
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </>
                  )}
                </Button>
              </div>

              <div className="mt-3 text-xs text-muted-foreground">
                Tip: kalau backend nggak crop ke square, users bakal upload foto
                KTP landscape dan tetap salahin kamu.
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
