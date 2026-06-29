import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { setSchedule, removeSchedule, getSchedule, getUser } from "@/lib/redis";
import { TIER_SCHEDULE_FREQUENCIES } from "@/lib/stripe";

const ScheduleSchema = z.object({
  domain: z.string().min(1),
  frequency: z.enum(["weekly", "daily"]),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ schedule: await getSchedule(email) });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = ScheduleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation_error", message: parsed.error.issues[0]?.message },
      { status: 400 }
    );
  }

  const user = await getUser(email);
  const allowedFrequencies = TIER_SCHEDULE_FREQUENCIES[user?.tier || "free"];
  if (allowedFrequencies.length === 0) {
    return NextResponse.json(
      { error: "forbidden", message: "Scheduled re-scans require the Monitor plan or higher." },
      { status: 403 }
    );
  }
  if (!allowedFrequencies.includes(parsed.data.frequency)) {
    return NextResponse.json(
      { error: "forbidden", message: "Daily re-scans require the Monitor Pro plan." },
      { status: 403 }
    );
  }

  await setSchedule(email, parsed.data.domain, parsed.data.frequency);
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  await removeSchedule(email);
  return NextResponse.json({ ok: true });
}
