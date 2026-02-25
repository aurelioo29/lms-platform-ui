import TeachersClient from "./TeachersClient";

export const dynamic = "force-dynamic";

export default function TeachersPage() {
  return <TeachersClient initialPaginator={null} />;
}
