"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus, X, RefreshCw, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TiptapEditor } from "@/components/admin/TiptapEditor";
function uid() { return crypto.randomUUID(); }

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WPSequencePost {
  id: string;
  title: string;
  acf: {
    description?: string;
    trigger?: SequenceTrigger;
    trigger_delay_days?: number;
    exit_conditions?: string[];
    is_active?: boolean;
    seq_loops_id?: string;
    seq_loops_synced_at?: string;
    steps?: RawStep[];
  };
}

type SequenceTrigger =
  | "manual"
  | "subscription_assigned"
  | "invoice_overdue"
  | "client_inactive"
  | "cancellation_requested";

interface SequenceStep {
  _key: string;
  delayDays: number;
  subject: string;
  bodyHtml: string;
  emailTemplateId?: number;
}

interface RawStep {
  delay_days?: number;
  subject?: string;
  body_html?: string;
  email_template_id?: number;
}

interface EmailTemplate {
  id: number;
  title: string;
  subject: string;
  bodyHtml: string;
}

const EXIT_CONDITIONS = [
  { id: "client_replied",           label: "Exit when client replies" },
  { id: "invoice_paid",             label: "Exit when invoice paid" },
  { id: "subscription_cancelled",   label: "Exit when subscription cancelled" },
] as const;

const TRIGGERS: { value: SequenceTrigger; label: string }[] = [
  { value: "manual",                 label: "Manual" },
  { value: "subscription_assigned",  label: "Subscription Assigned" },
  { value: "invoice_overdue",        label: "Invoice Overdue" },
  { value: "client_inactive",        label: "Client Inactive" },
  { value: "cancellation_requested", label: "Cancellation Requested" },
];

// ─── Step Card ────────────────────────────────────────────────────────────────

interface StepCardProps {
  step: SequenceStep;
  index: number;
  isFirst: boolean;
  templates: EmailTemplate[];
  onChange: (updated: SequenceStep) => void;
  onRemove: () => void;
}

function StepCard({ step, index, isFirst, templates, onChange, onRemove }: StepCardProps) {
  const [templatePickerId, setTemplatePickerId] = useState<string>("");

  async function applyTemplate(templateId: string) {
    if (!templateId) return;
    const tpl = templates.find((t) => String(t.id) === templateId);
    if (tpl) {
      onChange({ ...step, subject: tpl.subject, bodyHtml: tpl.bodyHtml, emailTemplateId: tpl.id });
    }
    setTemplatePickerId("");
  }

  return (
    <div className="rounded-lg border bg-white p-4 space-y-3">
      {/* Step header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
            {index + 1}
          </span>
          <span className="text-sm font-medium text-gray-700">Step {index + 1}</span>
        </div>
        {!isFirst && (
          <button
            type="button"
            onClick={onRemove}
            className="text-gray-400 hover:text-red-500 transition-colors"
            title="Remove step"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Delay */}
      <div className="flex items-center gap-2">
        <Label className="text-xs whitespace-nowrap text-gray-600">Delay:</Label>
        <input
          type="number"
          min={0}
          value={step.delayDays}
          onChange={(e) =>
            onChange({ ...step, delayDays: Math.max(0, Number(e.target.value)) })
          }
          className="w-16 rounded border border-gray-200 px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <span className="text-xs text-gray-500">
          days after {index === 0 ? "sequence start" : "previous step"}
        </span>
      </div>

      {/* Load from template */}
      <div className="flex items-center gap-2">
        <Label className="text-xs text-gray-600 whitespace-nowrap">Load from template:</Label>
        <select
          value={templatePickerId}
          onChange={(e) => {
            setTemplatePickerId(e.target.value);
            applyTemplate(e.target.value);
          }}
          className="flex-1 rounded border border-gray-200 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Select template…</option>
          {templates.map((t) => (
            <option key={t.id} value={String(t.id)}>
              {t.title}
            </option>
          ))}
        </select>
      </div>

      {/* Subject */}
      <div className="space-y-1.5">
        <Label className="text-xs text-gray-600">Subject</Label>
        <Input
          value={step.subject}
          onChange={(e) => onChange({ ...step, subject: e.target.value })}
          placeholder="Email subject (supports {{variables}})"
          className="text-sm"
        />
      </div>

      {/* Body */}
      <div className="space-y-1.5">
        <Label className="text-xs text-gray-600">Body</Label>
        <TiptapEditor
          content={step.bodyHtml}
          onChange={(html) => onChange({ ...step, bodyHtml: html })}
          showVariables={true}
          minHeight="150px"
          placeholder="Write the email body…"
        />
      </div>
    </div>
  );
}

