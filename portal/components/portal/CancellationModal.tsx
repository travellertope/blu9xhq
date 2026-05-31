"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CANCELLATION_REASONS = [
  { value: "no_longer_needed", label: "No longer needed" },
  { value: "too_expensive", label: "Too expensive" },
  { value: "switching_provider", label: "Switching to another provider" },
  { value: "project_completed", label: "Project completed" },
  { value: "budget_constraints", label: "Budget constraints" },
  { value: "not_satisfied", label: "Not satisfied with results" },
  { value: "other", label: "Other" },
];

interface CancellationModalProps {
  subscriptionId: number;
  serviceName: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CancellationModal({
  subscriptionId,
  serviceName,
  open,
  onClose,
  onSuccess,
}: CancellationModalProps) {
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!reason) {
      setError("Please select a reason.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/portal/subscriptions/${subscriptionId}/cancel`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason, note: note.trim() || undefined }),
        }
      );

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "Request failed");
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) onClose();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-slate-800">
            Request Cancellation
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">
            You are requesting to cancel{" "}
            <span className="font-medium text-slate-700">{serviceName}</span>.
            Our team will reach out to confirm.
          </p>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="cancel-reason">Reason for cancellation *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger id="cancel-reason">
                <SelectValue placeholder="Select a reason…" />
              </SelectTrigger>
              <SelectContent>
                {CANCELLATION_REASONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cancel-note">
              Additional notes{" "}
              <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="cancel-note"
              placeholder="Any additional context for our team…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Keep Subscription
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={loading || !reason}
          >
            {loading ? "Submitting…" : "Request Cancellation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
