import { NextRequest, NextResponse } from "next/server";
import { requireClientSession } from "@/lib/apiPermissions";
import {resolveClientPost, getInvoice} from "@/lib/wp-api";
import { r2SignedUrl } from "@/lib/r2";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireClientSession(req);
  if (auth instanceof NextResponse) return auth;
  const { session } = auth;

  const user = session.user as { wpUserId?: number; clientId?: number | string };
  const wpUserId = user.wpUserId;
  const sessionClientId = user.clientId ? Number(user.clientId) : undefined;
  if (!wpUserId) return NextResponse.json({ error: "No WP user ID" }, { status: 400 });

  const invoiceId = parseInt(params.id, 10);
  if (!invoiceId) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  try {
    const clientPost = await resolveClientPost(sessionClientId, wpUserId);
    if (!clientPost) return NextResponse.json({ error: "Client not found" }, { status: 404 });

    const invoice = await getInvoice(invoiceId);
    if (invoice.acf.inv_client !== clientPost.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const pdfKey = invoice.acf.inv_pdf_url;
    if (!pdfKey) {
      return NextResponse.json({ error: "PDF not yet generated" }, { status: 404 });
    }

    const signedUrl = await r2SignedUrl(pdfKey, 60);
    return NextResponse.json({ signedUrl });
  } catch (err) {
    console.error("[GET /api/portal/invoices/[id]/download]", err);
    return NextResponse.json({ error: "Failed to generate download link" }, { status: 500 });
  }
}
