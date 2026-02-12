import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default function DashboardLayout({ children }) {
  const cookieStore = cookies();
  
  const all = cookieStore.getAll?.() ?? [];
  const laravelSession = all.find((c) => c.name === "laravel_session")?.value;

  if (!laravelSession) {
    redirect("/login");
  }

  return children;
}
