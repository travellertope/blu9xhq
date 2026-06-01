import { NextRequest, NextResponse } from "next/server";
import { requireClientSession } from "@/lib/apiPermissions";
import {resolveClientPost, createFilePost} from "@/lib/wp-api";
import { uploadFile, ALLOWED_MIME_TYPES } from "@/lib/r2";
import { sendClientFileUploaded } from "@/lib/resend";
import crypto from "crypto";

const ALLOWED = new Set(ALLOWED_MIME_TYPES as readonly string[]);
const MAX_SIZE = 50 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const auth = await requireClientSession(req);
  if (auth instanceof NextResponse) return auth;
  const { session } = auth;

  const user = session.user as { wpUserId?: number; clientId?: number | string; name?: string | null };
  const wpUserId = user.wpUserId;
  const sessionClientId = user.clientId ? Number(user.clientId) : undefined;
  if (!wpUserId) return NextResponse.json({ error: "No WP user ID" }, { status: 400 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const name = (formData.get("name") as string | null)?.trim() || null;
    const category = (formData.get("category") as string | null) ?? "general";
    const description = (formData.get("description") as string | null)?.trim() || undefined;

    if (!file) return NextResponse.json({ error: "file required" }, { status: 400 });
    if (!ALLOWED.has(file.type)) return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
    if (file.size > MAX_SIZE) return NextResponse.json({ error: "File exceeds 50MB limit" }, { status: 400 });

    const clientPost = await resolveClientPost(sessionClientId, wpUserId);
    if (!clientPost) return NextResponse.json({ error: "Client not found" }, { status: 404 });

    const sanitised = file.name.toLowerCase().replace(/[^a-z0-9.]/g, "-").replace(/-+/g, "-");
    const key = "clients/" + clientPost.id + "/uploads/" + crypto.randomUUID() + "-" + sanitised;
    const buffer = Buffer.from(await file.arrayBuffer());
    const publicUrl = await uploadFile(key, buffer, file.type);

    const filePost = await createFilePost({
      title: name ?? file.name,
      acf: {
        file_client: clientPost.id,
        file_r2_key: key,
        file_original_name: file.name,
        file_mime_type: file.type,
        file_size: file.size,
        file_category: category,
        file_description: description,
        file_visibility: "shared",
        file_uploaded_by: wpUserId,
        file_public_url: publicUrl,
      },
    });

    const adminEmail = process.env.ADMIN_EMAIL ?? "hello@bluuhq.com";
    const adminCrmUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "") + "/admin/clients/" + clientPost.id + "/files";
    void sendClientFileUploaded(adminEmail, {
      clientName: user.name ?? clientPost.acf.contact_name,
      fileName: file.name,
      adminCrmUrl,
    });

    return NextResponse.json({
      id: filePost.id,
      name: filePost.title.rendered,
      originalName: file.name,
      mimeType: file.type,
      fileSize: file.size,
      category,
      description,
      uploadedAt: filePost.date,
    });
  } catch (err) {
    console.error("[POST /api/portal/files/upload]", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
