import { NextRequest, NextResponse } from "next/server";
import { requireClientSession } from "@/lib/apiPermissions";
import {resolveClientPost, getInvoice, createFilePost} from "@/lib/wp-api";
import { uploadToR2 } from "@/lib/r2";
import { sendEmailHtml } from "@/lib/resend";
import crypto from "crypto";

const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const auth = await requireClientSession(req);
  if (auth instanceof NextResponse) return auth;
  const { session } = auth;

  const user = session.user as {
    wpUserId?: number;
    clientId?: number | string;
    name?: string | null;
    email?: string | null;
  };
  const wpUserId = user.wpUserId;
  const sessionClientId = user.clientId ? Number(user.clientId) : undefined;
  if (!wpUserId) return NextResponse.json({ error: "No WP user ID" }, { status: 400 });

  try {
    const formData = await req.formData();
    const invoiceId = parseInt(formData.get("invoiceId") as string ?? "0", 10);
    const file = formData.get("file") as File | null;

    if (!invoiceId) return NextResponse.json({ error: "invoiceId required" }, { status: 400 });
    if (!file) return NextResponse.json({ error: "file required" }, { status: 400 });
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "File type not allowed. Use PDF or image." }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File exceeds 5MB limit" }, { status: 400 });
    }

    const clientPost = await resolveClientPost(sessionClientId, wpUserId);
    if (!clientPost) return NextResponse.json({ error: "Client not found" }, { status: 404 });

    const invoice = await getInvoice(invoiceId);
    if (invoice.acf.inv_client !== clientPost.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const ext = file.name.split(".").pop() ?? "bin";
    const key = `invoices/${invoiceId}/bank-proof-${crypto.randomUUID()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await uploadToR2(key, buffer, file.type);

    await createFilePost({
      title: `Bank proof — Invoice ${invoice.acf.inv_number}`,
      acf: {
        file_client: clientPost.id,
        file_r2_key: key,
        file_original_name: file.name,
        file_mime_type: file.type,
        file_size: file.size,
        file_category: "invoice",
        file_description: `Bank transfer proof for invoice ${invoice.acf.inv_number}`,
        file_visibility: "internal",
        file_uploaded_by: wpUserId,
      },
    });

    const adminEmail = process.env.ADMIN_EMAIL ?? "hello@bluuhq.com";
    await sendEmailHtml({
      to: adminEmail,
      subject: `Proof of payment uploaded — Invoice ${invoice.acf.inv_number}`,
      html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto">
        <h2>Proof of Payment Uploaded</h2>
        <p><strong>${user.name ?? "A client"}</strong> has uploaded proof of bank transfer payment for invoice <strong>${invoice.acf.inv_number}</strong> (${invoice.acf.inv_currency} ${invoice.acf.inv_total.toLocaleString()}).</p>
        <p>Please verify and mark the invoice as paid in the CRM.</p>
      </div>`,
      text: `${user.name ?? "A client"} has uploaded bank transfer proof for invoice ${invoice.acf.inv_number}.`,
      tags: [{ name: "type", value: "bank_proof_upload" }],
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[POST /api/portal/payments/bank-proof]", err);
    return NextResponse.json({ error: "Failed to upload proof" }, { status: 500 });
  }
}
