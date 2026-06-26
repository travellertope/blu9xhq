import { NextResponse } from "next/server";
import { getAllScheduledEmails, getSchedule, getUserScanIds, getScan } from "@/lib/redis";
import { sendScoreAlert } from "@/lib/email/send-alert";

// Triggered daily by a QStash cron schedule. Compares each scheduled user's
// two most recent completed scans and emails them if the delta crosses
// their alert threshold.
export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  const provided = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!secret || provided !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const emails = await getAllScheduledEmails();
  let alerted = 0;

  for (const email of emails) {
    const schedule = await getSchedule(email);
    if (!schedule) continue;

    const ids = await getUserScanIds(email, 2);
    if (ids.length < 2) continue;

    const [latest, previous] = await Promise.all(ids.map((id) => getScan(id)));
    if (!latest || !previous || latest.status !== "complete" || previous.status !== "complete") continue;

    const delta = Math.abs(latest.scores.overall - previous.scores.overall);
    if (delta < schedule.alertThreshold) continue;

    try {
      await sendScoreAlert(email, schedule.domain, previous.scores.overall, latest.scores.overall, latest.id);
      alerted += 1;
    } catch {
      // Email failure shouldn't break the loop for other users
    }
  }

  return NextResponse.json({ alerted });
}
