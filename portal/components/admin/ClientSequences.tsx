"use client";

import { useState, useEffect, useCallback } from "react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import Link from "next/link";
import { Loader2, Pause, Play } from "lucide-react";
import { PermissionGuard } from "@/components/shared/PermissionGuard";

interface Enrollment {
  enrollmentId: number;
  sequenceId:   number;
  sequenceName: string;
  status:       "active" | "paused" | "completed" | "exited";
  currentStep:  number;
  totalSteps:   number;
  enrolledAt:   string;
  pausedAt:     string | null;
  exitedAt:     string | null;
  exitReason:   string | null;
}

interface WPSequence {
  id:    number;
  title: string;
  acf: {
    is_active: boolean;
  };
}

interface ClientSequencesProps {
  clientId:    number;
  clientEmail: string;
}

export function ClientSequences({ clientId, clientEmail }: ClientSequencesProps) {
  const [enrollments, setEnrollments]         = useState<Enrollment[]>([]);
  const [sequences, setSequences]             = useState<WPSequence[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [enrolling, setEnrolling]             = useState(false);
  const [selectedSequenceId, setSelectedSequenceId] = useState("");
  const [removingId, setRemovingId]           = useState<number | null>(null);
  const [togglingId, setTogglingId]           = useState<number | null>(null);

  const loadEnrollments = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/sequences/client-enrollments?clientId=${clientId}`);
      const data = await res.json();
      setEnrollments(data.enrollments ?? []);
    } catch {
      toast.error("Failed to load enrollments");
    }
  }, [clientId]);

  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        const [enrollRes, seqRes] = await Promise.all([
          fetch(`/api/admin/sequences/client-enrollments?clientId=${clientId}`),
          fetch("/api/admin/sequences"),
        ]);
        const enrollData = await enrollRes.json();
        const seqData    = await seqRes.json();

        setEnrollments(enrollData.enrollments ?? []);
        const allSequences: WPSequence[] = seqData.sequences ?? seqData ?? [];
        setSequences(allSequences.filter((s) => s.acf?.is_active));
      } catch {
        toast.error("Failed to load sequences");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [clientId]);

  async function handleRemove(enrollment: Enrollment) {
    setRemovingId(enrollment.enrollmentId);
    try {
      const res = await fetch("/api/admin/sequences/remove-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, enrollmentId: enrollment.enrollmentId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to remove");
      toast.success(`Removed from "${enrollment.sequenceName}"`);
      await loadEnrollments();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to remove");
    } finally {
      setRemovingId(null);
    }
  }

  async function handleTogglePause(enrollment: Enrollment) {
    const action = enrollment.status === "active" ? "pause" : "resume";
    setTogglingId(enrollment.enrollmentId);
    try {
      const res = await fetch(
        `/api/admin/sequences/pause-resume/${enrollment.enrollmentId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      toast.success(
        action === "pause"
          ? `Paused "${enrollment.sequenceName}"`
          : `Resumed "${enrollment.sequenceName}"`
      );
      setEnrollments((prev) =>
        prev.map((e) =>
          e.enrollmentId === enrollment.enrollmentId
            ? { ...e, status: action === "pause" ? "paused" : "active" }
            : e
        )
      );
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setTogglingId(null);
    }
  }

  async function handleEnrol() {
    if (!selectedSequenceId) return;
    const seq = sequences.find((s) => String(s.id) === selectedSequenceId);
    if (!seq) return;
    setEnrolling(true);
    try {
      const res = await fetch("/api/admin/sequences/enrol-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, sequenceId: seq.id, clientEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to enrol");
      toast.success(`Enrolled in "${seq.title}"`);
      setSelectedSequenceId("");
      await loadEnrollments();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to enrol");
    } finally {
      setEnrolling(false);
    }
  }

  const EXIT_REASON_LABELS: Record<string, string> = {
    client_replied:          "Client replied",
    invoice_paid:            "Invoice paid",
    subscription_cancelled:  "Subscription cancelled",
    manual:                  "Removed manually",
  };

  const activeEnrolledIds = new Set(
    enrollments.filter((e) => e.status === "active" || e.status === "paused").map((e) => e.sequenceId)
  );
  const availableSequences = sequences.filter((s) => !activeEnrolledIds.has(s.id));

  return (
    <div className="space-y-6">
      {/* Enrollments */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Enrollments</h3>

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-gray-400 py-4">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading enrollments…
          </div>
        ) : enrollments.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">
            Not enrolled in any sequences
          </p>
        ) : (
          <div className="space-y-2">
            {enrollments.map((enrollment) => {
              const isFinished = enrollment.status === "exited" || enrollment.status === "completed";
              return (
                <div
                  key={enrollment.enrollmentId}
                  className={`flex items-center justify-between rounded-lg border px-4 py-3 ${isFinished ? "bg-gray-50 opacity-75" : "bg-white"}`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-medium ${isFinished ? "text-gray-500" : "text-gray-900"}`}>
                        {enrollment.sequenceName}
                      </p>
                      {enrollment.status === "paused" && (
                        <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                          Paused
                        </span>
                      )}
                      {enrollment.status === "completed" && (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                          Completed
                        </span>
                      )}
                      {enrollment.status === "exited" && (
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                          Exited — {EXIT_REASON_LABELS[enrollment.exitReason ?? ""] ?? enrollment.exitReason ?? "unknown"}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <p className="text-xs text-gray-500">
                        Enrolled:{" "}
                        {enrollment.enrolledAt
                          ? format(parseISO(enrollment.enrolledAt), "MMM d, yyyy")
                          : "—"}
                      </p>
                      {!isFinished && enrollment.totalSteps > 0 && (
                        <p className="text-xs text-indigo-600 font-medium">
                          Step {Math.min(enrollment.currentStep + 1, enrollment.totalSteps)}{" "}
                          of {enrollment.totalSteps}
                        </p>
                      )}
                      {enrollment.status === "paused" && enrollment.pausedAt && (
                        <p className="text-xs text-amber-600">
                          Paused {format(parseISO(enrollment.pausedAt), "MMM d")}
                        </p>
                      )}
                      {isFinished && enrollment.exitedAt && (
                        <p className="text-xs text-gray-400">
                          {format(parseISO(enrollment.exitedAt), "MMM d, yyyy")}
                        </p>
                      )}
                    </div>
                  </div>

                  {!isFinished && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleTogglePause(enrollment)}
                        disabled={togglingId === enrollment.enrollmentId}
                        title={enrollment.status === "active" ? "Pause sequence" : "Resume sequence"}
                        className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium disabled:opacity-50 transition-colors ${
                          enrollment.status === "active"
                            ? "border-amber-200 bg-white text-amber-600 hover:bg-amber-50"
                            : "border-green-200 bg-white text-green-600 hover:bg-green-50"
                        }`}
                      >
                        {togglingId === enrollment.enrollmentId ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : enrollment.status === "active" ? (
                          <Pause className="h-3 w-3" />
                        ) : (
                          <Play className="h-3 w-3" />
                        )}
                        {enrollment.status === "active" ? "Pause" : "Resume"}
                      </button>

                      <button
                        onClick={() => handleRemove(enrollment)}
                        disabled={removingId === enrollment.enrollmentId}
                        className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 hover:border-red-200 disabled:opacity-50 transition-colors"
                      >
                        {removingId === enrollment.enrollmentId ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : null}
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Enrol in Sequence */}
      <PermissionGuard permission="build_sequences">
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Enrol in Sequence</h3>

          {availableSequences.length === 0 && !loading ? (
            <p className="text-sm text-gray-500">
              No sequences available.{" "}
              <Link href="/admin/sequences" className="text-indigo-600 hover:underline">
                Create sequences in the Sequences section
              </Link>
              .
            </p>
          ) : (
            <div className="flex items-center gap-3">
              <select
                value={selectedSequenceId}
                onChange={(e) => setSelectedSequenceId(e.target.value)}
                className="flex-1 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50"
                disabled={enrolling || loading}
              >
                <option value="">Select a sequence…</option>
                {availableSequences.map((seq) => (
                  <option key={seq.id} value={String(seq.id)}>
                    {seq.title}
                  </option>
                ))}
              </select>
              <button
                onClick={handleEnrol}
                disabled={!selectedSequenceId || enrolling}
                className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {enrolling ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Enrol
              </button>
            </div>
          )}
        </div>
      </PermissionGuard>
    </div>
  );
}
