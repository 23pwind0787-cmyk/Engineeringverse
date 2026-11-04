import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Container } from "@/components/Container";
import { AuthForm } from "@/components/AuthForm";

export const metadata: Metadata = { title: "Create account", robots: { index: false, follow: false } };

export default function SignUpPage() {
  return (
    <Container className="py-12 sm:py-16">
      <h1 className="text-center text-3xl font-bold tracking-tight">Create your account</h1>
      <p className="mt-2 text-center text-muted">
        Registration is only needed to upload papers. Searching, viewing and
        downloading published papers needs no account. Already registered?{" "}
        <Link href="/auth/sign-in" className="font-semibold text-brand-700 hover:underline">
          Sign in
        </Link>
      </p>
      <Suspense>
        <AuthForm mode="sign-up" />
      </Suspense>
    </Container>
  );
}
