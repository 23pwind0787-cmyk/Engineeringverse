import type { Metadata } from "next";
import Link from "next/link";
import { ComingSoon } from "@/components/ComingSoon";
import { Container } from "@/components/Container";

export const metadata: Metadata = { title: "Community", robots: { index: false, follow: true } };

export default function Page() {
  return (
    <>
      <ComingSoon
        title="Community"
        description="The EngineeringVerse community is where contributors meet — contributor leaderboards, member profiles and shared resources are on the way."
        note="You can already browse departments, read the blog and upload papers."
      />
      <Container className="pb-16 text-center">
        <Link href="/upload" className="text-sm font-medium text-brand-700">Upload resources →</Link>
      </Container>
    </>
  );
}
