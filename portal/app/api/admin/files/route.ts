import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/apiPermissions";
import { listClientFiles } from "@/lib/wp-api";

export async function GET(req: NextRequest) {
  const result = await requireSession(req);
  if (result instanceof NextResponse) return result;

  const { searchParams } = new URL(req.url);
  const clientIdStr = searchParams.get("clientId");

  if (!clientIdStr) {
    return NextResponse.json({ error: "clientId is required" }, { status: 400 });
  }

  const clientId = parseInt(clientIdStr, 10);
  if (isNaN(clientId)) {
    return NextResponse.json({ error: "Invalid clientId" }, { status: 400 });
  }

  try {
    const { items, total, totalPages } = await listClientFiles(clientId);

    const files = items.map((post) => ({
      id:           post.id,
      title:        post.title.rendered,
      description:  post.acf.file_description,
      category:     post.acf.file_category,
      mimeType:     post.acf.file_mime_type,
      fileSize:     post.acf.file_size,
      visibility:   post.acf.file_visibility,
      uploadedBy:   post.acf.file_uploaded_by,
      date:         post.date,
      r2Key:        post.acf.file_r2_key,
      publicUrl:    post.acf.file_public_url,
    }));

    return NextResponse.json({ files, total, totalPages });
  } catch (err) {
    console.error("[GET /api/admin/files]", err);
    return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 });
  }
}
