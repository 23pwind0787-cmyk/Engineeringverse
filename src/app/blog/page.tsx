import type { Metadata } from "next";
import { ComingSoon } from "@/components/ComingSoon";

export const metadata: Metadata = { title: "Engineering Blog" };

export default function Page() {
  return <ComingSoon title="Engineering Blog" description="Articles and guides from the engineering community will be published here." />;
}
