"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Trash2, ExternalLink, Search, ChevronLeft, ChevronRight, Mail } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmailComposer } from "@/components/admin/EmailComposer";
import { TiptapEditor } from "@/components/admin/TiptapEditor";
import { PermissionGuard } from "@/components/shared/PermissionGuard";
import { useSearchParams, useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

type TemplateType =
  | "onboarding"
  | "invoice"
  | "follow_up"
  | "check_in"
  | "general"
  | "portal_invite"
  | "report";

interface EmailTemplate {
  id: number;
  title: string;
  subject: string;
  bodyHtml: string;
  type: TemplateType;
}

interface WPSequencePost {
  id: string;
  title: string;
  acf: {
    trigger?: string;
    is_active?: boolean;
    seq_loops_id?: string;
    steps?: unknown[];
  };
}

// ─── Type badge ───────────────────────────────────────────────────────────────

const TYPE_COLORS: Record<TemplateType, string> = {
  onboarding:   "bg-indigo-100 text-indigo-700",
  invoice:      "bg-amber-100 text-amber-700",
  follow_up:    "bg-blue-100 text-blue-700",
  check_in:     "bg-green-100 text-green-700",
  general:      "bg-slate-100 text-slate-700",
  portal_invite:"bg-purple-100 text-purple-700",
  report:       "bg-rose-100 text-rose-700",
};

function TypeBadge({ type }: { type: TemplateType }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_COLORS[type] ?? "bg-slate-100 text-slate-700"}`}>
      {type.replace("_", " ")}
    </span>
  );
}

// ─── Trigger badge (Sequences tab) ───────────────────────────────────────────

const TRIGGER_COLORS: Record<string, string> = {
  manual:                  "bg-slate-100 text-slate-700",
  subscription_assigned:   "bg-indigo-100 text-indigo-700",
  invoice_overdue:         "bg-amber-100 text-amber-700",
  client_inactive:         "bg-orange-100 text-orange-700",
  cancellation_requested:  "bg-red-100 text-red-700",
};

function TriggerBadge({ trigger }: { trigger?: string }) {
  const t = trigger ?? "manual";
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${TRIGGER_COLORS[t] ?? "bg-slate-100 text-slate-700"}`}>
      {t.replace(/_/g, " ")}
    </span>
  );
}

// ─── Templates tab ────────────────────────────────────────────────────────────

const BLANK_TEMPLATE: Omit<EmailTemplate, "id"> = {
  title: "",
  subject: "",
  bodyHtml: "",
  type: "general",
};

