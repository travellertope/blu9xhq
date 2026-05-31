"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { TiptapEditor } from "./TiptapEditor";
import { PermissionGuard } from "@/components/shared/PermissionGuard";
import { Loader2, Send, Clock } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { EmailTemplate } from "@/types";

export interface EmailComposerProps {
  open: boolean;
  onClose: () => void;
  clientId?: number;
  clientEmail?: string;
  clientName?: string;
  companyName?: string;
  expanded?: boolean;
}

function substituteVars(text: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce(
    (result, [key, value]) => result.replaceAll(`{{${key}}}`, value),
    text
  );
}

export function EmailComposer({
  open,
  onClose,
  clientId,
  clientEmail,
  clientName,
  companyName,
  expanded = false,
}: EmailComposerProps) {
  const [to, setTo] = useState(clientEmail ?? "");
  const [subject, setSubject] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [scheduled, setScheduled] = useState(false);
  const [scheduledFor, setScheduledFor] = useState("");
  const [sending, setSending] = useState(false);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  // Sync `to` if clientEmail prop changes
  useEffect(() => {
    if (clientEmail) setTo(clientEmail);
  }, [clientEmail]);

  // Fetch templates on mount
  useEffect(() => {
    setLoadingTemplates(true);
    fetch("/api/admin/email/templates")
      .then((res) => res.json())
      .then((data) => {
        const list: EmailTemplate[] = Array.isArray(data)
          ? data
          : (data.data ?? []);
        setTemplates(list);
      })
      .catch(() => {
        // silent — templates are optional
      })
      .finally(() => setLoadingTemplates(false));
  }, []);

  function handleTemplateSelect(id: string) {
    setTemplateId(id);
    const template = templates.find((t) => t.id === id);
    if (!template) return;

    const vars: Record<string, string> = {
      "client.name":     clientName  ?? "{{client.name}}",
      "client.company":  companyName ?? "{{client.company}}",
      "portal.login_url":
        (typeof window !== "undefined" ? window.location.origin : "") +
        "/portal/login",
    };

    setSubject(substituteVars(template.subject, vars));
    setBodyHtml(substituteVars(template.bodyHtml, vars));
  }

  async function handleSend() {
    setSending(true);
    try {
      const res = await fetch("/api/admin/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to,
          subject,
          htmlBody: bodyHtml,
          clientId,
          ...(scheduled && scheduledFor ? { scheduledFor } : {}),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to send email");

      toast.success("Email sent successfully");
      onClose();
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong");
    } finally {
      setSending(false);
    }
  }

  const canSend = !sending && !!to && !!subject && !!bodyHtml;

  const innerContent = (
    <div className="flex flex-col gap-4">
      {/* From (static) */}
      <div className="space-y-1.5">
        <Label htmlFor="ec-from">From</Label>
        <Input
          id="ec-from"
          value="BluuHQ <hello@bluuhq.com>"
          readOnly
          disabled
          className="bg-slate-50 text-slate-500"
        />
      </div>

      {/* To */}
      <div className="space-y-1.5">
        <Label htmlFor="ec-to">To</Label>
        <Input
          id="ec-to"
          type="email"
          placeholder="client@example.com"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          readOnly={!!clientEmail}
          className={clientEmail ? "bg-slate-50 text-slate-500" : ""}
        />
      </div>

      {/* Template picker */}
      <div className="space-y-1.5">
        <Label>Template</Label>
        <Select
          value={templateId}
          onValueChange={handleTemplateSelect}
          disabled={loadingTemplates}
        >
          <SelectTrigger>
            <SelectValue placeholder="Load a template..." />
          </SelectTrigger>
          <SelectContent>
            {templates.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Subject */}
      <div className="space-y-1.5">
        <Label htmlFor="ec-subject">Subject</Label>
        <Input
          id="ec-subject"
          placeholder="Email subject..."
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
      </div>

      {/* Body */}
      <div className="space-y-1.5">
        <Label>Body</Label>
        <TiptapEditor
          content={bodyHtml}
          onChange={setBodyHtml}
          showVariables={true}
          minHeight="300px"
          placeholder="Compose your email..."
        />
      </div>

      {/* Schedule toggle */}
      <div className="flex items-center gap-3">
        <Label htmlFor="ec-schedule" className="cursor-pointer">
          Schedule Send
        </Label>
        <Switch
          id="ec-schedule"
          checked={scheduled}
          onCheckedChange={setScheduled}
        />
      </div>

      {/* Scheduled date/time picker */}
      {scheduled && (
        <div className="space-y-1.5">
          <Label htmlFor="ec-scheduled-for">Send At</Label>
          <Input
            id="ec-scheduled-for"
            type="datetime-local"
            value={scheduledFor}
            onChange={(e) => setScheduledFor(e.target.value)}
          />
        </div>
      )}
    </div>
  );

  const footerContent = (
    <div className="flex justify-end gap-2 pt-2">
      <Button variant="outline" onClick={onClose} disabled={sending}>
        Cancel
      </Button>
      <Button onClick={handleSend} disabled={!canSend}>
        {sending ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : scheduled ? (
          <Clock className="h-4 w-4 mr-2" />
        ) : (
          <Send className="h-4 w-4 mr-2" />
        )}
        {scheduled ? "Schedule" : "Send Now"}
      </Button>
    </div>
  );

  if (expanded) {
    return (
      <PermissionGuard permission="compose_send_emails">
        <div className="bg-white border rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Compose Email</h2>
          {innerContent}
          {footerContent}
        </div>
      </PermissionGuard>
    );
  }

  return (
    <PermissionGuard permission="compose_send_emails">
      <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Compose Email</DialogTitle>
          </DialogHeader>

          {innerContent}

          <DialogFooter>{footerContent}</DialogFooter>
        </DialogContent>
      </Dialog>
    </PermissionGuard>
  );
}
