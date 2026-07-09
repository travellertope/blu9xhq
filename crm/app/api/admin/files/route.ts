import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/apiPermissions";
import { listClientFiles, listAllFiles, getClientPost } from "@/lib/wp-api";

export async function GET(req: NextRequest) {
  const result = await requireSession(req);
  if (result instanceof NextResponse) return result;

  const { searchParams } = new URL(req.url);
  const clientIdStr = searchParams.get("clientId");
  const page = parseInt(searchParams.get("page") ?? "1", 10);

  try {
    let items, total, totalPages;

    if (clientIdStr) {
      const clientId = parseInt(clientIdStr, 10);
      if (isNaN(clientId)) return NextResponse.json({ error: "Invalid clientId" }, { status: 400 });
      ({ items, total, totalPages } = await listClientFiles(clientId));
      // Defensive post-filter: guards against WP meta_key query being ignored
      // when ACF show_in_rest is not configured. Once configured, this strictly
      // enforces that only files belonging to this client are returned.
      items = items.filter(
        p => !p.acf?.file_client || Number(p.acf.file_client) === clientId
      );
    } else {
      ({ items, total, totalPages } = await listAllFiles({ per_page: 50, page }));
    }

    // Enrich with clientName when returning a global (all-clients) list
    const files = await Promise.all(
      items.map(async (post) => {
        let clientName: string | null = null;
        if (!clientIdStr) {
          await getClientPost(post.acf.file_client)
            .then((c) => { clientName = c.acf.company_name || c.acf.contact_name; })
            .catch(() => undefined);
        }
        return {
          id:           post.id,
          title:        post.title.rendered,
          clientId:     post.acf.file_client,
          clientName,
          description:  post.acf.file_description,
          category:     post.acf.file_category,
          mimeType:     post.acf.file_mime_type,
          fileSize:     post.acf.file_size,
          visibility:   post.acf.file_visibility,
          uploadedBy:   post.acf.file_uploaded_by,
          date:         post.date,
          r2Key:        post.acf.file_r2_key,
          publicUrl:    post.acf.file_public_url,
        };
      })
    );

    return NextResponse.json({ files, total, totalPages, page });
  } catch (err) {
    console.error("[GET /api/admin/files]", err);
    return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 });
  }
}
