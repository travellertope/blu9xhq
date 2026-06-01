import { NextRequest, NextResponse } from "next/server";
import { getClientPost, getUserByEmail, wpRestFetch } from "@/lib/wp-api";
import { sendFileShared } from "@/lib/resend";
import type { WPFilePost } from "@/lib/wp-api";

export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("Authorization");
  if (secret && auth !== "Bearer " + secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { fileId?: number; clientId?: number };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }

  const { fileId, clientId } = body;
  if (!fileId || !clientId) return NextResponse.json({ error: "fileId and clientId required" }, { status: 400 });

  try {
    const [filePost, clientPost] = await Promise.all([
      wpRestFetch<WPFilePost>("/wp/v2/bluu_file/" + fileId),
      getClientPost(clientId),
    ]);

    if (filePost.acf.file_visibility !== "shared") {
      return NextResponse.json({ error: "File is not shared" }, { status: 400 });
    }

    const wpUser = await getUserByEmail(clientPost.acf.portal_email ?? "").catch(() => null);
    const prefs: string[] = Array.isArray(wpUser?.meta?.notification_preferences)
      ? wpUser!.meta.notification_preferences as string[]
      : ["invoice_reminders", "new_files", "service_updates"];
    if (!prefs.includes("new_files")) {
      return NextResponse.json({ messageId: null, skipped: true });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
    const { messageId } = await sendFileShared(clientPost.acf.portal_email, {
      clientName: clientPost.acf.contact_name,
      fileName: filePost.acf.file_original_name,
      fileCategory: filePost.acf.file_category,
      sharedBy: "BluuHQ",
      portalUrl: appUrl + "/portal/files",
    });

    return NextResponse.json({ messageId });
  } catch (err) {
    console.error("[notifications/file-shared]", err);
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 });
  }
}
