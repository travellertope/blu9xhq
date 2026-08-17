import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

/**
 * Supabase Auth callback — handles magic-link and OAuth redirects.
 * Supabase appends ?code= to this URL after the user clicks the magic link.
 *
 * Cookies MUST be set on the redirect response object itself, not on the
 * incoming request's cookie store — otherwise they are lost when the
 * browser follows the redirect and the user ends up unauthenticated.
 */
export async function GET(req: NextRequest) {
  const { searchParams, origin } = req.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/portal";

  if (!code) {
    return NextResponse.redirect(`${origin}/auth-error?error=missing_code`);
  }

  const redirectUrl = `${origin}${next}`;
  const response = NextResponse.redirect(redirectUrl);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${origin}/auth-error?error=${encodeURIComponent(error.message)}`);
  }

  return response;
}
