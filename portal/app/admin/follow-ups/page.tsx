"use client";

import { withPermission } from "@/components/shared/PermissionGuard";
import { usePermissions } from "@/hooks/usePermissions";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { format, parseISO, isToday, isFuture, isPast, differenceInDays } from "date-fns";
import type { BluuCommunication } from "@/types";

type TabId = "overdue" | "due_today" | "upcoming" | "all_open" | "completed";

const TABS: { id: TabId; label: string }[] = [
  { id: "overdue",    label: "Overdue" },
  { id: "due_today",  label: "Due Today" },
  { id: "upcoming",   label: "Upcoming" },
  { id: "all_open",   label: "All Open" },
  { id: "completed",  label: "Completed" },
];

function filterByTab(entries: BluuCommunication[], tab: TabId): BluuCommunication[] {
  const now = new Date();
  switch (tab) {
    case "overdue":
      return entries.filter(e =>
        e.followUpNeeded && !e.followUpCompleted &&
        e.followUpDue && isPast(parseISO(e.followUpDue)) && !isToday(parseISO(e.followUpDue))
      );
    case "due_today":
      return entries.filter(e =>
        e.followUpNeeded && !e.followUpCompleted &&
        e.followUpDue && isToday(parseISO(e.followUpDue))
      );
    case "upcoming":
      return entries.filter(e =>
        e.followUpNeeded && !e.followUpCompleted &&
        e.followUpDue && isFuture(parseISO(e.followUpDue)) && !isToday(parseISO(e.followUpDue))
      );
    case "all_open":
      return entries.filter(e => e.followUpNeeded && !e.followUpCompleted);
    case "completed":
      return entries.filter(e => e.followUpCompleted);
  }
}

const EMPTY_MESSAGES: Record<TabId, string> = {
  overdue:   "No overdue follow-ups",
  due_today: "No follow-ups due today",
  upcoming:  "No upcoming follow-ups",
  all_open:  "No open follow-ups",
  completed: "No completed follow-ups",
};

function FollowUpsPage() {
  const { can } = usePermissions();
  const [allEntries, setAllEntries] = useState<BluuCommunication[]>([]);
  const [loading, setLoading]       = useState(true);
  const [tab, setTab]               = useState<TabId>("overdue");
  const [completing, setCompleting] = useState<number | null>(null);

  // Client name lookup — fetched once alongside follow-ups
  const [clientNames, setClientNames] = useState<Record<number, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [fuRes, clientRes] = await Promise.all([
        fetch("/api/admin/communications?followUpOnly=true"),
        fetch("/api/admin/clients?perPage=200"),
      ]);
      const fuData     = await fuRes.json();
      const clientData = await clientRes.json();

      const entries: BluuCommunication[] = fuData.entries ?? [];
      setAllEntries(entries);

      const nameMap: Record<number, string> = {};
      for (const c of (clientData.clients ?? [])) {
        nameMap[c.id] = c.acf?.contact_name || c.title?.rendered || `Client #${c.id}`;
      }
      setClientNames(nameMap);
    } catch (err: any) {
      toast.error(err.message ?? "Failed to load follow-ups");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function markComplete(entry: BluuCommunication) {
    setCompleting(entry.id);
    try {
      const res  = await fetch(`/api/admin/communications/${entry.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ follow_up_completed: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      toast.success("Follow-up marked complete");
      setAllEntries(prev =>
        prev.map(e => e.id === entry.id ? { ...e, followUpCompleted: true } : e)
      );
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCompleting(null);
    }
  }

  const entries = filterByTab(allEntries, tab);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Follow-ups</h1>
        <p className="text-sm text-gray-500 mt-1">Track and manage outstanding client follow-ups</p>
      </div>

      {/* Tab counts */}
      <div className="border-b mb-6">
        <nav className="flex gap-6">
          {TABS.map(t => {
            const count = filterByTab(allEntries, t.id).length;
            const isOverdueLike = (t.id === "overdue" || t.id === "due_today") && count > 0;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                  tab === t.id
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {t.label}
                {count > 0 && (
                  <span className={`rounded-full px-1.5 py-0.5 text-xs font-semibold ${
                    isOverdueLike ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="bg-white rounded-lg border">
        {loading ? (
          <div className="py-12 text-center text-gray-400 text-sm">Loading…</div>
        ) : entries.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-sm">
            {EMPTY_MESSAGES[tab]}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500 bg-gray-50">
                  <th className="px-4 py-3 font-medium">Client</th>
                  <th className="px-4 py-3 font-medium">Subject</th>
                  <th className="px-4 py-3 font-medium">Due Date</th>
                  {tab !== "completed" && <th className="px-4 py-3 font-medium">Days</th>}
                  <th className="px-4 py-3 font-medium">Logged By</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {entries.map(entry => {
                  const dueDate   = entry.followUpDue ? parseISO(entry.followUpDue) : null;
                  const isOverdue = dueDate && isPast(dueDate) && !isToday(dueDate);
                  const daysOff   = dueDate ? differenceInDays(new Date(), dueDate) : null;

                  return (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {clientNames[entry.clientId] ? (
                          <Link
                            href={`/admin/clients/${entry.clientId}`}
                            className="text-indigo-600 hover:underline"
                          >
                            {clientNames[entry.clientId]}
                          </Link>
                        ) : (
                          <span className="text-gray-400">Client #{entry.clientId}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-700 max-w-xs truncate">{entry.subject}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {dueDate ? format(dueDate, "d MMM yyyy") : "—"}
                      </td>
                      {tab !== "completed" && (
                        <td className="px-4 py-3">
                          {isOverdue && daysOff !== null ? (
                            <span className="text-red-600 font-semibold">{daysOff}d overdue</span>
                          ) : dueDate && isToday(dueDate) ? (
                            <span className="text-amber-600 font-semibold">Today</span>
                          ) : dueDate && daysOff !== null ? (
                            <span className="text-gray-400">in {Math.abs(daysOff)}d</span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                      )}
                      <td className="px-4 py-3 text-gray-500">
                        {entry.loggedBy > 0 ? `User #${entry.loggedBy}` : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-3">
                          {can("log_communications") && !entry.followUpCompleted && (
                            <button
                              onClick={() => markComplete(entry)}
                              disabled={completing === entry.id}
                              className="text-green-600 hover:text-green-800 text-xs font-medium disabled:opacity-40"
                            >
                              {completing === entry.id ? "…" : "Mark Complete"}
                            </button>
                          )}
                          <Link
                            href={`/admin/clients/${entry.clientId}`}
                            className="text-indigo-600 hover:text-indigo-800 text-xs font-medium"
                          >
                            View Client
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default withPermission("log_communications")(FollowUpsPage);
