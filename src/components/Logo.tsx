import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/site";

export function Logo() {
  return (
    <Link href="/" className="flex items-center" aria-label={`${siteConfig.name} home`}>
      <Image src="/logo.svg" alt={siteConfig.name} width={132} height={32} className="h-8 w-auto" priority />
    </Link>
  );
}
