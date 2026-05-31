import { NextRequest, NextResponse } from "next/server";
import { requireSession, requirePermission } from "@/lib/apiPermissions";
import { listInvoices, createInvoice, type WPInvoicePost } from "@/lib/wp-api";
import { logAuditEvent, AUDIT_ACTIONS } from "@/lib/auditLog";

function mapInvoice(post: WPInvoicePost) {
  return {
    id: post.id,
    number: post.acf.inv_number,
    clientId: post.acf.inv_client,
    subscriptionId: post.acf.inv_subscription,
    total: post.acf.inv_total,
    currency: post.acf.inv_currency,
    status: post.acf.inv_status,
    dueDate: post.acf.inv_due_date,
    issuedDate: post.acf.inv_issued_date,
    paidAt: post.acf.inv_paid_at,
    paymentMethod: post.acf.inv_payment_method,
    notes: post.acf.inv_notes,
    pdfUrl: post.acf.inv_pdf_url,
    lineItems: (() => {
      try {
        return JSON.parse(post.acf.inv_line_items ?? "[]");
      } catch {
        return [];
      }
    })(),
  };
}

export async function GET(req: NextRequest) {
  const auth = await requireSession(req);
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId") ? parseInt(searchParams.get("clientId")!, 10) : undefined;
  const status = searchParams.get("status") ?? undefined;
  const dateFrom = searchParams.get("dateFrom") ?? undefined;
  const dateTo = searchParams.get("dateTo") ?? undefined;
  const currency = searchParams.get("currency") ?? undefined;
  const page = parseInt(searchParams.get("page") ?? "1", 10);

  try {
    const result = await listInvoices({ page, per_page: 20, clientId, status, dateFrom, dateTo, currency });
    return NextResponse.json({
      invoices: result.items.map(mapInvoice),
      total: result.total,
      totalPages: result.totalPages,
    });
  } catch (err) {
    console.error("[GET /api/admin/invoices]", err);
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 502 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requirePermission(req, "create_invoices");
  if (auth instanceof NextResponse) return auth;
  const { session } = auth;
  const user = session.user as any;

  let body: {
    clientId: number;
    subscriptionId?: number;
    lineItems: { description: string; amount: number }[];
    currency: string;
    dueDate: string;
    notes?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.clientId || !body.lineItems?.length || !body.currency || !body.dueDate) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    // Auto-generate invoice number
    const countResult = await listInvoices({ per_page: 1 });
    const total = countResult.total;
    const invNumber = `BLU-${new Date().getFullYear()}-${String(total + 1).padStart(4, "0")}`;

    const lineTotal = body.lineItems.reduce((sum, item) => sum + item.amount, 0);
    const today = new Date().toISOString().split("T")[0];

    const invoice = await createInvoice({
      title: invNumber,
      acf: {
        inv_client: body.clientId,
        inv_subscription: body.subscriptionId,
        inv_number: invNumber,
        inv_line_items: JSON.stringify(body.lineItems),
        inv_total: lineTotal,
        inv_currency: body.currency,
        inv_status: "draft",
        inv_due_date: body.dueDate,
        inv_issued_date: today,
        inv_notes: body.notes,
      },
    });

    await logAuditEvent({
      action: AUDIT_ACTIONS.INVOICE_CREATED,
      actorName: user.name ?? "Unknown",
      actorWpUserId: user.wpUserId ?? 0,
      detail: `Created invoice ${invNumber} for client ${body.clientId}`,
      clientId: body.clientId,
    });

    return NextResponse.json({ invoice: mapInvoice(invoice) }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/admin/invoices]", err);
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 502 });
  }
}
