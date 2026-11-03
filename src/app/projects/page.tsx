import type { Metadata } from "next";
import { ComingSoon } from "@/components/ComingSoon";

export const metadata: Metadata = { title: "Projects & Innovations" };

export default function Page() {
  return <ComingSoon title="Projects & Innovations" description="A space to showcase and discover engineering projects will be available here." />;
}
