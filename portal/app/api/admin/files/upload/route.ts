import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/apiPermissions";
import { ALLOWED_MIME_TYPES, uploadFile, generateFileKey } from "@/lib/r2";
import { createFilePost, getClientPost } from "@/lib/wp-api";
import { sendEmail } from "@/lib/resend";
import { logAuditEvent, AUDIT_ACTIONS } from "@/lib/auditLog";

export async function POST(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const clientIdStr = formData.get("clientId") as string | null;
  if (!clientIdStr) {
    return NextResponse.json({ error: "clientId is required" }, { status: 400 });
  }
  const clientId = parseInt(clientIdStr, 10);
  if (isNaN(clientId)) {
    return NextResponse.json({ error: "Invalid clientId" }, { status: 400 });
  }

  const result = await requirePermission(req, "upload_manage_files", clientId);
  if (result instanceof NextResponse) return result;
  const { session } = result;
  const user = session.user as any;

  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }

  const name        = (formData.get("name") as string | null) ?? file.name;
  const category    = (formData.get("category") as string | null) ?? "general";
  const description = formData.get("description") as string | null;
  const visibility  = (formData.get("visibility") as string | null) ?? "internal";
  const subscriptionIdStr = formData.get("subscriptionId") as string | null;
  const subscriptionId = subscriptionIdStr ? parseInt(subscriptionIdStr, 10) : undefined;

  // Validate MIME type
  if (!(ALLOWED_MIME_TYPES as readonly string[]).includes(file.type)) {
    return NextResponse.json({ error: `File type ${file.type} is not allowed` }, { status: 400 });
  }

  // Validate size (50MB)
  if (file.size > 50 * 1024 * 1024) {
    return NextResponse.json({ error: "File exceeds 50MB limit" }, { status: 400 });
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const key = generateFileKey(clientId, file.name);
    const publicUrl = await uploadFile(key, buffer, file.type);

    const filePost = await createFilePost({
      title: name,
      acf: {
        file_client:        clientId,
        file_r2_key:        key,
        file_original_name: file.name,
        file_mime_type:     file.type,
        file_size:          file.size,
        file_category:      category,
        file_description:   description ?? undefined,
        file_visibility:    visibility,
        file_uploaded_by:   user.wpUserId ?? 0,
        file_subscription_id: subscriptionId,
        file_public_url:    publicUrl,
      },
    });

    // If shared, send notification email to client
    if (visibility === "shared") {
      try {
        const clientPost = await getClientPost(clientId);
        const clientEmail = clientPost.acf.portal_email ?? clientPost.acf.contact_email;
        const clientName  = clientPost.acf.contact_name || clientPost.title.rendered;
        if (clientEmail) {
          await sendEmail({
            to:      clientEmail,
            subject: "A new file has been shared with you",
            html: `
              <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
                <h2>New file shared</h2>
                <p>Hi ${clientName},</p>
                <p>A new file has been shared with you on your client portal:</p>
                <p style="background:#f8fafc;padding:12px 16px;border-radius:6px;font-weight:600">${name}</p>
                <p>Log in to your portal to view and download it.</p>
                <p style="color:#64748b;font-size:13px">Category: ${category}</p>
              </div>
            `,
            text: `Hi ${clientName},\n\nA new file has been shared with you: ${name}\n\nLog in to your portal to view it.`,
            tags: [{ name: "type", value: "file_shared" }],
          });
        }
      } catch (emailErr) {
        console.error("[upload] Failed to send file notification email:", emailErr);
      }
    }

    await logAuditEvent({
      action:        AUDIT_ACTIONS.FILE_UPLOADED,
      actorName:     user.name ?? "Unknown",
      actorWpUserId: user.wpUserId ?? 0,
      detail:        `Uploaded file: ${name} (${category}, ${visibility})`,
      clientId,
    });

    return NextResponse.json({ file: filePost }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/admin/files/upload]", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
