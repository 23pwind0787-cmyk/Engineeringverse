import type { Metadata } from "next";
import Link from "next/link";
import { ComingSoon } from "@/components/ComingSoon";
import { Container } from "@/components/Container";

export const metadata: Metadata = { title: "Innovative Projects & FYPs", robots: { index: false, follow: true } };

export default function Page() {
  return (
    <>
      <ComingSoon
        title="Innovative Projects & FYPs"
        description="Final year projects, research, robotics, AI, industrial automation and student innovations from every department will be showcased here. Students will be able to share their own projects with reports, images and outcomes."
        note="Project submissions open with the community upload system."
      />
      <Container className="pb-16 text-center">
        <Link href="/disciplines" className="text-sm font-medium text-brand-700">Browse departments →</Link>
      </Container>
    </>
  );
}
