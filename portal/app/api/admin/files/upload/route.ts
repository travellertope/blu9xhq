import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/apiPermissions";
import { ALLOWED_MIME_TYPES, uploadFile, generateFileKey } from "@/lib/r2";
import { createFilePost, getClientPost } from "@/lib/wp-api";
import { sendFileShared } from "@/lib/resend";
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
      void getClientPost(clientId)
        .then((clientPost) => {
          const clientEmail = clientPost.acf.portal_email ?? clientPost.acf.contact_email;
          const clientName  = clientPost.acf.contact_name || clientPost.title.rendered;
          if (!clientEmail) return;
          return sendFileShared(clientEmail, {
            clientName,
            fileName:     name,
            fileCategory: category,
            sharedBy:     user.name ?? "BluuHQ",
            portalUrl:    `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/portal/files`,
          });
        })
        .catch((err) => console.error("[upload] sendFileShared failed:", err));
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
