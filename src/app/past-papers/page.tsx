import { permanentRedirect } from "next/navigation";

// Past papers now live inside their department pages, so the old
// standalone list page redirects permanently to Departments.
// Individual paper URLs (/past-papers/[id]) still work.
export default function PastPapersPage() {
  permanentRedirect("/disciplines");
}
