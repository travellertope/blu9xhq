import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/apiPermissions";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { logAuditEvent, AUDIT_ACTIONS } from "@/lib/auditLog";

function mapInvoiceRow(row: any) {
  return {
    id:             row.id,
    number:         row.invoice_number,
    clientId:       row.client_id,
    subscriptionId: row.subscription_id ?? undefined,
    total:          row.total,
    currency:       row.currency,
    status:         row.status,
    dueDate:        row.due_date,
    issuedDate:     row.issued_date,
    paidAt:         row.paid_date ?? undefined,
    paymentMethod:  row.payment_method ?? undefined,
    notes:          row.notes ?? undefined,
    pdfUrl:         row.pdf_url ?? undefined,
    lineItems:      row.line_items ?? [],
  };
}

export async function GET(req: NextRequest) {
  const auth = await requirePermission(req, "view_invoices");
  if (auth instanceof NextResponse) return auth;
  const { session } = auth;
  const tenantId = session.user.tenantId!;

  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId") ?? undefined;
  const status   = searchParams.get("status") ?? undefined;
  const dateFrom = searchParams.get("dateFrom") ?? undefined;
  const dateTo   = searchParams.get("dateTo") ?? undefined;
  const currency = searchParams.get("currency") ?? undefined;
  const page     = parseInt(searchParams.get("page") ?? "1", 10);
  const perPage  = 20;

  try {
    const supabase = createSupabaseServerClient();
    let query = supabase
      .from("invoices")
      .select("*", { count: "exact" })
      .eq("tenant_id", tenantId);

    if (clientId) query = query.eq("client_id", clientId);
    if (status)   query = query.eq("status", status);
    if (currency) query = query.eq("currency", currency);
    if (dateFrom) query = query.gte("due_date", dateFrom);
    if (dateTo)   query = query.lte("due_date", dateTo);

    const from = (page - 1) * perPage;
    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(from, from + perPage - 1);

    if (error) throw error;

    const total = count ?? 0;
    return NextResponse.json({
      invoices: (data ?? []).map(mapInvoiceRow),
      total,
      totalPages: Math.max(Math.ceil(total / perPage), 1),
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
  const tenantId = user.tenantId!;

  let body: {
    clientId: string;
    subscriptionId?: string;
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
    const supabase = createSupabaseServerClient();

    // Auto-generate invoice number
    const { count } = await supabase
      .from("invoices")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantId);
    const invNumber = `BLU-${new Date().getFullYear()}-${String((count ?? 0) + 1).padStart(4, "0")}`;

    const lineTotal = body.lineItems.reduce((sum, item) => sum + item.amount, 0);
    const today = new Date().toISOString().split("T")[0];

    const { data: inserted, error } = await supabase
      .from("invoices")
      .insert({
        tenant_id:       tenantId,
        client_id:       body.clientId,
        subscription_id: body.subscriptionId || null,
        invoice_number:  invNumber,
        line_items:      body.lineItems,
        subtotal:        lineTotal,
        total:           lineTotal,
        currency:        body.currency,
        status:          "draft",
        due_date:        body.dueDate,
        issued_date:     today,
        notes:           body.notes || null,
      })
      .select("*")
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "Invoice number collision, please retry" }, { status: 409 });
      }
      throw error;
    }

    await logAuditEvent({
      action: AUDIT_ACTIONS.INVOICE_CREATED,
      actorName: user.name ?? "Unknown",
      actorWpUserId: user.wpUserId ?? 0,
      detail: `Created invoice ${invNumber} for client ${body.clientId}`,
      clientId: body.clientId as unknown as number,
    });

    return NextResponse.json({ invoice: mapInvoiceRow(inserted) }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/admin/invoices]", err);
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 502 });
  }
}
