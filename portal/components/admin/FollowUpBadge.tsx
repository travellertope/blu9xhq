"use client";

import { useEffect, useState } from "react";
import type { BluuCommunication } from "@/types";

interface Props {
  clientId: number;
}

export function FollowUpBadge({ clientId }: Props) {
  const [openCount, setOpenCount]   = useState(0);
  const [overdueCount, setOverdueCount] = useState(0);

  useEffect(() => {
    fetch(`/api/admin/communications?clientId=${clientId}&followUpOnly=true`)
      .then(r => r.ok ? r.json() : { entries: [] })
      .then(data => {
        const entries: BluuCommunication[] = data.entries ?? [];
        const now = Date.now();
        const open    = entries.filter(e => e.followUpNeeded && !e.followUpCompleted);
        const overdue = open.filter(e => e.followUpDue && new Date(e.followUpDue).getTime() < now);
        setOpenCount(open.length);
        setOverdueCount(overdue.length);
      })
      .catch(() => {});
  }, [clientId]);

  if (openCount === 0) return null;

  if (overdueCount > 0) {
    return (
      <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
        {overdueCount} overdue
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
      {openCount} follow-up{openCount !== 1 ? "s" : ""}
    </span>
  );
}
