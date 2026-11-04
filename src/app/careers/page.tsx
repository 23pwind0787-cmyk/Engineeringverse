import type { Metadata } from "next";
import Link from "next/link";
import { ComingSoon } from "@/components/ComingSoon";
import { Container } from "@/components/Container";
import { getArticlesByCategory } from "@/lib/articles";

export const metadata: Metadata = { title: "Engineering Careers" };

export default function Page() {
  const hasArticles = getArticlesByCategory("careers").length > 0;
  return (
    <>
      <ComingSoon title="Engineering Careers" description="Career paths, skills and guidance will be available here." />
      {hasArticles && (
        <Container className="pb-16 text-center">
          <Link href="/blog?category=careers" className="text-sm font-medium text-brand-700">
            Browse careers articles →
          </Link>
        </Container>
      )}
    </>
  );
}
