/**
 * Cloudflare Email Worker — Sequence Reply Detection
 *
 * Receives inbound emails to the reply-to address on sequence emails and:
 *   1. POSTs the sender's address to the BluuHQ portal webhook so the
 *      "Exit when client replies" condition is evaluated.
 *   2. Optionally forwards the full email to your Zoho inbox so your team
 *      can still read what the client wrote.
 *
 * ─── Setup ───────────────────────────────────────────────────────────────────
 *
 * This uses a SUBDOMAIN so your existing Zoho email is completely untouched.
 *
 * 1. In Cloudflare DNS, add MX records for the subdomain (e.g. mail.yourdomain.com):
 *      mail.yourdomain.com  MX 13  route1.mx.cloudflare.net
 *      mail.yourdomain.com  MX 31  route2.mx.cloudflare.net
 *    (Cloudflare shows the exact values under Email → Email Routing → Getting started)
 *    Your root domain MX records pointing to Zoho stay exactly as they are.
 *
 * 2. In Cloudflare Email Routing, add a routing rule:
 *      Address:  reply@mail.yourdomain.com
 *      Action:   Send to Worker → select this Worker
 *
 * 3. Deploy this Worker:
 *    Workers & Pages → Create → Create Worker → delete the placeholder code →
 *    paste this file → Deploy
 *
 * 4. In the Worker's Settings → Variables, add:
 *      PORTAL_URL      = https://portal.yourdomain.com
 *      WEBHOOK_SECRET  = <strong random string — generate with: openssl rand -hex 32>
 *      FORWARD_TO      = hello@yourdomain.com   ← your Zoho inbox (optional but recommended)
 *
 * 5. In your portal environment variables, add:
 *      CF_INBOUND_EMAIL_SECRET = <same value as WEBHOOK_SECRET above>
 *      SEQUENCE_REPLY_TO       = reply@mail.yourdomain.com
 */

export default {
  async email(message, env) {
    const portalUrl = env.PORTAL_URL?.replace(/\/$/, "");

    // Notify the portal webhook (fire-and-forget — don't let a failure
    // prevent the email from being forwarded to the Zoho inbox)
    if (portalUrl) {
      const payload = {
        from:      message.from,
        to:        message.to,
        subject:   message.headers.get("subject") ?? "",
        inReplyTo: message.headers.get("in-reply-to") ?? "",
      };

      fetch(`${portalUrl}/api/webhooks/inbound-email`, {
        method: "POST",
        headers: {
          "Content-Type":    "application/json",
          "X-Worker-Secret": env.WEBHOOK_SECRET ?? "",
        },
        body: JSON.stringify(payload),
      }).then((res) => {
        if (!res.ok) res.text().then((t) => console.error(`Portal webhook ${res.status}: ${t}`));
      }).catch((err) => console.error("Portal webhook fetch failed:", err));
    } else {
      console.error("PORTAL_URL env var not set");
    }

    // Forward the email to the Zoho inbox so your team can read the reply.
    // If FORWARD_TO is not set the email is silently dropped (exit condition
    // still fires, but nobody sees the reply content).
    if (env.FORWARD_TO) {
      await message.forward(env.FORWARD_TO);
    }
  },
};