function TemplatesTab() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<EmailTemplate | null>(null);
  const [form, setForm] = useState<Omit<EmailTemplate, "id">>(BLANK_TEMPLATE);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [seeding, setSeeding] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/email/templates");
      const data = await res.json();
      setTemplates(data.templates ?? data ?? []);
    } catch {
      toast.error("Failed to load templates");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function openNew() {
    setEditing(null);
    setForm(BLANK_TEMPLATE);
    setDialogOpen(true);
  }

  function openEdit(t: EmailTemplate) {
    setEditing(t);
    setForm({ title: t.title, subject: t.subject, bodyHtml: t.bodyHtml, type: t.type });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.title.trim() || !form.subject.trim()) {
      toast.error("Name and subject are required");
      return;
    }
    setSaving(true);
    try {
      const url = editing
        ? `/api/admin/email/templates/${editing.id}`
        : "/api/admin/email/templates";
      const method = editing ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save");
      toast.success(editing ? "Template updated" : "Template created");
      setDialogOpen(false);
      await load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleSeedDefaults() {
    setSeeding(true);
    try {
      const res = await fetch("/api/admin/seed/templates", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Seed failed");
      toast.success(`Seeded ${data.created} template${data.created !== 1 ? "s" : ""}${data.skipped ? ` (${data.skipped} already existed)` : ""}`);
      await load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to seed templates");
    } finally {
      setSeeding(false);
    }
  }

  async function handleDelete(t: EmailTemplate) {
    if (!confirm(`Delete template "${t.title}"? This cannot be undone.`)) return;
    setDeletingId(t.id);
    try {
      const res = await fetch(`/api/admin/email/templates/${t.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to delete");
      }
      toast.success("Template deleted");
      await load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-700">Email Templates</h2>
        <PermissionGuard permission="build_sequences">
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleSeedDefaults} disabled={seeding}>
              {seeding ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              {seeding ? "Seeding…" : "Seed Defaults"}
            </Button>
            <Button size="sm" onClick={openNew}>
              <Plus className="h-4 w-4 mr-1" />
              New Template
            </Button>
          </div>
        </PermissionGuard>
      </div>

      <div className="rounded-lg border bg-white overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-gray-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading templates…
          </div>
        ) : templates.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">
            No templates yet. Create your first email template.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-gray-500">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Subject</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {templates.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{t.title}</td>
                  <td className="px-4 py-3">
                    <TypeBadge type={t.type} />
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{t.subject}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => openEdit(t)}
                        className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        <Pencil className="h-3 w-3" />
                        Edit
                      </button>
                      <PermissionGuard permission="build_sequences">
                        <button
                          onClick={() => handleDelete(t)}
                          disabled={deletingId === t.id}
                          className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium disabled:opacity-40"
                        >
                          {deletingId === t.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                          Delete
                        </button>
                      </PermissionGuard>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Template" : "New Template"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="tpl-name">Name</Label>
                <Input
                  id="tpl-name"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Template name"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tpl-type">Type</Label>
                <select
                  id="tpl-type"
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as TemplateType }))}
                  className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="onboarding">Onboarding</option>
                  <option value="invoice">Invoice</option>
                  <option value="follow_up">Follow-up</option>
                  <option value="check_in">Check-in</option>
                  <option value="general">General</option>
                  <option value="portal_invite">Portal Invite</option>
                  <option value="report">Report</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tpl-subject">Subject</Label>
              <Input
                id="tpl-subject"
                value={form.subject}
                onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                placeholder="Email subject line"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Body</Label>
              <TiptapEditor
                content={form.bodyHtml}
                onChange={(html) => setForm((f) => ({ ...f, bodyHtml: html }))}
                showVariables={true}
                minHeight="200px"
                placeholder="Write your email body…"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
              {editing ? "Save Changes" : "Create Template"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Sequences tab ────────────────────────────────────────────────────────────

function SequencesTab() {
  const [sequences, setSequences] = useState<WPSequencePost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/sequences");
        const data = await res.json();
        setSequences(data.sequences ?? data ?? []);
      } catch {
        toast.error("Failed to load sequences");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-700">Email Sequences</h2>
        <div className="flex items-center gap-2">
          <PermissionGuard permission="build_sequences">
            <Button size="sm" asChild>
              <Link href="/admin/sequences/new">
                <Plus className="h-4 w-4 mr-1" />
                New Sequence
              </Link>
            </Button>
          </PermissionGuard>
          <Button size="sm" variant="outline" asChild>
            <Link href="/admin/sequences">
              Manage Sequences
              <ExternalLink className="h-3 w-3 ml-1.5" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-white overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-gray-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading sequences…
          </div>
        ) : sequences.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">
            No sequences yet.{" "}
            <Link href="/admin/sequences/new" className="text-indigo-600 hover:underline">
              Create your first sequence
            </Link>
            .
          </div>
        ) : (
          <div className="divide-y">
            {sequences.map((seq) => (
              <div
                key={seq.id}
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-2 w-2 rounded-full flex-shrink-0 ${
                      seq.acf?.is_active ? "bg-green-500" : "bg-gray-300"
                    }`}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{seq.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <TriggerBadge trigger={seq.acf?.trigger} />
                    </div>
                  </div>
                </div>
                <Link
                  href={`/admin/sequences/${seq.id}`}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Edit →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sent Log tab ─────────────────────────────────────────────────────────────

interface SentLogEntry {
  id: number;
  sentAt: string;
  clientId: number;
  clientName: string;
  subject: string;
  preview: string;
  emailStatus: string;
  loggedBy: number;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    sent:     "bg-green-100 text-green-700",
    failed:   "bg-red-100 text-red-700",
    bounced:  "bg-orange-100 text-orange-700",
    delivered:"bg-blue-100 text-blue-700",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${map[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

function SentLogTab() {
  const [entries, setEntries] = useState<SentLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function load(p: number, q: string) {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), perPage: "20" });
      if (q) params.set("search", q);
      const res  = await fetch(`/api/admin/email/sent-log?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load");
      setEntries(data.entries ?? []);
      setTotalPages(data.totalPages ?? 1);
      setTotal(data.total ?? 0);
      setPage(data.page ?? p);
    } catch {
      toast.error("Failed to load sent log");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(1, ""); }, []);

  function handleSearchChange(value: string) {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => load(1, value), 400);
  }

  function goToPage(p: number) {
    if (p < 1 || p > totalPages) return;
    load(p, search);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            type="search"
            placeholder="Search by subject…"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full rounded-md border border-gray-200 bg-white pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <p className="text-xs text-gray-400">{total} email{total !== 1 ? "s" : ""} sent</p>
      </div>

      <div className="rounded-lg border bg-white overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-gray-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading…
          </div>
        ) : entries.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400 space-y-2">
            <Mail className="h-8 w-8 mx-auto text-gray-300" />
            <p>{search ? "No emails match your search." : "No emails sent yet."}</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-xs text-gray-500">
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Client</th>
                <th className="px-4 py-3 font-medium">Subject / Preview</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {entries.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                    {new Date(e.sentAt).toLocaleString("en-GB", {
                      day: "numeric", month: "short", year: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {e.clientId ? (
                      <Link
                        href={`/admin/clients/${e.clientId}`}
                        className="text-indigo-600 hover:text-indigo-800 font-medium text-xs"
                      >
                        {e.clientName}
                      </Link>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <p className="font-medium text-gray-900 truncate">{e.subject}</p>
                    {e.preview && (
                      <p className="text-xs text-gray-400 truncate mt-0.5">{e.preview}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <StatusBadge status={e.emailStatus} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span className="text-xs">Page {page} of {totalPages}</span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1 || loading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages || loading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTab = searchParams.get("tab") ?? "composer";

  function handleTabChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.replace(`/admin/email?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Email</h1>
        <p className="text-sm text-gray-500 mt-1">
          Compose, manage templates, and send sequences.
        </p>
      </div>

      <Tabs defaultValue={initialTab} onValueChange={handleTabChange}>
        <TabsList className="mb-6">
          <TabsTrigger value="composer">Composer</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="sequences">Sequences</TabsTrigger>
          <TabsTrigger value="sent-log">Sent Log</TabsTrigger>
        </TabsList>

        <TabsContent value="composer">
          <EmailComposer open={false} onClose={() => {}} expanded={true} />
        </TabsContent>

        <TabsContent value="templates">
          <TemplatesTab />
        </TabsContent>

        <TabsContent value="sequences">
          <SequencesTab />
        </TabsContent>

        <TabsContent value="sent-log">
          <SentLogTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
