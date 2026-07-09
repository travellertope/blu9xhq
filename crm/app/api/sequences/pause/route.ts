import { NextRequest, NextResponse } from "next/server";
import { verifyPauseToken } from "@/lib/sequencePauseToken";
import { updateEnrollment, wpRestFetch } from "@/lib/wp-api";
import type { WPEnrollmentPost } from "@/lib/wp-api";

function htmlPage(heading: string, body: string, isError = false): NextResponse {
  const color = isError ? "#DC2626" : "#1875F2";
  return new NextResponse(
    `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${heading}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
           background: #F1F5F9; display: flex; align-items: center; justify-content: center;
           min-height: 100vh; padding: 24px; }
    .card { background: #fff; border-radius: 12px; padding: 40px 48px; max-width: 480px;
            width: 100%; box-shadow: 0 1px 3px rgba(0,0,0,.08), 0 4px 24px rgba(0,0,0,.06); text-align: center; }
    .icon { font-size: 48px; margin-bottom: 16px; }
    h1 { margin: 0 0 12px; font-size: 22px; color: ${color}; }
    p  { margin: 0; font-size: 15px; color: #475569; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${isError ? "⚠️" : "✅"}</div>
    <h1>${heading}</h1>
    <p>${body}</p>
  </div>
</body>
</html>`,
    {
      status: isError ? 400 : 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    }
  );
}

// GET /api/sequences/pause?token=xxx
// Called when a client clicks the "pause" link in a sequence email.
// No auth required — the HMAC token is the authorization.

export async function GET(req: NextRequest) {
  const token = new URL(req.url).searchParams.get("token");
  if (!token) {
    return htmlPage("Invalid link", "This pause link is missing required data.", true);
  }

  const enrollmentId = verifyPauseToken(token);
  if (!enrollmentId) {
    return htmlPage("Invalid link", "This pause link is invalid or has been tampered with.", true);
  }

  try {
    const enrollment = await wpRestFetch<WPEnrollmentPost>(
      `/wp/v2/bluu_seq_enrollment/${enrollmentId}`
    );

    if (enrollment.acf.enr_status === "paused") {
      return htmlPage(
        "Already paused",
        "These emails are already paused. Reach out to us if you'd like to resume them."
      );
    }

    if (enrollment.acf.enr_status !== "active") {
      return htmlPage(
        "Sequence ended",
        "This email sequence has already completed. There are no more emails to pause."
      );
    }

    await updateEnrollment(enrollmentId, {
      acf: {
        enr_status:    "paused",
        enr_paused_at: new Date().toISOString(),
      },
    });

    return htmlPage(
      "Emails paused",
      "You won't receive any more emails from this sequence. If you change your mind, just let us know and we'll resume them for you."
    );
  } catch (err) {
    console.error("[GET /api/sequences/pause]", err);
    return htmlPage("Something went wrong", "We couldn't process your request. Please try again or contact us.", true);
  }
}
