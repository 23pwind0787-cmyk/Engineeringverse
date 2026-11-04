import type { Metadata } from "next";
import Link from "next/link";
import { ComingSoon } from "@/components/ComingSoon";
import { Container } from "@/components/Container";
import { getArticlesByCategory } from "@/lib/articles";

export const metadata: Metadata = { title: "AI Tools" };

export default function Page() {
  const hasArticles = getArticlesByCategory("ai-tools").length > 0;
  return (
    <>
      <ComingSoon title="AI Tools" description="A directory of AI tools for research, design, coding and productivity will be available here." />
      {hasArticles && (
        <Container className="pb-16 text-center">
          <Link href="/blog?category=ai-tools" className="text-sm font-medium text-brand-700">
            Browse AI tools articles →
          </Link>
        </Container>
      )}
    </>
  );
}
