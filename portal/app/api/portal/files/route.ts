import { NextRequest, NextResponse } from "next/server";
import { requireClientSession } from "@/lib/apiPermissions";
import { findClientByWpUserId, listClientFiles } from "@/lib/wp-api";

export async function GET(req: NextRequest) {
  const auth = await requireClientSession(req);
  if (auth instanceof NextResponse) return auth;
  const { session } = auth;

  const user = session.user as { wpUserId?: number };
  const wpUserId = user.wpUserId;
  if (!wpUserId) return NextResponse.json({ sharedByBluuHQ: [], sharedByClient: [] });

  try {
    const clientPost = await findClientByWpUserId(wpUserId);
    if (!clientPost) return NextResponse.json({ sharedByBluuHQ: [], sharedByClient: [] });

    const { items } = await listClientFiles(clientPost.id);
    const shared = items.filter((f) => f.acf.file_visibility === "shared");

    const format = (f: typeof items[0]) => ({
      id: f.id,
      name: f.title.rendered,
      originalName: f.acf.file_original_name,
      mimeType: f.acf.file_mime_type,
      fileSize: f.acf.file_size,
      category: f.acf.file_category,
      description: f.acf.file_description,
      uploadedAt: f.date,
      uploadedBy: f.acf.file_uploaded_by,
    });

    const sharedByBluuHQ = shared
      .filter((f) => f.acf.file_uploaded_by !== wpUserId)
      .map(format);
    const sharedByClient = shared
      .filter((f) => f.acf.file_uploaded_by === wpUserId)
      .map(format);

    return NextResponse.json({ sharedByBluuHQ, sharedByClient });
  } catch (err) {
    console.error("[GET /api/portal/files]", err);
    return NextResponse.json({ error: "Failed to load files" }, { status: 500 });
  }
}
