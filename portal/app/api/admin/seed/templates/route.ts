import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/apiPermissions";

const DEFAULT_TEMPLATES = [
  {
    title: "Portal Welcome",
    acf: {
      type: "onboarding",
      subject: "Welcome to your BluuHQ client portal, {{client.name}}",
      body_html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1e293b">
  <h2 style="color:#0f172a">Welcome, {{client.name}}! 👋</h2>
  <p>We're so glad to have <strong>{{client.company}}</strong> on board. Your dedicated client portal is now ready — it's your central hub for:</p>
  <ul>
    <li>Viewing and paying invoices</li>
    <li>Downloading project files and deliverables</li>
    <li>Tracking project progress and updates</li>
  </ul>
  <p style="margin-top:24px">
    <a href="{{portal.login_url}}" style="background:#0f172a;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;font-weight:600">
      Access Your Portal →
    </a>
  </p>
  <p style="color:#64748b;font-size:14px;margin-top:24px">Questions? Just reply to this email — we're always here to help.</p>
</div>`,
      body_text: `Welcome, {{client.name}}!\n\nYour BluuHQ client portal is ready. Log in here: {{portal.login_url}}\n\nYour portal gives you access to invoices, files, and project updates.\n\nQuestions? Just reply to this email.`,
      merge_tags: "{{client.name}}, {{client.company}}, {{portal.login_url}}",
    },
  },
  {
    title: "Invoice Ready",
    acf: {
      type: "invoice",
      subject: "Your invoice {{invoice.number}} from BluuHQ is ready",
      body_html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1e293b">
  <h2>Invoice {{invoice.number}}</h2>
  <p>Hi {{client.name}},</p>
  <p>Your invoice is ready for review and payment.</p>
  <table style="width:100%;border-collapse:collapse;margin:16px 0">
    <tr style="border-bottom:1px solid #e2e8f0">
      <td style="padding:10px 0;color:#64748b">Amount Due</td>
      <td style="padding:10px 0;font-weight:700;text-align:right">{{invoice.amount}}</td>
    </tr>
    <tr>
      <td style="padding:10px 0;color:#64748b">Due Date</td>
      <td style="padding:10px 0;text-align:right">{{invoice.due_date}}</td>
    </tr>
  </table>
  <p>
    <a href="{{portal.login_url}}" style="background:#0f172a;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;font-weight:600">
      View &amp; Pay Invoice →
    </a>
  </p>
</div>`,
      body_text: `Invoice {{invoice.number}}\n\nHi {{client.name}},\n\nAmount Due: {{invoice.amount}}\nDue Date: {{invoice.due_date}}\n\nPay here: {{portal.login_url}}`,
      merge_tags: "{{client.name}}, {{invoice.number}}, {{invoice.amount}}, {{invoice.due_date}}, {{portal.login_url}}",
    },
  },
  {
    title: "Payment Reminder",
    acf: {
      type: "invoice",
      subject: "Friendly reminder — invoice due {{invoice.due_date}}",
      body_html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1e293b">
  <h2>Quick payment reminder</h2>
  <p>Hi {{client.name}},</p>
  <p>This is a friendly reminder that invoice <strong>{{invoice.number}}</strong> for <strong>{{invoice.amount}}</strong> is due on <strong>{{invoice.due_date}}</strong>.</p>
  <p>If you've already arranged payment, please disregard this message — and thank you!</p>
  <p>
    <a href="{{portal.login_url}}" style="background:#0f172a;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;font-weight:600">
      Pay Now →
    </a>
  </p>
  <p style="color:#64748b;font-size:14px">Need to discuss payment arrangements? Just reply to this email.</p>
</div>`,
      body_text: `Hi {{client.name}},\n\nFriendly reminder: Invoice {{invoice.number}} for {{invoice.amount}} is due {{invoice.due_date}}.\n\nPay here: {{portal.login_url}}\n\nNeed help? Just reply.`,
      merge_tags: "{{client.name}}, {{invoice.number}}, {{invoice.amount}}, {{invoice.due_date}}, {{portal.login_url}}",
    },
  },
  {
    title: "Overdue Notice",
    acf: {
      type: "invoice",
      subject: "Action required — overdue invoice from BluuHQ",
      body_html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1e293b">
  <h2 style="color:#dc2626">Invoice Overdue</h2>
  <p>Hi {{client.name}},</p>
  <p>We noticed that invoice <strong>{{invoice.number}}</strong> for <strong>{{invoice.amount}}</strong> is now past its due date of <strong>{{invoice.due_date}}</strong>.</p>
  <p>Please settle this at your earliest convenience to avoid any interruption to your services.</p>
  <p>
    <a href="{{portal.login_url}}" style="background:#dc2626;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;font-weight:600">
      Pay Now →
    </a>
  </p>
  <p style="color:#64748b;font-size:14px">If you're experiencing difficulties, please reply to discuss a payment arrangement — we're happy to work with you.</p>
</div>`,
      body_text: `Hi {{client.name}},\n\nInvoice {{invoice.number}} for {{invoice.amount}} was due on {{invoice.due_date}} and is now overdue.\n\nPlease pay here: {{portal.login_url}}\n\nNeed to discuss? Just reply.`,
      merge_tags: "{{client.name}}, {{invoice.number}}, {{invoice.amount}}, {{invoice.due_date}}, {{portal.login_url}}",
    },
  },
  {
    title: "New Service Added",
    acf: {
      type: "onboarding",
      subject: "You have a new service from BluuHQ",
      body_html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1e293b">
  <h2>A new service has been added to your account</h2>
  <p>Hi {{client.name}},</p>
  <p>We've added a new service to your <strong>{{client.company}}</strong> account. You can view the full details, deliverables, and billing information in your client portal.</p>
  <p>
    <a href="{{portal.login_url}}" style="background:#0f172a;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;font-weight:600">
      View in Portal →
    </a>
  </p>
  <p style="color:#64748b;font-size:14px">Questions about this service? Just reply — we'd love to walk you through it.</p>
</div>`,
      body_text: `Hi {{client.name}},\n\nA new service has been added to your account. View details here: {{portal.login_url}}\n\nQuestions? Just reply.`,
      merge_tags: "{{client.name}}, {{client.company}}, {{portal.login_url}}",
    },
  },
  {
    title: "Monthly Check-in",
    acf: {
      type: "check_in",
      subject: "Quick check-in from BluuHQ",
      body_html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1e293b">
  <h2>Checking in 👋</h2>
  <p>Hi {{client.name}},</p>
  <p>Hope things are going well at <strong>{{client.company}}</strong>! We just wanted to check in and see how everything is going with our work together.</p>
  <p>Do you have any questions, feedback, or things you'd like to discuss? We're always here and happy to hop on a quick call.</p>
  <p>Your portal is always available if you need to review anything: <a href="{{portal.login_url}}">{{portal.login_url}}</a></p>
  <p>Talk soon!</p>
  <p style="color:#64748b;font-size:14px">— The BluuHQ Team</p>
</div>`,
      body_text: `Hi {{client.name}},\n\nJust checking in — how are things going at {{client.company}}?\n\nAny questions or feedback? Just reply to this email.\n\nYour portal: {{portal.login_url}}\n\n— The BluuHQ Team`,
      merge_tags: "{{client.name}}, {{client.company}}, {{portal.login_url}}",
    },
  },
  {
    title: "Thank You",
    acf: {
      type: "general",
      subject: "Thank you, {{client.name}}",
      body_html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1e293b">
  <h2>Thank you</h2>
  <p>Hi {{client.name}},</p>
  <p>We just wanted to take a moment to say a genuine thank you for trusting us with <strong>{{client.company}}</strong>'s work. It means a lot to us.</p>
  <p>We're proud of what we've built together and we're excited about what's ahead. If there's ever anything we can do better or differently, please never hesitate to tell us.</p>
  <p>Here's to continued success — together.</p>
  <p style="color:#64748b;font-size:14px">With gratitude,<br>The BluuHQ Team</p>
</div>`,
      body_text: `Hi {{client.name}},\n\nThank you for trusting us with {{client.company}}'s work. It genuinely means a lot.\n\nWith gratitude,\nThe BluuHQ Team`,
      merge_tags: "{{client.name}}, {{client.company}}",
    },
  },
];

