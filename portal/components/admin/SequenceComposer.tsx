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
import { Input } from "@/components/ui/input";
import { TiptapEditor } from "./TiptapEditor";
import { PermissionGuard } from "@/components/shared/PermissionGuard";
import { Loader2, Plus, Trash2, Zap } from "lucide-react";
import { toast } from "sonner";

interface Step {
  delayDays: number;
  subject:   string;
  bodyHtml:  string;
}

function emptyStep(delayDays = 0): Step {
  return { delayDays, subject: "", bodyHtml: "" };
}

export interface SequenceComposerProps {
  open:        boolean;
  onClose:     () => void;
  onCreated?:  () => void;
  clientId:    number;
  clientEmail: string;
  clientName?: string;
  companyName?: string;
}

function substituteVars(text: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce(
    (r, [k, v]) => r.replaceAll(`{{${k}}}`, v),
    text
  );
}

export function SequenceComposer({
  open,
  onClose,
  onCreated,
  clientId,
  clientEmail,
  clientName,
  companyName,
}: SequenceComposerProps) {
  const [title,   setTitle]   = useState("");
  const [steps,   setSteps]   = useState<Step[]>([emptyStep(0), emptyStep(3)]);
  const [saving,  setSaving]  = useState(false);
  const [active,  setActive]  = useState(0); // which step is expanded

  const vars: Record<string, string> = {
    "client.name":      clientName  ?? "{{client.name}}",
    "client.company":   companyName ?? "{{client.company}}",
    "portal.login_url": (typeof window !== "undefined" ? window.location.origin : "") + "/portal/login",
  };

  function updateStep(i: number, patch: Partial<Step>) {
    setSteps((prev) => prev.map((s, idx) => idx === i ? { ...s, ...patch } : s));
  }

  function addStep() {
    const lastDelay = steps[steps.length - 1]?.delayDays ?? 0;
    setSteps((prev) => [...prev, emptyStep(lastDelay + 3)]);
    setActive(steps.length);
  }

  function removeStep(i: number) {
    if (steps.length === 1) return;
    setSteps((prev) => prev.filter((_, idx) => idx !== i));
    setActive((prev) => Math.min(prev, steps.length - 2));
  }

  async function handleCreate() {
    setSaving(true);
    try {
      // Substitute vars in each step before sending
      const substituted = steps.map((s) => ({
        delayDays: s.delayDays,
        subject:   substituteVars(s.subject,  vars),
        bodyHtml:  substituteVars(s.bodyHtml, vars),
      }));

      const res = await fetch("/api/admin/sequences/create-and-enroll", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ clientId, clientEmail, clientName, title, steps: substituted }),
      });

      const ct = res.headers.get("content-type") ?? "";
      if (!res.ok) {
        const msg = ct.includes("application/json")
          ? ((await res.json()).error ?? "Failed to create sequence")
          : `Server error (${res.status})`;
        throw new Error(msg);
      }
      const data = ct.includes("application/json") ? await res.json() : {};

      const firstDelay = steps[0]?.delayDays ?? 0;
      toast.success(
        firstDelay === 0
          ? "Sequence created — first email sent immediately"
          : `Sequence created — first email sends in ${firstDelay} day${firstDelay !== 1 ? "s" : ""}`
      );
      onCreated?.();
      onClose();
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  const canCreate = !saving && !!title.trim() && steps.every((s) => s.subject.trim() && s.bodyHtml.trim());

  return (
    <PermissionGuard permission="build_sequences">
      <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
        <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Personalised Sequence</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-5 py-1">
            {/* Recipient (locked) */}
            <div className="space-y-1.5">
              <Label>Recipient</Label>
              <p className="text-sm text-slate-700 rounded-md border bg-slate-50 px-3 py-2">
                {clientName ? `${clientName} — ` : ""}{clientEmail}
              </p>
            </div>

            {/* Sequence name */}
            <div className="space-y-1.5">
              <Label htmlFor="sc-title">Sequence Name</Label>
              <Input
                id="sc-title"
                placeholder={`e.g. Follow-up for ${clientName ?? clientEmail}`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Steps */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Steps ({steps.length})</Label>
                <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={addStep}>
                  <Plus className="h-3.5 w-3.5" />
                  Add Step
                </Button>
              </div>

              {steps.map((step, i) => (
                <div key={i} className="rounded-lg border bg-white shadow-sm overflow-hidden">
                  {/* Step header / toggle */}
                  <button
                    type="button"
                    className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    onClick={() => setActive(active === i ? -1 : i)}
                  >
                    <span className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center rounded-full bg-slate-100 text-slate-600 text-xs font-bold w-5 h-5">
                        {i + 1}
                      </span>
                      {step.subject.trim() || <span className="text-slate-400 italic">Untitled step</span>}
                    </span>
                    <span className="text-xs text-slate-400">
                      {step.delayDays === 0 && i === 0
                        ? "Sends immediately"
                        : i === 0
                        ? `${step.delayDays}d after sequence start`
                        : step.delayDays === 0
                        ? "Sends immediately after previous step"
                        : `${step.delayDays}d after previous step`}
                    </span>
                  </button>

                  {active === i && (
                    <div className="px-4 pb-4 flex flex-col gap-4 border-t">
                      {/* Delay */}
                      <div className="flex items-center gap-3 pt-3">
                        <Label htmlFor={`sc-delay-${i}`} className="shrink-0">
                          Send after
                        </Label>
                        <Input
                          id={`sc-delay-${i}`}
                          type="number"
                          min={0}
                          className="w-24"
                          value={step.delayDays}
                          onChange={(e) => updateStep(i, { delayDays: Math.max(0, parseInt(e.target.value) || 0) })}
                        />
                        <span className="text-sm text-slate-500">
                          {i === 0 ? "days after sequence start" : "days after previous step"}
                        </span>

                        {steps.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="ml-auto text-red-500 hover:text-red-600 hover:bg-red-50 gap-1"
                            onClick={() => removeStep(i)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Remove
                          </Button>
                        )}
                      </div>

                      {/* Subject */}
                      <div className="space-y-1.5">
                        <Label htmlFor={`sc-subject-${i}`}>Subject</Label>
                        <Input
                          id={`sc-subject-${i}`}
                          placeholder="Email subject..."
                          value={step.subject}
                          onChange={(e) => updateStep(i, { subject: e.target.value })}
                        />
                      </div>

                      {/* Body */}
                      <div className="space-y-1.5">
                        <Label>Body</Label>
                        <TiptapEditor
                          content={step.bodyHtml}
                          onChange={(html) => updateStep(i, { bodyHtml: html })}
                          showVariables
                          minHeight="220px"
                          placeholder="Write this step's email..."
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={onClose} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={!canCreate}>
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Zap className="h-4 w-4 mr-2" />
                )}
                {saving ? "Creating…" : "Create & Enroll"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PermissionGuard>
  );
}
