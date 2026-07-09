"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

type HealthStatus = "healthy" | "needs_attention" | "at_risk";

interface HealthOverrideModalProps {
  clientId: string;
  currentHealth?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (newStatus: HealthStatus) => void;
}

export function HealthOverrideModal({
  clientId, currentHealth, open, onOpenChange, onSaved,
}: HealthOverrideModalProps) {
  const [health, setHealth] = useState<HealthStatus>(
    (currentHealth as HealthStatus) ?? "healthy"
  );
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/clients/${clientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ healthStatus: health, healthNote: note }),
      });
      if (!res.ok) throw new Error("Failed to update health status");
      toast.success("Health status updated");
      onSaved(health);
      onOpenChange(false);
      setNote("");
    } catch {
      toast.error("Failed to update health status");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Override Client Health Status</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Health Status</Label>
            <Select value={health} onValueChange={(v) => setHealth(v as HealthStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="healthy">🟢 Healthy</SelectItem>
                <SelectItem value="needs_attention">🟡 Needs Attention</SelectItem>
                <SelectItem value="at_risk">🔴 At Risk</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Reason (internal note)</Label>
            <Textarea
              placeholder="e.g. Client hasn't responded to last 3 follow-ups…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
