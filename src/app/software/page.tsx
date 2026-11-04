import type { Metadata } from "next";
import Link from "next/link";
import { ComingSoon } from "@/components/ComingSoon";
import { Container } from "@/components/Container";
import { getArticlesByCategory } from "@/lib/articles";

export const metadata: Metadata = { title: "Software Directory" };

export default function Page() {
  const hasArticles = getArticlesByCategory("software-news").length > 0;
  return (
    <>
      <ComingSoon title="Software Directory" description="A curated directory of engineering software organised by discipline will be available here." />
      {hasArticles && (
        <Container className="pb-16 text-center">
          <Link href="/blog?category=software-news" className="text-sm font-medium text-brand-700">
            Browse software news articles →
          </Link>
        </Container>
      )}
    </>
  );
}
