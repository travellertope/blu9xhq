"use client";

import { useState, useEffect, useCallback } from "react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { PermissionGuard } from "@/components/shared/PermissionGuard";

interface Enrollment {
  sequenceId: string;
  sequenceName: string;
  loopsId: string;
  enrolledAt: string;
}

interface WPSequence {
  id: string;
  title: string;
  acf: {
    seq_loops_id?: string;
    is_active: boolean;
  };
}

interface ClientSequencesProps {
  clientId: number;
  clientEmail: string;
}

export function ClientSequences({ clientId, clientEmail }: ClientSequencesProps) {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [sequences, setSequences] = useState<WPSequence[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [selectedSequenceId, setSelectedSequenceId] = useState("");
  const [removingId, setRemovingId] = useState<string | null>(null);

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
        const seqData = await seqRes.json();

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
    setRemovingId(enrollment.loopsId);
    try {
      const res = await fetch("/api/admin/sequences/remove-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          sequenceLoopsId: enrollment.loopsId,
          clientEmail,
        }),
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

  async function handleEnrol() {
    if (!selectedSequenceId) return;
    const seq = sequences.find((s) => s.id === selectedSequenceId);
    if (!seq?.acf?.seq_loops_id) {
      toast.error("Selected sequence is not synced to Loops yet");
      return;
    }
    setEnrolling(true);
    try {
      const res = await fetch("/api/admin/sequences/enrol-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          sequenceLoopsId: seq.acf.seq_loops_id,
          clientEmail,
        }),
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

  // Sequences not already enrolled
  const enrolledLoopsIds = new Set(enrollments.map((e) => e.loopsId));
  const availableSequences = sequences.filter(
    (s) => s.acf?.seq_loops_id && !enrolledLoopsIds.has(s.acf.seq_loops_id)
  );

  return (
    <div className="space-y-6">
      {/* Active Enrollments */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Active Enrollments</h3>

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
            {enrollments.map((enrollment) => (
              <div
                key={enrollment.loopsId}
                className="flex items-center justify-between rounded-lg border bg-white px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {enrollment.sequenceName}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Enrolled:{" "}
                    {enrollment.enrolledAt
                      ? format(parseISO(enrollment.enrolledAt), "MMM d, yyyy")
                      : "—"}
                  </p>
                </div>
                <button
                  onClick={() => handleRemove(enrollment)}
                  disabled={removingId === enrollment.loopsId}
                  className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 hover:border-red-200 disabled:opacity-50 transition-colors"
                >
                  {removingId === enrollment.loopsId ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : null}
                  Remove
                </button>
              </div>
            ))}
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
                  <option key={seq.id} value={seq.id}>
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
