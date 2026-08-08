import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/apiPermissions";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

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

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requirePermission(req, "view_invoices");
  if (auth instanceof NextResponse) return auth;
  const tenantId = auth.session.user.tenantId!;

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", params.id)
      .eq("tenant_id", tenantId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

    return NextResponse.json({ invoice: mapInvoiceRow(data) });
  } catch (err) {
    console.error("[GET /api/admin/invoices/[id]]", err);
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  let body: {
    markAsPaid?: boolean;
    status?: string;
    lineItems?: { description: string; amount: number }[];
    currency?: string;
    dueDate?: string;
    notes?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Fetch the current invoice first to enforce draft-only field edits. Per-client
  // scoping (canAccessClient) is deferred until team/assignedClients move to
  // Supabase UUIDs — see subscriptions/[id]/route.ts for the same note.
  const preAuth = await requirePermission(req, "view_invoices");
  if (preAuth instanceof NextResponse) return preAuth;
  const tenantId = preAuth.session.user.tenantId!;

  const supabase = createSupabaseAdminClient();
  const { data: current, error: fetchErr } = await supabase
    .from("invoices")
    .select("client_id, status")
    .eq("id", params.id)
    .eq("tenant_id", tenantId)
    .maybeSingle();

  if (fetchErr) {
    console.error("[PATCH /api/admin/invoices/[id]]", fetchErr);
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }
  if (!current) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

  const isFieldEdit = body.lineItems !== undefined || body.currency !== undefined || body.dueDate !== undefined || body.notes !== undefined;
  if (isFieldEdit && current.status !== "draft") {
    return NextResponse.json({ error: "Only draft invoices can be edited" }, { status: 422 });
  }

  const permission = body.markAsPaid ? "mark_invoices_paid" : "create_invoices";
  const auth = await requirePermission(req, permission);
  if (auth instanceof NextResponse) return auth;

  try {
    const patch: Record<string, unknown> = {};
    if (body.status !== undefined) patch.status = body.status;
    if (body.lineItems !== undefined) {
      patch.line_items = body.lineItems;
      patch.total = body.lineItems.reduce((s, i) => s + i.amount, 0);
      patch.subtotal = patch.total;
    }
    if (body.currency !== undefined) patch.currency = body.currency;
    if (body.dueDate !== undefined) patch.due_date = body.dueDate;
    if (body.notes !== undefined) patch.notes = body.notes;

    const { data: updated, error } = await supabase
      .from("invoices")
      .update(patch)
      .eq("id", params.id)
      .eq("tenant_id", tenantId)
      .select("*")
      .single();

    if (error) throw error;
    return NextResponse.json({ invoice: mapInvoiceRow(updated) });
  } catch (err) {
    console.error("[PATCH /api/admin/invoices/[id]]", err);
    return NextResponse.json({ error: "Failed to update invoice" }, { status: 502 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const preAuth = await requirePermission(req, "create_invoices");
  if (preAuth instanceof NextResponse) return preAuth;
  const tenantId = preAuth.session.user.tenantId!;

  try {
    const supabase = createSupabaseAdminClient();
    const { data: current, error: fetchErr } = await supabase
      .from("invoices")
      .select("status")
      .eq("id", params.id)
      .eq("tenant_id", tenantId)
      .maybeSingle();

    if (fetchErr) throw fetchErr;
    if (!current) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    if (current.status !== "draft") {
      return NextResponse.json({ error: "Only draft invoices can be deleted" }, { status: 422 });
    }

    const { error } = await supabase
      .from("invoices")
      .delete()
      .eq("id", params.id)
      .eq("tenant_id", tenantId);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/admin/invoices/[id]]", err);
    return NextResponse.json({ error: "Failed to delete invoice" }, { status: 502 });
  }
}
