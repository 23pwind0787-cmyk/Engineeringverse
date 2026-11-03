import type { Metadata } from "next";
import { ComingSoon } from "@/components/ComingSoon";

export const metadata: Metadata = { title: "Learning Resources" };

export default function Page() {
  return <ComingSoon title="Learning Resources" description="Courses, references and study material will be available here." />;
}
