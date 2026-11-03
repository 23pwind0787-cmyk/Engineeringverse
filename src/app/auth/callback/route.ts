import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Handles Supabase Auth email links (verification, password recovery).
 * Exchanges the code for a session, carrying the session cookies on
 * the redirect response, then sends the user onward.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  const redirectTo = `${origin}${next.startsWith("/") ? next : "/dashboard"}`;

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/sign-in?error=verification`);
  }

  const response = NextResponse.redirect(redirectTo);
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${origin}/auth/sign-in?error=verification`);
  }
  return response;
}