function wpAuthHeader(): string {
  const user = process.env.WP_APP_USERNAME!;
  const pass = process.env.WP_APP_PASSWORD!;
  return `Basic ${Buffer.from(`${user}:${pass}`).toString("base64")}`;
}

export async function POST(req: Request) {
  const authError = await requirePermission(req, "build_sequences");
  if (authError) return authError;

  const wpBase = process.env.WORDPRESS_URL;
  if (!wpBase || !process.env.WP_APP_USERNAME || !process.env.WP_APP_PASSWORD) {
    return NextResponse.json({ error: "WordPress credentials not configured" }, { status: 500 });
  }

  try {
    // Fetch existing templates to skip duplicates
    const existingRes = await fetch(
      `${wpBase}/wp-json/wp/v2/bluu_email_template?per_page=100&status=publish`,
      { headers: { Authorization: wpAuthHeader() } }
    );
    const existing: Array<{ title: { rendered: string } }> = existingRes.ok
      ? await existingRes.json()
      : [];
    const existingTitles = new Set(existing.map((t) => t.title.rendered));

    let created = 0;
    let skipped = 0;

    for (const template of DEFAULT_TEMPLATES) {
      if (existingTitles.has(template.title)) {
        skipped++;
        continue;
      }
      await fetch(`${wpBase}/wp-json/wp/v2/bluu_email_template`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: wpAuthHeader(),
        },
        body: JSON.stringify({ title: template.title, status: "publish", acf: template.acf }),
      });
      created++;
    }

    return NextResponse.json({ created, skipped });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Seed failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
