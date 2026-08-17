import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/apiPermissions";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { ALLOWED_MIME_TYPES, uploadFile, generateFileKey } from "@/lib/r2";
import { CATEGORY_TO_DB, mapFileRow } from "@/lib/files";
import { sendFileShared } from "@/lib/resend";
import { logAuditEvent, AUDIT_ACTIONS } from "@/lib/auditLog";

export async function POST(req: NextRequest) {
  // Note: per-client scoping for upload_manage_files is deferred — see
  // subscriptions/[id]/route.ts comment on canAccessClient/assignedClients.
  const result = await requirePermission(req, "upload_manage_files");
  if (result instanceof NextResponse) return result;
  const { session } = result;
  const user = session.user as any;
  const tenantId = user.tenantId!;

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const clientId = formData.get("clientId") as string | null;
  if (!clientId) {
    return NextResponse.json({ error: "clientId is required" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }

  const name        = (formData.get("name") as string | null) ?? file.name;
  const category    = (formData.get("category") as string | null) ?? "general";
  const description = formData.get("description") as string | null;
  const visibility  = (formData.get("visibility") as string | null) ?? "internal";
  const subscriptionId = (formData.get("subscriptionId") as string | null) || null;

  // Validate MIME type
  if (!(ALLOWED_MIME_TYPES as readonly string[]).includes(file.type)) {
    return NextResponse.json({ error: `File type ${file.type} is not allowed` }, { status: 400 });
  }

  // Validate size (50MB)
  if (file.size > 50 * 1024 * 1024) {
    return NextResponse.json({ error: "File exceeds 50MB limit" }, { status: 400 });
  }

  try {
    const supabase = createSupabaseAdminClient();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const key = generateFileKey(tenantId, clientId, file.name);
    await uploadFile(key, buffer, file.type);

    const { data: inserted, error } = await supabase
      .from("files")
      .insert({
        tenant_id:            tenantId,
        client_id:            clientId,
        title:                name,
        description:          description || null,
        category:             CATEGORY_TO_DB[category] ?? "other",
        r2_key:               key,
        r2_bucket:            process.env.R2_BUCKET_NAME ?? "",
        mime_type:            file.type,
        file_size:            file.size,
        original_name:        file.name,
        is_visible_to_client: visibility === "shared",
        uploaded_by:          user.id,
        subscription_id:      subscriptionId,
      })
      .select("*")
      .single();

    if (error) throw error;

    // If shared, send notification email to client
    if (visibility === "shared") {
      void (async () => {
        try {
          const { data: client } = await supabase
            .from("clients")
            .select("contact_name, company_name, contact_email, portal_email")
            .eq("id", clientId)
            .maybeSingle();
          if (!client) return;
          const clientEmail = client.portal_email ?? client.contact_email;
          const clientName  = client.contact_name || client.company_name;
          if (!clientEmail) return;
          await sendFileShared(clientEmail, {
            clientName,
            fileName:     name,
            fileCategory: category,
            sharedBy:     user.name ?? "BluuHQ",
            portalUrl:    `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/portal/files`,
          });
        } catch (err) {
          console.error("[upload] sendFileShared failed:", err);
        }
      })();
    }

    await logAuditEvent({
      action:    AUDIT_ACTIONS.FILE_UPLOADED,
      actorName: user.name ?? "Unknown",
      detail:    `Uploaded file: ${name} (${category}, ${visibility})`,
      clientId,
    });

    return NextResponse.json({ file: mapFileRow(inserted) }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/admin/files/upload]", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
