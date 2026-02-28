import MyCoursesClient from "./MyCoursesClient";

export default function Page() {
  // keep SSR simple; CSR will fetch (works with cookies auth)
  return <MyCoursesClient initialPaginator={null} />;
}