// ─── Main Editor ──────────────────────────────────────────────────────────────

interface SequenceEditorClientProps {
  initialData?: WPSequencePost;
}

export function SequenceEditorClient({ initialData }: SequenceEditorClientProps) {
  const router = useRouter();
  const isNew = !initialData;

  // Settings
  const [name, setName] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.acf?.description ?? "");
  const [trigger, setTrigger] = useState<SequenceTrigger>(
    initialData?.acf?.trigger ?? "manual"
  );
  const [triggerDelayDays, setTriggerDelayDays] = useState(
    initialData?.acf?.trigger_delay_days ?? 0
  );
  const [exitConditions, setExitConditions] = useState<string[]>(
    initialData?.acf?.exit_conditions ?? []
  );
  const [isActive, setIsActive] = useState(initialData?.acf?.is_active ?? false);

  // Steps
  const initSteps = (): SequenceStep[] => {
    const raw = initialData?.acf?.steps;
    if (Array.isArray(raw) && raw.length > 0) {
      return raw.map((s) => ({
        _key: uid(),
        delayDays: s.delay_days ?? 0,
        subject: s.subject ?? "",
        bodyHtml: s.body_html ?? "",
        emailTemplateId: s.email_template_id,
      }));
    }
    return [{ _key: uid(), delayDays: 0, subject: "", bodyHtml: "" }];
  };

  const [steps, setSteps] = useState<SequenceStep[]>(initSteps);

  // Saving & syncing
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [savedId, setSavedId] = useState<string | undefined>(initialData?.id);
  const [loopsId, setLoopsId] = useState<string | undefined>(
    initialData?.acf?.seq_loops_id
  );

  // Preview
  const [previewOpen, setPreviewOpen] = useState(false);

  // Templates for "Load from template"
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);

  useEffect(() => {
    fetch("/api/admin/email/templates")
      .then((r) => r.json())
      .then((d) => setTemplates(d.templates ?? d ?? []))
      .catch(() => {});
  }, []);

  // ── Step helpers ──

  function addStep() {
    setSteps((prev) => [
      ...prev,
      { _key: uid(), delayDays: 1, subject: "", bodyHtml: "" },
    ]);
  }

  function removeStep(key: string) {
    setSteps((prev) => prev.filter((s) => s._key !== key));
  }

  function updateStep(key: string, updated: SequenceStep) {
    setSteps((prev) => prev.map((s) => (s._key === key ? updated : s)));
  }

  // ── Exit conditions ──

  function toggleExit(id: string) {
    setExitConditions((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  // ── Validation ──

  function validate(): string | null {
    if (!name.trim()) return "Sequence name is required";
    if (steps.length === 0) return "At least one step is required";
    for (let i = 0; i < steps.length; i++) {
      if (!steps[i].subject.trim()) return `Step ${i + 1} is missing a subject`;
      if (!steps[i].bodyHtml || steps[i].bodyHtml === "<p></p>")
        return `Step ${i + 1} is missing body content`;
    }
    return null;
  }

  // ── Save ──

  async function handleSave() {
    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name,
        description,
        trigger,
        triggerDelayDays: trigger !== "manual" ? triggerDelayDays : 0,
        exitConditions,
        isActive,
        steps: steps.map((s, i) => ({
          stepNumber: i + 1,
          delayDays: s.delayDays,
          subject: s.subject,
          bodyHtml: s.bodyHtml,
          emailTemplateId: s.emailTemplateId,
        })),
      };

      const url = savedId
        ? `/api/admin/sequences/${savedId}`
        : "/api/admin/sequences";
      const method = savedId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save");

      const newId = data.id ?? data.sequenceId ?? savedId;
      toast.success(savedId ? "Sequence updated" : "Sequence created");

      if (isNew && newId) {
        router.replace(`/admin/sequences/${newId}`);
      } else {
        setSavedId(newId);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  // ── Sync to Loops ──

  async function handleSync() {
    if (!savedId) {
      toast.error("Save the sequence first before syncing");
      return;
    }
    setSyncing(true);
    try {
      const res = await fetch(`/api/admin/sequences/${savedId}/sync`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Sync failed");
      setLoopsId(data.loopsId ?? data.seq_loops_id ?? loopsId);
      toast.success("Synced to Loops successfully");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setSyncing(false);
    }
  }

  // ── Render ──

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isNew ? "New Sequence" : name || "Edit Sequence"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isNew ? "Set up your automated email sequence." : "Edit sequence settings and steps."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreviewOpen(true)}
            disabled={steps.length === 0}
          >
            <Eye className="h-4 w-4 mr-1.5" />
            Preview
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
            {savedId ? "Save Changes" : "Create Sequence"}
          </Button>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left: Settings ── */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Sequence Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">

              {/* Name */}
              <div className="space-y-1.5">
                <Label htmlFor="seq-name">Name <span className="text-red-500">*</span></Label>
                <Input
                  id="seq-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Sequence name"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label htmlFor="seq-desc">Description <span className="text-xs text-gray-400">(internal)</span></Label>
                <textarea
                  id="seq-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this sequence for?"
                  rows={3}
                  className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              {/* Trigger */}
              <div className="space-y-1.5">
                <Label htmlFor="seq-trigger">Trigger</Label>
                <select
                  id="seq-trigger"
                  value={trigger}
                  onChange={(e) => setTrigger(e.target.value as SequenceTrigger)}
                  className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {TRIGGERS.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Trigger delay days — only for non-manual */}
              {trigger !== "manual" && (
                <div className="space-y-1.5">
                  <Label htmlFor="seq-delay">Trigger Delay Days</Label>
                  <input
                    id="seq-delay"
                    type="number"
                    min={0}
                    value={triggerDelayDays}
                    onChange={(e) =>
                      setTriggerDelayDays(Math.max(0, Number(e.target.value)))
                    }
                    className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-xs text-gray-400">
                    Days after trigger event before sequence starts
                  </p>
                </div>
              )}

              {/* Exit conditions */}
              <div className="space-y-2">
                <Label>Exit Conditions</Label>
                <div className="space-y-2">
                  {EXIT_CONDITIONS.map((c) => (
                    <div key={c.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`exit-${c.id}`}
                        checked={exitConditions.includes(c.id)}
                        onCheckedChange={() => toggleExit(c.id)}
                      />
                      <label
                        htmlFor={`exit-${c.id}`}
                        className="text-sm text-gray-700 cursor-pointer"
                      >
                        {c.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active toggle */}
              <div className="flex items-center justify-between pt-1">
                <Label htmlFor="seq-active">Active</Label>
                <Switch
                  id="seq-active"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
              </div>

              {/* Loops sync */}
              <div className="border-t pt-4 space-y-2">
                <Label className="text-xs text-gray-500 uppercase tracking-wide">Loops Sync</Label>
                <p className="text-sm text-gray-600">
                  {loopsId ? (
                    <span className="text-green-700 font-medium">Synced: {loopsId}</span>
                  ) : (
                    <span className="text-amber-600">Not synced yet</span>
                  )}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSync}
                  disabled={!savedId || syncing}
                  className="w-full"
                >
                  {syncing ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-1.5" />
                  )}
                  {savedId ? "Sync to Loops" : "Save first to sync"}
                </Button>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* ── Right: Steps ── */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Steps</CardTitle>
                <span className="text-xs text-gray-400">
                  {steps.length} {steps.length === 1 ? "step" : "steps"}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {steps.length === 0 && (
                <p className="text-sm text-amber-600 text-center py-4">
                  At least one step is required.
                </p>
              )}

              {steps.map((step, index) => (
                <StepCard
                  key={step._key}
                  step={step}
                  index={index}
                  isFirst={index === 0}
                  templates={templates}
                  onChange={(updated) => updateStep(step._key, updated)}
                  onRemove={() => removeStep(step._key)}
                />
              ))}

              <Button
                variant="outline"
                size="sm"
                onClick={addStep}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Add Step
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Sequence Preview: {name || "Untitled"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {steps.map((step, index) => (
              <div key={step._key} className="rounded-lg border p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-gray-700">
                    Step {index + 1}
                  </span>
                  <span className="text-xs text-gray-400">
                    — {step.delayDays} day{step.delayDays !== 1 ? "s" : ""} after{" "}
                    {index === 0 ? "sequence start" : "previous step"}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  Subject: {step.subject || <span className="text-gray-400 italic">No subject</span>}
                </p>
                {step.bodyHtml ? (
                  <div
                    className="prose prose-sm max-w-none text-gray-700 border rounded-md p-3 bg-gray-50"
                    dangerouslySetInnerHTML={{ __html: step.bodyHtml }}
                  />
                ) : (
                  <p className="text-sm text-gray-400 italic">No body content</p>
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
