import type { Metadata } from "next";
import { ComingSoon } from "@/components/ComingSoon";

export const metadata: Metadata = { title: "Engineering Careers" };

export default function Page() {
  return <ComingSoon title="Engineering Careers" description="Career paths, skills and guidance will be available here." />;
}
