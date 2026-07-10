import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/apiPermissions";
import { wpRestList, getClientPost, type WPCommunicationPost } from "@/lib/wp-api";

export async function GET(req: NextRequest) {
  const auth = await requireSession(req);
  if (auth instanceof NextResponse) return auth;

  const sp      = new URL(req.url).searchParams;
  const page    = Math.max(1, parseInt(sp.get("page")    ?? "1",  10));
  const perPage = Math.min(50, parseInt(sp.get("perPage") ?? "20", 10));
  const search  = (sp.get("search") ?? "").toLowerCase().trim();

  try {
    // WP REST only supports one meta filter at a time — fetch by channel, filter direction in JS
    const result = await wpRestList<WPCommunicationPost>("/wp/v2/bluu_communication", {
      per_page: 100,
      status:   "publish",
      meta_key:   "comm_channel",
      meta_value: "email",
      orderby:    "date",
      order:      "desc",
    });

    let items = result.items.filter(
      (p) => (p.acf?.comm_direction ?? "") === "outbound"
    );

    if (search) {
      items = items.filter(
        (p) =>
          (p.acf?.comm_subject ?? "").toLowerCase().includes(search) ||
          (p.acf?.comm_content ?? "").toLowerCase().includes(search)
      );
    }

    const total      = items.length;
    const totalPages = Math.ceil(total / perPage) || 1;
    const paged      = items.slice((page - 1) * perPage, page * perPage);

    // Resolve unique client IDs → names (uses 30s cache from getClientPost)
    const uniqueClientIds = Array.from(
      new Set(paged.map((p) => p.acf?.comm_client).filter(Boolean) as number[])
    );
    const clientMap = new Map<number, string>();
    await Promise.all(
      uniqueClientIds.map(async (id) => {
        try {
          const c = await getClientPost(id);
          clientMap.set(id, c.acf.company_name || c.acf.contact_name || `Client #${id}`);
        } catch {
          clientMap.set(id, `Client #${id}`);
        }
      })
    );

    const entries = paged.map((p) => {
      const clientId = p.acf?.comm_client ?? 0;
      const rawContent = p.acf?.comm_content ?? "";
      return {
        id:          p.id,
        sentAt:      p.acf?.comm_occurred_at || p.date,
        clientId,
        clientName:  clientMap.get(clientId) ?? `Client #${clientId}`,
        subject:     p.acf?.comm_subject  ?? "(no subject)",
        preview:     rawContent.replace(/<[^>]+>/g, "").slice(0, 160).trim(),
        emailStatus: p.acf?.comm_email_status ?? "sent",
        loggedBy:    p.acf?.comm_logged_by ?? 0,
      };
    });

    return NextResponse.json({ entries, total, totalPages, page });
  } catch (err: unknown) {
    console.error("[GET /api/admin/email/sent-log]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 502 }
    );
  }
}
