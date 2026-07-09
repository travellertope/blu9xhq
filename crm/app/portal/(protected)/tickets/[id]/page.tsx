"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Send, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { formatStatus, formatPriority, statusBadgeColor, priorityBadgeColor } from "@/lib/ticket-utils";

interface Reply {
  id: number;
  authorId: number;
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

interface TicketDetail {
  id: number;
  ticketNumber: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  firstResponseAt: string | null;
  resolvedAt: string | null;
  createdAt: string;
  replies: Reply[];
  attachments: Attachment[];
}

function formatBytes(kb: number) {
  if (kb < 1024) return `${kb} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export default function PortalTicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const wpUserId = (session?.user as { wpUserId?: number })?.wpUserId;

  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyBody, setReplyBody] = useState("");
  const [sending, setSending] = useState(false);
  const [stagedFile, setStagedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = () =>
    fetch(`/api/portal/tickets/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setTicket(d);
      })
      .catch(() => toast.error("Failed to load ticket"))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, [id]);

  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyBody.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/portal/tickets/${id}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: replyBody }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Failed to send reply");
      }
      const { id: replyId } = await res.json();
      setReplyBody("");

      if (stagedFile) {
        const fd = new FormData();
        fd.append("file", stagedFile);
        fd.append("replyId", String(replyId));
        const attRes = await fetch(`/api/portal/tickets/${id}/attachments`, { method: "POST", body: fd });
        setStagedFile(null);
        if (!attRes.ok) {
          const d = await attRes.json();
          toast.warning(`Reply sent, but file upload failed: ${d.error ?? "Unknown error"}`);
        }
      }

      toast.success("Reply sent");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send reply");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="h-32 bg-muted rounded-xl animate-pulse" />
        <div className="h-48 bg-muted rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        <p>Ticket not found.</p>
        <Button asChild className="mt-4" variant="outline">
          <Link href="/portal/tickets">Back to tickets</Link>
        </Button>
      </div>
    );
  }

  const isClosed = ticket.status === "closed";

  type TimelineItem =
    | { kind: "reply"; id: number; authorId: number; body: string; createdAt: string; attachments: Attachment[] }
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
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/portal/tickets">
            <ArrowLeft size={15} className="mr-1" />
            Tickets
          </Link>
        </Button>
      </div>

      {/* Ticket header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs font-mono text-muted-foreground mb-1">{ticket.ticketNumber}</p>
              <CardTitle className="text-lg">{ticket.subject}</CardTitle>
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
        <CardContent className="text-sm text-muted-foreground space-y-1 border-t pt-4">
          <div className="flex gap-6 flex-wrap">
            <span><strong className="text-foreground">Category:</strong> {ticket.category.replace(/_/g, " ")}</span>
            <span><strong className="text-foreground">Submitted:</strong> {new Date(ticket.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
            {ticket.resolvedAt && (
              <span><strong className="text-foreground">Resolved:</strong> {new Date(ticket.resolvedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Unified conversation timeline */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Conversation ({ticket.replies.length})
        </h2>

        {timeline.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No replies yet. Our team will respond shortly.
          </p>
        ) : (
          timeline.map((item) => {
            const isMe = (item.kind === "reply" ? item.authorId : item.uploadedBy) === wpUserId;
            const bubbleClass = `rounded-xl border p-4 space-y-2 ${isMe ? "bg-primary/5 border-primary/20 ml-8" : "bg-card mr-8"}`;
            const timestamp = new Date(item.createdAt).toLocaleString("en-GB", {
              day: "numeric", month: "short", year: "numeric",
              hour: "2-digit", minute: "2-digit",
            });

            if (item.kind === "reply") {
              return (
                <div key={`r-${item.id}`} className={bubbleClass}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium">{isMe ? "You" : "BluuHQ Team"}</span>
                    <span className="text-xs text-muted-foreground">{timestamp}</span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{item.body}</p>
                  {item.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {item.attachments.map((a) => (
                        <a
                          key={a.id}
                          href={`/api/portal/tickets/${id}/attachments/download?key=${encodeURIComponent(a.fileUrl)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs bg-muted hover:bg-muted/70 rounded px-2 py-1 flex items-center gap-1 transition-colors"
                        >
                          <Paperclip size={11} />
                          {a.fileName} <span className="text-muted-foreground">({formatBytes(a.fileSizeKb)})</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <div key={`a-${item.id}`} className={bubbleClass}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium">{isMe ? "You" : "BluuHQ Team"}</span>
                  <span className="text-xs text-muted-foreground">{timestamp}</span>
                </div>
                <a
                  href={`/api/portal/tickets/${id}/attachments/download?key=${encodeURIComponent(item.fileUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs bg-muted hover:bg-muted/70 rounded px-2 py-1 inline-flex items-center gap-1 transition-colors"
                >
                  <Paperclip size={11} />
                  {item.fileName} <span className="text-muted-foreground">({formatBytes(item.fileSizeKb)})</span>
                </a>
              </div>
            );
          })
        )}
      </div>

      {/* Reply form */}
      {!isClosed && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Add a reply</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={sendReply} className="space-y-3">
              <Textarea
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                placeholder="Type your reply here…"
                rows={4}
                className="resize-none"
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
                <Button type="submit" disabled={sending || !replyBody.trim()} size="sm">
                  {sending ? <Loader2 size={14} className="animate-spin mr-1.5" /> : <Send size={14} className="mr-1.5" />}
                  Send Reply
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isClosed && (
        <p className="text-sm text-muted-foreground text-center py-4 border rounded-lg">
          This ticket is closed. <Link href="/portal/tickets/new" className="text-primary underline-offset-2 hover:underline">Submit a new ticket</Link> if you need further help.
        </p>
      )}
    </div>
  );
}
