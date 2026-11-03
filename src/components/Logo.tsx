import Link from "next/link";
import { siteConfig } from "@/lib/site";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight" aria-label={`${siteConfig.name} home`}>
      <span aria-hidden className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">EV</span>
      <span className="text-lg">Engineering<span className="text-brand-600">Verse</span></span>
    </Link>
  );
}
