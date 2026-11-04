import type { Metadata } from "next";
import Link from "next/link";
import { ComingSoon } from "@/components/ComingSoon";
import { Container } from "@/components/Container";
import { getArticlesByCategory } from "@/lib/articles";

export const metadata: Metadata = { title: "Learning Resources", robots: { index: false, follow: true } };

export default function Page() {
  const hasTutorials = getArticlesByCategory("tutorials").length > 0;
  const hasResources = getArticlesByCategory("resources").length > 0;
  return (
    <>
      <ComingSoon title="Learning Resources" description="Courses, references and study material will be available here." />
      {(hasTutorials || hasResources) && (
        <Container className="pb-16 text-center">
          <p className="flex flex-wrap justify-center gap-4 text-sm font-medium text-brand-700">
            {hasTutorials && <Link href="/blog?category=tutorials">Browse tutorials →</Link>}
            {hasResources && <Link href="/blog?category=resources">Browse resources →</Link>}
          </p>
        </Container>
      )}
    </>
  );
}
