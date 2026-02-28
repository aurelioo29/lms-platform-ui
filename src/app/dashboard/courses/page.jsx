import CoursesClient from "./CoursesClient";

export const dynamic = "force-dynamic"; // kalau auth cookie berubah-ubah

export default function CoursesPage() {
  return <CoursesClient />;
}
