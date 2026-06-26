import { NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import {
  getAllScheduledEmails,
  getSchedule,
  markScheduleRun,
  addScanToUserIndex,
} from "@/lib/redis";
import { createScanId, initScan, runScan } from "@/lib/scan/engine";
import type { ScanInput } from "@/lib/scan/types";

export const maxDuration = 300;

// Triggered by a QStash cron schedule (or any external scheduler) hitting
// this route hourly. Guarded by a shared secret since there's no session —
// the caller isn't a logged-in user, it's the job runner.
export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  const provided = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!secret || provided !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const emails = await getAllScheduledEmails();
  const now = Date.now();
  let triggered = 0;

  for (const email of emails) {
    const schedule = await getSchedule(email);
    if (!schedule) continue;
    if (new Date(schedule.nextRunAt).getTime() > now) continue;

    const input: ScanInput = { domain: schedule.domain, noSite: false };
    const id = createScanId();
    await initScan(id, input);
    waitUntil(
      runScan(id, input)
        .then(() => addScanToUserIndex(email, id))
        .catch(() => {})
    );

    await markScheduleRun(email, schedule.frequency);
    triggered += 1;
  }

  return NextResponse.json({ triggered });
}
