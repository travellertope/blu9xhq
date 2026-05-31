"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Mail, MessageSquare, FolderUp, Send, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HealthOverrideModal } from "./HealthOverrideModal";
import { LogCommunicationModal } from "./LogCommunicationModal";
import { EmailComposer } from "./EmailComposer";
import type { BluuCommunication } from "@/types";

interface ClientProfileActionsProps {
  clientId: string;
  clientIdNum: number;
  currentHealth?: string;
}

export function ClientProfileActions({ clientId, clientIdNum, currentHealth }: ClientProfileActionsProps) {
  const [healthOpen,    setHealthOpen]    = useState(false);
  const [logOpen,       setLogOpen]       = useState(false);
  const [emailOpen,     setEmailOpen]     = useState(false);
  const [health,        setHealth]        = useState(currentHealth);
  const [sendingInvite, setSendingInvite] = useState(false);

  async function handleSendInvite() {
    setSendingInvite(true);
    try {
      const res  = await fetch(`/api/admin/clients/${clientId}/invite`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed");
      toast.success(`Portal invite sent to ${json.sentTo}`);
    } catch (err: any) {
      toast.error(err.message ?? "Failed to send invite");
    } finally {
      setSendingInvite(false);
    }
  }

  function handleCommSaved(entry: BluuCommunication) {
    // Optimistic prepend to timeline via global window bridge set in CommunicationTimeline
    const fn = (window as any)[`__prependComm_${clientIdNum}`];
    if (typeof fn === "function") fn(entry);
  }

  return (
    <div className="flex flex-wrap gap-2 shrink-0">
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={() => setEmailOpen(true)}
      >
        <Mail className="h-3.5 w-3.5" />
        Send Email
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={() => setLogOpen(true)}
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

      {logOpen && (
        <LogCommunicationModal
          clientId={clientIdNum}
          onClose={() => setLogOpen(false)}
          onSaved={handleCommSaved}
        />
      )}

      <EmailComposer
        open={emailOpen}
        onClose={() => setEmailOpen(false)}
        clientId={clientIdNum}
      />
    </div>
  );
}
