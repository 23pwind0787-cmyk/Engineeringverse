import Link from "next/link";

export function SectionCard({ href, title, blurb, glyph }: { href: string; title: string; blurb: string; glyph: string }) {
  return (
    <Link
      href={href}
      className="group flex h-full flex-col gap-3 rounded-xl border border-line bg-surface p-5 transition hover:-translate-y-0.5 hover:border-brand-500 hover:shadow-md"
    >
      <span aria-hidden className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-xl text-brand-700">{glyph}</span>
      <h3 className="font-semibold group-hover:text-brand-700">{title}</h3>
      <p className="text-sm text-muted">{blurb}</p>
    </Link>
  );
}
