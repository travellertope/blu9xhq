"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Mail, Phone, MessageSquare, Video, Monitor, FileText, Settings,
  AlertTriangle, CheckCircle2, Clock,
} from "lucide-react";
import type { BluuCommunication, CommChannel, CommMoodSentiment } from "@/types";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";

// ─── Constants ────────────────────────────────────────────────────────────────

const MOOD_BORDER: Record<CommMoodSentiment, string> = {
  positive:  "border-l-green-500",
  neutral:   "border-l-slate-300",
  mixed:     "border-l-amber-400",
  concerned: "border-l-orange-500",
  at_risk:   "border-l-red-600",
};

const MOOD_EMOJI: Record<CommMoodSentiment, string> = {
  positive:  "😊",
  neutral:   "😐",
  mixed:     "😕",
  concerned: "😟",
  at_risk:   "🚨",
};

const MOOD_LABEL: Record<CommMoodSentiment, string> = {
  positive:  "Positive",
  neutral:   "Neutral",
  mixed:     "Mixed",
  concerned: "Concerned",
  at_risk:   "At Risk",
};

const CHANNEL_ICONS: Record<CommChannel, React.ElementType> = {
  email:    Mail,
  whatsapp: MessageSquare,
  phone:    Phone,
  meeting:  Video,
  sms:      MessageSquare,
  other:    FileText,
  system:   Settings,
};

const CHANNEL_LABELS: Record<CommChannel, string> = {
  email:    "Email",
  whatsapp: "WhatsApp",
  phone:    "Phone Call",
  meeting:  "Meeting",
  sms:      "SMS",
  other:    "Other",
  system:   "System",
};

type TabType = "all" | "emails" | "manual" | "system";

// ─── Entry Card ───────────────────────────────────────────────────────────────

