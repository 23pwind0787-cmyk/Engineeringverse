import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Container } from "@/components/Container";
import { AuthForm } from "@/components/AuthForm";

export const metadata: Metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <Container className="py-12 sm:py-16">
      <h1 className="text-center text-3xl font-bold tracking-tight">Sign in</h1>
      <p className="mt-2 text-center text-muted">
        No account yet?{" "}
        <Link href="/auth/sign-up" className="font-semibold text-brand-700 hover:underline">
          Create one
        </Link>{" "}
        ·{" "}
        <Link href="/auth/forgot-password" className="font-semibold text-brand-700 hover:underline">
          Forgot password?
        </Link>
      </p>
      <Suspense>
        <AuthForm mode="sign-in" />
      </Suspense>
    </Container>
  );
}
