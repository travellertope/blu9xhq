"use client";

import { useState, useEffect, useRef } from "react";
import { X, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { PermissionGuard } from "@/components/shared/PermissionGuard";
import type { BluuCommunication, CommMoodSentiment } from "@/types";

interface AISuggestion {
  sentiment: CommMoodSentiment;
  reasoning: string;
  red_flags: string[];
}

const CHANNELS = [
  { value: "email",    label: "External Email" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "phone",    label: "Phone Call" },
  { value: "meeting",  label: "Meeting" },
  { value: "sms",      label: "SMS/Text" },
  { value: "other",    label: "Other" },
] as const;

const MOODS: { value: CommMoodSentiment; label: string; emoji: string }[] = [
  { value: "positive",  label: "Positive",  emoji: "😊" },
  { value: "neutral",   label: "Neutral",   emoji: "😐" },
  { value: "mixed",     label: "Mixed",     emoji: "😕" },
  { value: "concerned", label: "Concerned", emoji: "😟" },
  { value: "at_risk",   label: "At Risk",   emoji: "🚨" },
];

interface LogCommunicationModalProps {
  clientId: number;
  onClose: () => void;
  onSaved: (entry: BluuCommunication) => void;
}

function nowLocalDatetime(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function LogCommunicationModal({ clientId, onClose, onSaved }: LogCommunicationModalProps) {
  const [form, setForm] = useState({
    occurredAt:     nowLocalDatetime(),
    channel:        "email" as typeof CHANNELS[number]["value"],
    direction:      "outbound" as "inbound" | "outbound" | "internal",
    subject:        "",
    content:        "",
    followUpNeeded: false,
    followUpDue:    "",
  });

  const [aiLoading,   setAiLoading]   = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<AISuggestion | null>(null);
  const [aiState,     setAiState]     = useState<"none" | "suggestion" | "accepted" | "overriding">("none");
  const [mood,        setMood]        = useState<CommMoodSentiment | "">("");
  const [moodSource,  setMoodSource]  = useState<"ai_accepted" | "ai_overridden" | "manual">("manual");
  const [submitting,  setSubmitting]  = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced AI analysis on content change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const content = form.content.trim();
    if (content.length < 30) {
      setAiSuggestion(null);
      setAiState("none");
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setAiLoading(true);
      try {
        const res  = await fetch("/api/ai/mood-analysis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ content }),
        });
        if (res.status === 429) return; // rate-limited, silently skip
        if (!res.ok) return;
        const data: AISuggestion = await res.json();
        setAiSuggestion(data);
        setAiState("suggestion");
      } catch {
        // silent — don't disrupt the form
      } finally {
        setAiLoading(false);
      }
    }, 800);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [form.content]);

  function handleAcceptAI() {
    if (!aiSuggestion) return;
    setMood(aiSuggestion.sentiment);
    setMoodSource("ai_accepted");
    setAiState("accepted");
  }

  function handleOverrideAI() {
    setAiState("overriding");
    setMoodSource("ai_overridden");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.subject.trim() || !form.content.trim()) {
      toast.error("Subject and content are required");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/communications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          clientId,
          channel:        form.channel,
          direction:      form.direction,
          subject:        form.subject,
          content:        form.content,
          occurredAt:     new Date(form.occurredAt).toISOString(),
          ...(mood          ? { mood, moodSource }                          : {}),
          ...(aiSuggestion?.red_flags?.length && aiState === "accepted"
            ? { redFlags: aiSuggestion.red_flags } : {}),
          ...(aiSuggestion?.reasoning && aiState === "accepted"
            ? { moodReasoning: aiSuggestion.reasoning } : {}),
          followUpNeeded: form.followUpNeeded,
          ...(form.followUpNeeded && form.followUpDue ? { followUpDue: form.followUpDue } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save");
      toast.success("Communication logged");
      onSaved(data.entry);
      onClose();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const fieldCls = "w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";

  return (
    <PermissionGuard permission="log_communications">
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
            <h2 className="text-lg font-semibold text-slate-900">Log Communication</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
            <div className="px-6 py-4 space-y-4">
              {/* Date/time + Channel + Direction row */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Date & Time</label>
                  <input
                    type="datetime-local"
                    className={fieldCls}
                    value={form.occurredAt}
                    onChange={e => setForm(f => ({ ...f, occurredAt: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Channel</label>
                  <select
                    className={fieldCls}
                    value={form.channel}
                    onChange={e => setForm(f => ({ ...f, channel: e.target.value as any }))}
                  >
                    {CHANNELS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Direction</label>
                  <select
                    className={fieldCls}
                    value={form.direction}
                    onChange={e => setForm(f => ({ ...f, direction: e.target.value as any }))}
                  >
                    <option value="outbound">We contacted them</option>
                    <option value="inbound">They contacted us</option>
                    <option value="internal">Internal note</option>
                  </select>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Subject *</label>
                <input
                  className={fieldCls}
                  placeholder="e.g. Follow-up on Q1 deliverables"
                  value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  required
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Content *</label>
                <textarea
                  className={`${fieldCls} resize-y min-h-[140px]`}
                  placeholder="Paste the email, transcript, meeting notes, or WhatsApp messages here…"
                  value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  required
                />
              </div>

              {/* AI Mood Analysis */}
              {aiLoading && (
                <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 rounded-lg p-3">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analysing sentiment…
                </div>
              )}

              {!aiLoading && aiSuggestion && aiState === "suggestion" && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 space-y-2">
                  <p className="text-xs font-medium text-indigo-700">AI Suggestion</p>
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {MOODS.find(m => m.value === aiSuggestion.sentiment)?.emoji}{" "}
                        {MOODS.find(m => m.value === aiSuggestion.sentiment)?.label}
                      </p>
                      <p className="text-xs italic text-slate-500">{aiSuggestion.reasoning}</p>
                      {aiSuggestion.red_flags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          <span className="text-xs text-red-500 font-medium">Red flags:</span>
                          {aiSuggestion.red_flags.map((f, i) => (
                            <span key={i} className="inline-flex items-center gap-0.5 rounded-full bg-red-50 px-1.5 py-0.5 text-xs text-red-600">
                              <AlertTriangle className="h-2.5 w-2.5" /> {f}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={handleAcceptAI}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Accept
                      </button>
                      <button
                        type="button"
                        onClick={handleOverrideAI}
                        className="px-3 py-1.5 text-xs border border-slate-300 rounded-md hover:bg-slate-50"
                      >
                        Override
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {!aiLoading && aiState === "accepted" && aiSuggestion && (
                <div className="flex items-center gap-2 text-sm bg-green-50 border border-green-100 rounded-lg px-3 py-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                  <span className="text-green-700 text-xs">
                    AI suggestion accepted:{" "}
                    {MOODS.find(m => m.value === aiSuggestion.sentiment)?.emoji}{" "}
                    {MOODS.find(m => m.value === aiSuggestion.sentiment)?.label}
                  </span>
                  <button
                    type="button"
                    onClick={() => { setAiState("overriding"); setMoodSource("ai_overridden"); }}
                    className="ml-auto text-xs text-slate-400 hover:text-slate-600"
                  >
                    Change
                  </button>
                </div>
              )}

              {/* Manual mood picker — shown when content is empty OR when overriding */}
              {(aiState === "none" || aiState === "overriding") && (
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    {aiState === "overriding" ? "Override Mood" : "Mood (optional)"}
                  </label>
                  <select
                    className={fieldCls}
                    value={mood}
                    onChange={e => { setMood(e.target.value as CommMoodSentiment); setMoodSource("manual"); }}
                  >
                    <option value="">— Select mood —</option>
                    {MOODS.map(m => (
                      <option key={m.value} value={m.value}>{m.emoji} {m.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Follow-up toggle */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.followUpNeeded}
                    onChange={e => setForm(f => ({ ...f, followUpNeeded: e.target.checked }))}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-slate-700">Follow-up needed</span>
                </label>
                {form.followUpNeeded && (
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Follow-up Due Date</label>
                    <input
                      type="date"
                      className={fieldCls}
                      value={form.followUpDue}
                      onChange={e => setForm(f => ({ ...f, followUpDue: e.target.value }))}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t bg-slate-50 flex justify-end gap-2 shrink-0 rounded-b-xl">
              <button type="button" onClick={onClose}
                className="px-4 py-2 text-sm border rounded-md hover:bg-white">
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {submitting ? "Saving…" : "Save Communication"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </PermissionGuard>
  );
}
