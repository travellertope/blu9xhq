import { NextRequest, NextResponse } from "next/server";
import { requireSession, requirePermission } from "@/lib/apiPermissions";
import { getInvoice, updateInvoice, wpRestFetch, type WPInvoicePost } from "@/lib/wp-api";

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

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireSession(req);
  if (auth instanceof NextResponse) return auth;

  const postId = parseInt(params.id, 10);
  if (isNaN(postId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    const invoice = await getInvoice(postId);
    return NextResponse.json({ invoice: mapInvoice(invoice) });
  } catch (err) {
    console.error("[GET /api/admin/invoices/[id]]", err);
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const postId = parseInt(params.id, 10);
  if (isNaN(postId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

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

  // Fetch the current invoice to get clientId and enforce draft-only field edits
  let clientId: number;
  let currentStatus: string;
  try {
    const current = await getInvoice(postId);
    clientId = current.acf.inv_client;
    currentStatus = current.acf.inv_status;
  } catch {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  const isFieldEdit = body.lineItems !== undefined || body.currency !== undefined || body.dueDate !== undefined || body.notes !== undefined;
  if (isFieldEdit && currentStatus !== "draft") {
    return NextResponse.json({ error: "Only draft invoices can be edited" }, { status: 422 });
  }

  const permission = body.markAsPaid ? "mark_invoices_paid" : "create_invoices";
  const auth = await requirePermission(req, permission, clientId);
  if (auth instanceof NextResponse) return auth;

  try {
    const patch: Record<string, unknown> = {};
    if (body.status !== undefined) patch.inv_status = body.status;
    if (body.lineItems !== undefined) {
      patch.inv_line_items = JSON.stringify(body.lineItems);
      patch.inv_total = body.lineItems.reduce((s, i) => s + i.amount, 0);
    }
    if (body.currency !== undefined) patch.inv_currency = body.currency;
    if (body.dueDate !== undefined) patch.inv_due_date = body.dueDate;
    if (body.notes !== undefined) patch.inv_notes = body.notes;

    const updated = await updateInvoice(postId, { acf: patch });
    return NextResponse.json({ invoice: mapInvoice(updated) });
  } catch (err) {
    console.error("[PATCH /api/admin/invoices/[id]]", err);
    return NextResponse.json({ error: "Failed to update invoice" }, { status: 502 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const postId = parseInt(params.id, 10);
  if (isNaN(postId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  let clientId: number;
  try {
    const current = await getInvoice(postId);
    if (current.acf.inv_status !== "draft") {
      return NextResponse.json({ error: "Only draft invoices can be deleted" }, { status: 422 });
    }
    clientId = current.acf.inv_client;
  } catch {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  const auth = await requirePermission(req, "create_invoices", clientId);
  if (auth instanceof NextResponse) return auth;

  try {
    await wpRestFetch(`/wp/v2/bluu_invoice/${postId}?force=true`, { method: "DELETE" });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/admin/invoices/[id]]", err);
    return NextResponse.json({ error: "Failed to delete invoice" }, { status: 502 });
  }
}
