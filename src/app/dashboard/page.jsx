// app/dashboard/page.jsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLogout, useMe } from "@/features/auth/use-auth";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const router = useRouter();
  const { data, isLoading } = useMe();
  const logoutMutation = useLogout();

  const user = data?.user;

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [isLoading, user, router]);

  if (isLoading) return <p className="p-6">Loading...</p>;
  if (!user) return null;

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p>
        Halo, <span className="font-medium">{user.name}</span>
      </p>
      <p className="text-sm text-muted-foreground">Role: {user.role}</p>

      <div className="pt-2">
        <Button
          onClick={async () => {
            await logoutMutation.mutateAsync();
            router.push("/login");
          }}
          disabled={logoutMutation.isPending}
        >
          {logoutMutation.isPending ? "Logging out..." : "Logout"}
        </Button>
      </div>
    </div>
  );
}
