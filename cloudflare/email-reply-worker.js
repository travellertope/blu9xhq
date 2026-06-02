/**
 * Cloudflare Email Worker — Sequence Reply Detection
 *
 * Receives inbound emails sent to the reply-to address used on sequence emails
 * (e.g. reply@mail.yourdomain.com) and forwards the sender's address to the
 * BluuHQ portal so the "Exit when client replies" condition can be evaluated.
 *
 * Setup steps:
 *   1. In Cloudflare dashboard → Email → Email Routing → Enable for your domain
 *   2. Add a routing rule: address "reply@mail.yourdomain.com" → send to this Worker
 *      (or use a catch-all rule if you prefer)
 *   3. Deploy this Worker (Workers & Pages → Create Worker → paste this code)
 *   4. Add the Worker environment variable:
 *        PORTAL_URL       = https://portal.yourdomain.com
 *        WEBHOOK_SECRET   = <any strong random string — must match CF_INBOUND_EMAIL_SECRET in portal>
 *   5. In your portal environment variables, add:
 *        CF_INBOUND_EMAIL_SECRET = <same value as WEBHOOK_SECRET above>
 *        SEQUENCE_REPLY_TO       = reply@mail.yourdomain.com
 */

export default {
  async email(message, env) {
    const payload = {
      from:      message.from,
      to:        message.to,
      subject:   message.headers.get("subject") ?? "",
      inReplyTo: message.headers.get("in-reply-to") ?? "",
    };

    const portalUrl = env.PORTAL_URL?.replace(/\/$/, "");
    if (!portalUrl) {
      console.error("PORTAL_URL env var not set");
      return;
    }

    const res = await fetch(`${portalUrl}/api/webhooks/inbound-email`, {
      method: "POST",
      headers: {
        "Content-Type":   "application/json",
        "X-Worker-Secret": env.WEBHOOK_SECRET ?? "",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error(`Portal webhook returned ${res.status}: ${await res.text()}`);
    }
  },
};
