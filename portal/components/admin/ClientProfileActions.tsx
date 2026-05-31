"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Mail, MessageSquare, FolderUp, Send, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HealthOverrideModal } from "./HealthOverrideModal";

interface ClientProfileActionsProps {
  clientId: string;
  currentHealth?: string;
}

export function ClientProfileActions({ clientId, currentHealth }: ClientProfileActionsProps) {
  const [healthOpen, setHealthOpen] = useState(false);
  const [health, setHealth] = useState(currentHealth);
  const [sendingInvite, setSendingInvite] = useState(false);

  async function handleSendInvite() {
    setSendingInvite(true);
    try {
      const res = await fetch(`/api/admin/clients/${clientId}/invite`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed");
      toast.success(`Portal invite sent to ${json.sentTo}`);
    } catch (err: any) {
      toast.error(err.message ?? "Failed to send invite");
    } finally {
      setSendingInvite(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-2 shrink-0">
      {/* Quick action buttons — modals built in later batches */}
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={() => toast.info("Email composer — built in Batch 5 (Sequences)")}
      >
        <Mail className="h-3.5 w-3.5" />
        Send Email
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={() => toast.info("Communication logger — built in Batch 4")}
      >
        <MessageSquare className="h-3.5 w-3.5" />
        Log Communication
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={() => toast.info("File upload — built in Batch 6")}
      >
        <FolderUp className="h-3.5 w-3.5" />
        Add File
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="gap-1.5"
        disabled={sendingInvite}
        onClick={handleSendInvite}
      >
        <Send className="h-3.5 w-3.5" />
        {sendingInvite ? "Sending…" : "Send Portal Invite"}
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={() => setHealthOpen(true)}
      >
        <Activity className="h-3.5 w-3.5" />
        Override Health
      </Button>

      <HealthOverrideModal
        clientId={clientId}
        currentHealth={health}
        open={healthOpen}
        onOpenChange={setHealthOpen}
        onSaved={(s) => setHealth(s)}
      />
    </div>
  );
}
