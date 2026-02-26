import CoursesClient from "./CoursesClient";

export const dynamic = "force-dynamic";

export default function ManageCoursesPage() {
  return <CoursesClient initialList={null} />;
}
