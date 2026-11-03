import Link from "next/link";
import { Container } from "./Container";

export function ComingSoon({ title, description, note }: { title: string; description: string; note?: string }) {
  return (
    <Container className="py-16 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-block rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700">Coming soon</span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-4 text-muted">{description}</p>
        {note && <p className="mt-3 text-sm text-muted">{note}</p>}
        <Link href="/" className="mt-8 inline-flex rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">Back to home</Link>
      </div>
    </Container>
  );
}
