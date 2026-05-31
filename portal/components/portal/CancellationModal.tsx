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

const REASONS = [
  { value: "no_longer_needed", label: "No longer needed" },
  { value: "too_expensive", label: "Too expensive" },
  { value: "switching_provider", label: "Switching to another provider" },
  { value: "project_complete", label: "Project complete" },
  { value: "dissatisfied", label: "Not satisfied with the service" },
  { value: "other", label: "Other" },
];

interface Props {
  subscriptionId: number;
  subscriptionTitle: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CancellationModal({
  subscriptionId,
  subscriptionTitle,
  open,
  onClose,
  onSuccess,
}: Props) {
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!reason) {
      setError("Please select a reason.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/portal/subscriptions/${subscriptionId}/cancel`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, note }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to submit request.");
        return;
      }
      onSuccess();
      onClose();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    if (loading) return;
    setReason("");
    setNote("");
    setError(null);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request Cancellation</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          You're requesting cancellation for <strong>{subscriptionTitle}</strong>. Our team will
          review and confirm within 1–2 business days.
        </p>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Reason for cancellation</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason…" />
              </SelectTrigger>
              <SelectContent>
                {REASONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Additional notes (optional)</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Help us improve by sharing more details…"
              rows={3}
              maxLength={1000}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={submit} disabled={loading || !reason}>
            {loading ? "Submitting…" : "Request cancellation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
