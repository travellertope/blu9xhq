"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft, Loader2, Send, Paperclip, Lock, AlertTriangle, Clock, Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  formatStatus,
  formatPriority,
  statusBadgeColor,
  priorityBadgeColor,
} from "@/lib/ticket-utils";

interface Reply {
  id: number;
  authorId: number;
  authorName?: string;
  replyType: "reply" | "internal_note";
  body: string;
  createdAt: string;
}

interface Attachment {
  id: number;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSizeKb: number;
  uploadedBy: number;
  replyId?: number;
  createdAt: string;
}

interface TeamMember {
  id: number;
  name: string;
}

interface TicketDetail {
  id: number;
  ticketNumber: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  assignedTo?: number;
  submittedBy: number;
  firstResponseAt: string | null;
  resolvedAt: string | null;
  slaResponseTarget: string | null;
  slaResolveTarget: string | null;
  slaAlertedAt: string | null;
  clientName: string;
  createdAt: string;
  replies: Reply[];
  attachments: Attachment[];
}

function formatBytes(kb: number) {
  if (kb < 1024) return `${kb} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

function SlaStatus({
  label,
  target,
  met,
}: {
  label: string;
  target: string | null;
  met: boolean;
}) {
  if (!target) return null;
  const breached = !met && new Date(target) < new Date();
  return (
    <div className="flex items-center gap-1.5">
      {breached ? (
        <AlertTriangle size={12} className="text-red-500" />
      ) : (
        <Clock size={12} className="text-muted-foreground" />
      )}
      <span className={`text-xs ${breached ? "text-red-600 font-medium" : "text-muted-foreground"}`}>
        {label}:{" "}
        {new Date(target).toLocaleString("en-GB", {
          day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
        })}
        {breached && " (breached)"}
        {met && " ✓"}
      </span>
    </div>
  );
}

const STATUSES = [
  "open", "in_progress", "awaiting_client", "awaiting_internal", "resolved", "closed",
];

const PRIORITIES = ["urgent", "high", "normal", "low"];

export default function AdminTicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  // Edit panel state
  const [editStatus, setEditStatus] = useState("");
  const [editPriority, setEditPriority] = useState("");
  const [editAssignedTo, setEditAssignedTo] = useState("");
  const [saving, setSaving] = useState(false);

  // Reply state
  const [replyBody, setReplyBody] = useState("");
  const [replyType, setReplyType] = useState<"reply" | "internal_note">("reply");
  const [sending, setSending] = useState(false);

  // Attachment
  const [stagedFile, setStagedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(() =>
    fetch(`/api/admin/tickets/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setTicket(d);
        setEditStatus(d.status);
        setEditPriority(d.priority);
        setEditAssignedTo(d.assignedTo ? String(d.assignedTo) : "");
      })
      .catch(() => toast.error("Failed to load ticket"))
      .finally(() => setLoading(false)),
  [id]);

  useEffect(() => {
    load();
    fetch("/api/admin/team")
      .then((r) => r.json())
      .then((d) => setTeamMembers(d.members ?? []))
      .catch(() => undefined);
  }, [load]);

  const saveChanges = async () => {
    if (!ticket) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/tickets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: editStatus || undefined,
          priority: editPriority || undefined,
          assignedTo: editAssignedTo ? Number(editAssignedTo) : undefined,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Failed to save");
      }
      toast.success("Ticket updated");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyBody.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/admin/tickets/${id}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: replyBody, replyType }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Failed to send");
      }
      const { id: replyId } = await res.json();
      setReplyBody("");

      if (stagedFile) {
        const fd = new FormData();
        fd.append("file", stagedFile);
        fd.append("replyId", String(replyId));
        const attRes = await fetch(`/api/admin/tickets/${id}/attachments`, { method: "POST", body: fd });
        setStagedFile(null);
        if (!attRes.ok) {
          const d = await attRes.json();
          toast.warning(`Reply sent, but file upload failed: ${d.error ?? "Unknown error"}`);
        }
      }

      toast.success(replyType === "internal_note" ? "Internal note added" : "Reply sent");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send");
    } finally {
      setSending(false);
    }
  };

  const deleteTicket = async () => {
    if (!confirm("Delete this ticket? This will permanently remove all replies, attachments, and uploaded files. This cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/tickets/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Failed to delete");
      }
      toast.success("Ticket deleted");
      router.push("/admin/tickets");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete ticket");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="h-32 bg-muted rounded-xl animate-pulse" />
        <div className="h-64 bg-muted rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        <p>Ticket not found.</p>
        <Button asChild className="mt-4" variant="outline">
          <Link href="/admin/tickets">Back to tickets</Link>
        </Button>
      </div>
    );
  }

  const resolveAuthorName = (authorId: number): string => {
    if (ticket && authorId === ticket.submittedBy) return ticket.clientName || "Client";
    const member = teamMembers.find((m) => m.id === authorId);
    return member?.name ?? `User #${authorId}`;
  };

  const hasChanges =
    editStatus !== ticket.status ||
    editPriority !== ticket.priority ||
    editAssignedTo !== (ticket.assignedTo ? String(ticket.assignedTo) : "");

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/tickets">
            <ArrowLeft size={15} className="mr-1" />
            Tickets
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket header */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-xs font-mono text-muted-foreground mb-1">{ticket.ticketNumber}</p>
                  <CardTitle className="text-lg">{ticket.subject}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{ticket.clientName}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${statusBadgeColor(ticket.status)}`}>
                    {formatStatus(ticket.status)}
                  </span>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${priorityBadgeColor(ticket.priority)}`}>
                    {formatPriority(ticket.priority)}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2 border-t pt-4">
              <div className="flex gap-6 flex-wrap">
                <span><strong className="text-foreground">Category:</strong> {ticket.category.replace(/_/g, " ")}</span>
                <span><strong className="text-foreground">Submitted:</strong> {new Date(ticket.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                {ticket.resolvedAt && (
                  <span><strong className="text-foreground">Resolved:</strong> {new Date(ticket.resolvedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                )}
              </div>
              {/* SLA targets */}
              <div className="space-y-1 pt-1">
                <SlaStatus
                  label="Response target"
                  target={ticket.slaResponseTarget}
                  met={!!ticket.firstResponseAt}
                />
                <SlaStatus
                  label="Resolve target"
                  target={ticket.slaResolveTarget}
                  met={!!ticket.resolvedAt}
                />
              </div>
            </CardContent>
          </Card>

          {/* Unified conversation timeline */}
          {(() => {
            type TimelineItem =
              | { kind: "reply"; id: number; authorId: number; replyType: "reply" | "internal_note"; body: string; createdAt: string; attachments: Attachment[] }
              | { kind: "attachment"; id: number; uploadedBy: number; fileName: string; fileUrl: string; fileSizeKb: number; createdAt: string };

            const timeline: TimelineItem[] = [
              ...ticket.replies.map((r): TimelineItem => ({
                kind: "reply", ...r,
                attachments: ticket.attachments.filter((a) => a.replyId === r.id),
              })),
              ...ticket.attachments
                .filter((a) => !a.replyId)
                .map((a): TimelineItem => ({
                  kind: "attachment",
                  id: a.id, uploadedBy: a.uploadedBy,
                  fileName: a.fileName, fileUrl: a.fileUrl, fileSizeKb: a.fileSizeKb,
                  createdAt: a.createdAt,
                })),
            ].sort((x, y) => new Date(x.createdAt).getTime() - new Date(y.createdAt).getTime());

            return (
              <div className="space-y-3">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Conversation ({ticket.replies.length})
                </h2>

                {timeline.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">No replies yet.</p>
                ) : (
                  timeline.map((item) => {
                    if (item.kind === "reply") {
                      const isInternal = item.replyType === "internal_note";
                      return (
                        <div
                          key={`r-${item.id}`}
                          className={`rounded-xl border p-4 space-y-2 ${isInternal ? "bg-amber-50 border-amber-200" : "bg-card"}`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              {isInternal && (
                                <span className="flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                                  <Lock size={10} />
                                  Internal note
                                </span>
                              )}
                              <span className="text-xs font-medium text-muted-foreground">
                                {resolveAuthorName(item.authorId)}
                              </span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(item.createdAt).toLocaleString("en-GB", {
                                day: "numeric", month: "short", year: "numeric",
                                hour: "2-digit", minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{item.body}</p>
                          {item.attachments.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-1">
                              {item.attachments.map((a) => (
                                <a
                                  key={a.id}
                                  href={`/api/admin/tickets/${ticket.id}/attachments/download?key=${encodeURIComponent(a.fileUrl)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs bg-muted hover:bg-muted/70 rounded px-2 py-1 flex items-center gap-1 transition-colors"
                                >
                                  <Paperclip size={11} />
                                  {a.fileName}{" "}
                                  <span className="text-muted-foreground">({formatBytes(a.fileSizeKb)})</span>
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    }

                    return (
                      <div key={`a-${item.id}`} className="rounded-xl border p-4 space-y-2 bg-card">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-medium text-muted-foreground">
                            {resolveAuthorName(item.uploadedBy)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(item.createdAt).toLocaleString("en-GB", {
                              day: "numeric", month: "short", year: "numeric",
                              hour: "2-digit", minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <a
                          href={`/api/admin/tickets/${ticket.id}/attachments/download?key=${encodeURIComponent(item.fileUrl)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs bg-muted hover:bg-muted/70 rounded px-2 py-1 inline-flex items-center gap-1 transition-colors"
                        >
                          <Paperclip size={11} />
                          {item.fileName}{" "}
                          <span className="text-muted-foreground">({formatBytes(item.fileSizeKb)})</span>
                        </a>
                      </div>
                    );
                  })
                )}
              </div>
            );
          })()}

          {/* Reply / note form */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-sm font-medium">
                  {replyType === "internal_note" ? "Add internal note" : "Add a reply"}
                </CardTitle>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setReplyType("reply")}
                    className={`px-2.5 py-1 text-xs rounded-full border font-medium transition-colors ${
                      replyType === "reply"
                        ? "bg-foreground text-background border-foreground"
                        : "border-border text-muted-foreground hover:border-foreground/40"
                    }`}
                  >
                    Reply to client
                  </button>
                  <button
                    type="button"
                    onClick={() => setReplyType("internal_note")}
                    className={`px-2.5 py-1 text-xs rounded-full border font-medium transition-colors flex items-center gap-1 ${
                      replyType === "internal_note"
                        ? "bg-amber-600 text-white border-amber-600"
                        : "border-border text-muted-foreground hover:border-foreground/40"
                    }`}
                  >
                    <Lock size={10} />
                    Internal note
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={sendReply} className="space-y-3">
                <Textarea
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  placeholder={
                    replyType === "internal_note"
                      ? "Internal note — not visible to client…"
                      : "Type your reply here…"
                  }
                  rows={4}
                  className={`resize-none ${replyType === "internal_note" ? "border-amber-300 bg-amber-50/50" : ""}`}
                  disabled={sending}
                />
                {stagedFile && (
                  <div className="flex items-center gap-1.5 text-xs bg-muted rounded px-2 py-1 w-fit">
                    <Paperclip size={11} />
                    <span className="max-w-[200px] truncate">{stagedFile.name}</span>
                    <button
                      type="button"
                      onClick={() => setStagedFile(null)}
                      className="ml-1 text-muted-foreground hover:text-foreground leading-none"
                      aria-label="Remove file"
                    >
                      ×
                    </button>
                  </div>
                )}
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.txt,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) setStagedFile(f);
                        e.target.value = "";
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={sending}
                      className="text-muted-foreground"
                    >
                      <Paperclip size={14} />
                      <span className="ml-1.5 text-xs">Attach file</span>
                    </Button>
                  </div>
                  <Button
                    type="submit"
                    disabled={sending || !replyBody.trim()}
                    size="sm"
                    className={replyType === "internal_note" ? "bg-amber-600 hover:bg-amber-700" : ""}
                  >
                    {sending ? (
                      <Loader2 size={14} className="animate-spin mr-1.5" />
                    ) : (
                      <Send size={14} className="mr-1.5" />
                    )}
                    {replyType === "internal_note" ? "Save Note" : "Send Reply"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar column */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Ticket controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Status</Label>
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {formatStatus(s)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Priority</Label>
                <Select value={editPriority} onValueChange={setEditPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => (
                      <SelectItem key={p} value={p}>
                        {formatPriority(p)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Assigned to</Label>
                <Select
                  value={editAssignedTo || "__unassigned__"}
                  onValueChange={(v) => setEditAssignedTo(v === "__unassigned__" ? "" : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__unassigned__">Unassigned</SelectItem>
                    {teamMembers.map((m) => (
                      <SelectItem key={m.id} value={String(m.id)}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                className="w-full"
                size="sm"
                onClick={saveChanges}
                disabled={saving || !hasChanges}
              >
                {saving ? <Loader2 size={14} className="animate-spin mr-1.5" /> : null}
                Save changes
              </Button>
              <Button
                className="w-full"
                size="sm"
                variant="destructive"
                onClick={deleteTicket}
                disabled={deleting}
              >
                {deleting ? (
                  <Loader2 size={14} className="animate-spin mr-1.5" />
                ) : (
                  <Trash2 size={14} className="mr-1.5" />
                )}
                Delete ticket
              </Button>
            </CardContent>
          </Card>

          {/* SLA summary card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">SLA</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground text-xs">First response</span>
                <span className="text-xs font-medium">
                  {ticket.firstResponseAt
                    ? new Date(ticket.firstResponseAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
                    : "Pending"}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground text-xs">Resolved</span>
                <span className="text-xs font-medium">
                  {ticket.resolvedAt
                    ? new Date(ticket.resolvedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
                    : "Pending"}
                </span>
              </div>
              {ticket.slaAlertedAt && (
                <p className="text-xs text-orange-500 pt-1">
                  SLA breach alerted {new Date(ticket.slaAlertedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
