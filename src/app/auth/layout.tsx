import type { Metadata } from "next";

// All /auth/* pages are utility pages (sign-in, sign-up, password
// reset, email verification). They must not appear in search results.
// These pages are client components, which cannot export metadata
// themselves, so the noindex rule lives in this shared layout.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
