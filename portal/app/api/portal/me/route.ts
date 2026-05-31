import { NextRequest, NextResponse } from "next/server";
import { requireClientSession } from "@/lib/apiPermissions";
import { getClientPost } from "@/lib/wp-api";

export async function GET(req: NextRequest) {
  const auth = await requireClientSession(req);
  if (auth instanceof NextResponse) return auth;
  const { session } = auth;

  const user = session.user as any;
  const clientId = parseInt(user.clientId ?? "0", 10);

  if (!clientId) {
    return NextResponse.json({ error: "No client profile linked" }, { status: 404 });
  }

  try {
    const clientPost = await getClientPost(clientId);
    return NextResponse.json({
      id: clientPost.id,
      name: user.name,
      email: user.email,
      companyName: clientPost.acf.company_name,
      companyWebsite: clientPost.acf.company_website,
      industry: clientPost.acf.industry,
      status: clientPost.acf.status,
      tags: clientPost.acf.tags
        ? clientPost.acf.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
        : [],
      memberSince: clientPost.date,
    });
  } catch (err) {
    console.error("[GET /api/portal/me]", err);
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}
