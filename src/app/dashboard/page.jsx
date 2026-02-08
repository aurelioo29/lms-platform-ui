"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLogout, useMe } from "@/features/auth/use-auth";

export default function DashboardPage() {
  const router = useRouter();
  const { data, isLoading } = useMe();
  const logoutMutation = useLogout();

  const user = data?.user;

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [isLoading, user, router]);

  if (isLoading) return <p style={{ padding: 24 }}>Loading...</p>;
  if (!user) return null;

  return (
    <div style={{ padding: 24 }}>
      <h1>Dashboard</h1>
      <p>Halo, {user.name}</p>
      <p>Role: {user.role}</p>

      <button
        onClick={async () => {
          await logoutMutation.mutateAsync();
          router.push("/login");
        }}
        style={{ marginTop: 12, padding: 10 }}
      >
        {logoutMutation.isPending ? "Logging out..." : "Logout"}
      </button>
    </div>
  );
}