function EntryCard({ entry }: { entry: BluuCommunication }) {
  const [expanded, setExpanded] = useState(false);
  const ChannelIcon = CHANNEL_ICONS[entry.channel] ?? FileText;
  const borderClass = entry.mood ? MOOD_BORDER[entry.mood] : "border-l-slate-200";

  const directionLabel = entry.direction === "outbound"
    ? { symbol: "↑", label: "Outbound", cls: "text-indigo-600" }
    : entry.direction === "inbound"
    ? { symbol: "↓", label: "Inbound",  cls: "text-green-600" }
    : { symbol: "⚙", label: "System",   cls: "text-slate-500" };

  const isFollowUpOverdue = entry.followUpNeeded
    && !entry.followUpCompleted
    && entry.followUpDue
    && new Date(entry.followUpDue).getTime() < Date.now();

  return (
    <div className={`border-l-4 ${borderClass} bg-white rounded-r-lg border border-l-[4px] border-slate-100 p-4 shadow-sm`}>
      {/* Header row */}
      <div className="flex items-center gap-2 mb-1.5 text-xs text-slate-500">
        <ChannelIcon className="h-3.5 w-3.5 shrink-0" />
        <span className="font-medium">{CHANNEL_LABELS[entry.channel]}</span>
        <span className={`font-medium ${directionLabel.cls}`}>
          {directionLabel.symbol} {directionLabel.label}
        </span>
        <span className="ml-auto shrink-0">
          {format(parseISO(entry.occurredAt || entry.date), "d MMM yyyy, HH:mm")}
        </span>
      </div>

      {/* Subject */}
      <p className="font-semibold text-slate-900 text-sm mb-2">{entry.subject}</p>

      {/* Content with expand toggle */}
      {entry.content && (
        <div className="mb-2">
          <p className={`text-sm text-slate-600 whitespace-pre-wrap ${expanded ? "" : "line-clamp-3"}`}>
            {entry.content}
          </p>
          {entry.content.length > 200 && (
            <button
              onClick={() => setExpanded(e => !e)}
              className="text-xs text-indigo-600 hover:underline mt-1"
            >
              {expanded ? "Show less" : "Show more"}
            </button>
          )}
        </div>
      )}

      {/* Mood badge */}
      {entry.mood && (
        <div className="mb-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
            {MOOD_EMOJI[entry.mood]} {MOOD_LABEL[entry.mood]}
          </span>
          {entry.moodSource === "ai_accepted" && entry.moodReasoning && (
            <p className="text-xs italic text-slate-400 mt-1">{entry.moodReasoning}</p>
          )}
        </div>
      )}

      {/* Red flags */}
      {entry.redFlags && entry.redFlags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {entry.redFlags.map((flag, i) => (
            <span key={i} className="inline-flex items-center gap-0.5 rounded-full bg-red-50 px-2 py-0.5 text-xs text-red-600">
              <AlertTriangle className="h-3 w-3" /> {flag}
            </span>
          ))}
        </div>
      )}

      {/* Follow-up badge */}
      {entry.followUpNeeded && (
        <div className="mb-2">
          {entry.followUpCompleted ? (
            <span className="inline-flex items-center gap-1 text-xs text-slate-400 line-through">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500 no-underline" />
              Follow-up completed
            </span>
          ) : isFollowUpOverdue ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
              <Clock className="h-3 w-3" />
              OVERDUE — due {entry.followUpDue ? format(parseISO(entry.followUpDue), "d MMM") : ""}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
              <Clock className="h-3 w-3" />
              Follow-up due {entry.followUpDue ? format(parseISO(entry.followUpDue), "d MMM") : ""}
            </span>
          )}
        </div>
      )}

      {/* Footer: logged by + email status */}
      <div className="flex items-center gap-3 mt-2 pt-2 border-t border-slate-50 text-xs text-slate-400">
        {entry.type === "manual" && entry.loggedBy > 0 && (
          <span>Logged by user #{entry.loggedBy}</span>
        )}
        {entry.emailStatus && (
          <span className={`capitalize px-1.5 py-0.5 rounded text-xs font-medium ${
            entry.emailStatus === "bounced" ? "bg-red-50 text-red-600" :
            entry.emailStatus === "replied" ? "bg-green-50 text-green-600" :
            entry.emailStatus === "opened"  ? "bg-blue-50 text-blue-600" :
            "bg-slate-100 text-slate-600"
          }`}>
            {entry.emailStatus}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface CommunicationTimelineProps {
  clientId: number;
  initialEntries?: BluuCommunication[];
}

export function CommunicationTimeline({ clientId, initialEntries }: CommunicationTimelineProps) {
  const [entries,    setEntries]    = useState<BluuCommunication[]>(initialEntries ?? []);
  const [loading,    setLoading]    = useState(!initialEntries);
  const [page,       setPage]       = useState(1);
  const [hasMore,    setHasMore]    = useState(false);
  const [tab,        setTab]        = useState<TabType>("all");
  const [moodFilter, setMoodFilter] = useState("");
  const [dateFrom,   setDateFrom]   = useState("");
  const [dateTo,     setDateTo]     = useState("");
  const isFirstLoad = useRef(true);

  const buildUrl = useCallback((p: number, _append?: boolean) => {
    const sp = new URLSearchParams({ clientId: String(clientId), page: String(p), perPage: "20" });
    if (tab !== "all")  sp.set("type", tab);
    if (moodFilter)     sp.set("mood", moodFilter);
    if (dateFrom)       sp.set("dateFrom", dateFrom);
    if (dateTo)         sp.set("dateTo", dateTo);
    return `/api/admin/communications?${sp}`;
  }, [clientId, tab, moodFilter, dateFrom, dateTo]);

  const load = useCallback(async (p: number, append = false) => {
    setLoading(true);
    try {
      const res  = await fetch(buildUrl(p, append));
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load");
      const newEntries: BluuCommunication[] = data.entries ?? [];
      setEntries(prev => append ? [...prev, ...newEntries] : newEntries);
      setHasMore(p < data.totalPages);
      setPage(p);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [buildUrl]);

  // Reload on filter change
  useEffect(() => {
    if (isFirstLoad.current && initialEntries) { isFirstLoad.current = false; return; }
    isFirstLoad.current = false;
    load(1, false);
  }, [tab, moodFilter, dateFrom, dateTo]);

  // Initial load when no initial entries provided
  useEffect(() => {
    if (!initialEntries) load(1, false);
  }, []);

  // Exposed method for optimistic prepend (used by LogCommunicationModal via callback)
  function prependEntry(entry: BluuCommunication) {
    setEntries(prev => [entry, ...prev]);
  }
  // Attach to window for cross-component communication (simple approach)
  useEffect(() => {
    (window as any)[`__prependComm_${clientId}`] = prependEntry;
    return () => { delete (window as any)[`__prependComm_${clientId}`]; };
  }, [clientId]);

  const tabs: { id: TabType; label: string }[] = [
    { id: "all",    label: "All Activity" },
    { id: "emails", label: "Emails" },
    { id: "manual", label: "Manual Logs" },
    { id: "system", label: "System" },
  ];

  const moods = [
    { value: "",          label: "All Moods" },
    { value: "positive",  label: "😊 Positive" },
    { value: "neutral",   label: "😐 Neutral" },
    { value: "mixed",     label: "😕 Mixed" },
    { value: "concerned", label: "😟 Concerned" },
    { value: "at_risk",   label: "🚨 At Risk" },
  ];

  return (
    <div>
      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 mb-4">
        {/* Tab buttons */}
        <div className="flex border rounded-lg overflow-hidden text-sm">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                tab === t.id ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Mood dropdown */}
        <select
          value={moodFilter}
          onChange={e => setMoodFilter(e.target.value)}
          className="border rounded-lg px-2 py-1.5 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {moods.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>

        {/* Date range */}
        <input
          type="date"
          value={dateFrom}
          onChange={e => setDateFrom(e.target.value)}
          className="border rounded-lg px-2 py-1.5 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <input
          type="date"
          value={dateTo}
          onChange={e => setDateTo(e.target.value)}
          className="border rounded-lg px-2 py-1.5 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        {(dateFrom || dateTo || moodFilter) && (
          <button
            onClick={() => { setDateFrom(""); setDateTo(""); setMoodFilter(""); }}
            className="text-xs text-slate-400 hover:text-slate-600"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Timeline entries */}
      {loading && entries.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-sm">Loading…</div>
      ) : entries.length === 0 ? (
        <div className="py-12 text-center text-slate-400">
          <Monitor className="h-8 w-8 mx-auto mb-2 text-slate-200" />
          <p className="text-sm">No communications found</p>
          {(tab !== "all" || moodFilter || dateFrom || dateTo) && (
            <p className="text-xs mt-1">Try clearing the filters</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map(entry => (
            <EntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}

      {/* Load more */}
      {hasMore && (
        <div className="mt-4 text-center">
          <button
            onClick={() => load(page + 1, true)}
            disabled={loading}
            className="px-4 py-2 text-sm border rounded-lg hover:bg-slate-50 disabled:opacity-50"
          >
            {loading ? "Loading…" : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
