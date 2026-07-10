import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/apiPermissions";

// Diagnostic endpoint — tests whether the WordPress plugin endpoint is reachable.
export async function GET(req: NextRequest) {
  const auth = await requireSession(req);
  if (auth instanceof NextResponse) return auth;

  const wpUrl = process.env.WORDPRESS_URL;

  if (!wpUrl) {
    return NextResponse.json({ ok: false, error: "WORDPRESS_URL env var is not set" }, { status: 500 });
  }

  const endpoint = `${wpUrl}/wp-json/bluuhq/v1/auth/validate`;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "__probe__", password: "__probe__" }),
      signal: AbortSignal.timeout(8000),
    });

    const text = await res.text().catch(() => "(no body)");

    // 401 = endpoint exists but credentials wrong (expected for probe)
    // 404 = endpoint not found (plugin not active)
    // 200 = credentials somehow worked (shouldn't happen with probe values)
    const pluginActive = res.status === 401 || res.status === 400;

    return NextResponse.json({
      ok: pluginActive,
      wordpressUrl: wpUrl,
      endpoint,
      httpStatus: res.status,
      pluginActive,
      hint: pluginActive
        ? "Plugin is active. If login still fails, your WP username/password may be wrong or the user lacks the administrator or bluu_admin role."
        : res.status === 404
        ? "Plugin endpoint not found (404). Make sure the BluuHQ plugin is installed and activated in WordPress."
        : `Unexpected response (${res.status}). WordPress may be unreachable or blocking the request.`,
      rawResponse: text.slice(0, 300),
    });
  } catch (err: unknown) {
    return NextResponse.json({
      ok: false,
      wordpressUrl: wpUrl,
      endpoint,
      error: err instanceof Error ? err.message : "Request failed",
      hint: "Could not reach WordPress. Check that WORDPRESS_URL is correct and the site is online.",
    }, { status: 502 });
  }
}
