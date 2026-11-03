import type { Metadata } from "next";
import { ComingSoon } from "@/components/ComingSoon";

export const metadata: Metadata = { title: "AI Tools" };

export default function Page() {
  return <ComingSoon title="AI Tools" description="A directory of AI tools for research, design, coding and productivity will be available here." />;
}
