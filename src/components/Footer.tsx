import Link from "next/link";
import { Container } from "./Container";
import { Logo } from "./Logo";
import { sections, siteConfig } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-surface-alt">
      <Container className="grid gap-10 py-12 md:grid-cols-3">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-sm text-muted">{siteConfig.tagline}</p>
        </div>
        <nav aria-label="Explore">
          <h2 className="mb-3 text-sm font-semibold">Explore</h2>
          <ul className="grid gap-2 text-sm text-muted">
            {sections.slice(0, 4).map((s) => (
              <li key={s.key}><Link className="hover:text-brand-700" href={s.href}>{s.label}</Link></li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Community">
          <h2 className="mb-3 text-sm font-semibold">Community</h2>
          <ul className="grid gap-2 text-sm text-muted">
            {sections.slice(4).map((s) => (
              <li key={s.key}><Link className="hover:text-brand-700" href={s.href}>{s.label}</Link></li>
            ))}
          </ul>
        </nav>
      </Container>
      <div className="border-t border-line py-5">
        <Container className="flex flex-col gap-2 text-xs text-muted sm:flex-row sm:justify-between">
          <p>&copy; {siteConfig.name}. All rights reserved.</p>
          <p>EngineeringVerse is an independent project and is not officially affiliated with any university.</p>
        </Container>
      </div>
    </footer>
  );
}
