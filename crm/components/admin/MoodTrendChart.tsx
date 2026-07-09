"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine,
} from "recharts";
import { MessageSquare } from "lucide-react";
import type { BluuCommunication, CommMoodSentiment } from "@/types";
import { format, startOfWeek, addDays } from "date-fns";

const MOOD_SCORES: Record<CommMoodSentiment, number> = {
  positive:  5,
  neutral:   4,
  mixed:     3,
  concerned: 2,
  at_risk:   1,
};

const MOOD_LABELS: Record<number, string> = {
  5: "Positive",
  4: "Neutral",
  3: "Mixed",
  2: "Concerned",
  1: "At Risk",
};

function dotColor(value: number): string {
  if (value >= 4) return "#22c55e";
  if (value >= 3) return "#f59e0b";
  return "#ef4444";
}

function buildWeeklyBuckets(communications: BluuCommunication[]) {
  const now = new Date();
  const cutoff = new Date(now.getTime() - 90 * 86_400_000);
  const weekStart = startOfWeek(cutoff, { weekStartsOn: 1 });

  const buckets: { weekLabel: string; weekStart: Date; scores: number[] }[] = [];
  let cur = weekStart;
  while (cur <= now) {
    buckets.push({ weekLabel: format(cur, "MMM d"), weekStart: new Date(cur), scores: [] });
    cur = addDays(cur, 7);
  }

  for (const c of communications) {
    if (!c.mood) continue;
    const ts = new Date(c.occurredAt || c.date);
    if (ts < cutoff) continue;
    const score = MOOD_SCORES[c.mood] ?? 3;
    const bucketIdx = buckets.findLastIndex(b => ts >= b.weekStart);
    if (bucketIdx >= 0) buckets[bucketIdx].scores.push(score);
  }

  return buckets.map(b => ({
    week: b.weekLabel,
    avg:  b.scores.length ? Math.round((b.scores.reduce((a, s) => a + s, 0) / b.scores.length) * 10) / 10 : null,
    count: b.scores.length,
  }));
}

function CustomDot(props: any) {
  const { cx, cy, payload } = props;
  if (payload.avg === null) return null;
  return (
    <circle cx={cx} cy={cy} r={4} fill={dotColor(payload.avg)} stroke="white" strokeWidth={2} />
  );
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.[0]) return null;
  const { week, avg, count } = payload[0].payload;
  if (avg === null) return null;
  return (
    <div className="bg-white border rounded-lg shadow-md px-3 py-2 text-xs">
      <p className="font-medium text-slate-700 mb-1">{week}</p>
      <p className="text-slate-600">{MOOD_LABELS[Math.round(avg)] ?? "Mixed"} ({avg.toFixed(1)})</p>
      <p className="text-slate-400">{count} communication{count !== 1 ? "s" : ""}</p>
    </div>
  );
}

interface MoodTrendChartProps {
  communications: BluuCommunication[];
}

export function MoodTrendChart({ communications }: MoodTrendChartProps) {
  const data = useMemo(() => buildWeeklyBuckets(communications), [communications]);
  const hasData = data.some(d => d.avg !== null);

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
        <MessageSquare className="h-8 w-8 text-slate-200" />
        <p className="text-sm font-medium text-slate-500">No communications logged yet</p>
        <p className="text-xs text-center max-w-xs">
          Log your first touchpoint to start tracking relationship health.
        </p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis
          dataKey="week"
          tick={{ fontSize: 10, fill: "#94a3b8" }}
          tickLine={false}
          axisLine={false}
          interval={2}
        />
        <YAxis
          domain={[1, 5]}
          ticks={[1, 2, 3, 4, 5]}
          tick={{ fontSize: 10, fill: "#94a3b8" }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={3.5} stroke="#22c55e" strokeDasharray="4 2" strokeWidth={1}
          label={{ value: "Healthy", position: "insideTopRight", fontSize: 9, fill: "#22c55e" }} />
        <ReferenceLine y={2.5} stroke="#ef4444" strokeDasharray="4 2" strokeWidth={1}
          label={{ value: "At Risk", position: "insideTopRight", fontSize: 9, fill: "#ef4444" }} />
        <Line
          type="monotone"
          dataKey="avg"
          stroke="#6366f1"
          strokeWidth={2}
          dot={<CustomDot />}
          activeDot={{ r: 5, fill: "#6366f1" }}
          connectNulls={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
