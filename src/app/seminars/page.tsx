import type { Metadata } from "next";
import Link from "next/link";
import { ComingSoon } from "@/components/ComingSoon";
import { Container } from "@/components/Container";

export const metadata: Metadata = { title: "Seminars & Events", robots: { index: false, follow: true } };

export default function Page() {
  return (
    <>
      <ComingSoon
        title="Seminars & Events"
        description="Engineering seminars, technical workshops, webinars, industrial visits, conferences, career events and competitions will be announced here. Departments and registered students will be able to submit event announcements."
        note="Event submissions open with the community upload system."
      />
      <Container className="pb-16 text-center">
        <Link href="/disciplines" className="text-sm font-medium text-brand-700">Browse departments →</Link>
      </Container>
    </>
  );
}
