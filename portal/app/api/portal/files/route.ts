import { NextRequest, NextResponse } from "next/server";
import { requireClientSession } from "@/lib/apiPermissions";
import { listClientFiles } from "@/lib/wp-api";
import { r2SignedUrl } from "@/lib/r2";

export async function GET(req: NextRequest) {
  const auth = await requireClientSession(req);
  if (auth instanceof NextResponse) return auth;
  const { session } = auth;

  const user = session.user as any;
  const clientId = parseInt(user.clientId ?? "0", 10);

  if (!clientId) {
    return NextResponse.json({ files: [] });
  }

  try {
    const { items } = await listClientFiles(clientId);

    // Only expose files with visibility=shared
    const shared = items.filter((f) => f.acf.file_visibility === "shared");

    const files = await Promise.all(
      shared.map(async (f) => {
        let downloadUrl: string | undefined;
        if (f.acf.file_r2_key) {
          try {
            downloadUrl = await r2SignedUrl(f.acf.file_r2_key, 3600);
          } catch {
            downloadUrl = undefined;
          }
        }
        return {
          id: f.id,
          title: f.title.rendered,
          originalName: f.acf.file_original_name,
          mimeType: f.acf.file_mime_type,
          fileSize: f.acf.file_size,
          category: f.acf.file_category,
          description: f.acf.file_description,
          uploadedAt: f.date,
          downloadUrl,
        };
      })
    );

    return NextResponse.json({ files });
  } catch (err) {
    console.error("[GET /api/portal/files]", err);
    return NextResponse.json({ error: "Failed to load files" }, { status: 500 });
  }
}
