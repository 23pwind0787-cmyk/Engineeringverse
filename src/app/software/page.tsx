import type { Metadata } from "next";
import { ComingSoon } from "@/components/ComingSoon";

export const metadata: Metadata = { title: "Software Directory" };

export default function Page() {
  return <ComingSoon title="Software Directory" description="A curated directory of engineering software organised by discipline will be available here." />;
}
