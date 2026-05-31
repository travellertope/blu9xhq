"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { TicketCheck, ChevronRight, AlertTriangle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatStatus, formatPriority, statusBadgeColor, priorityBadgeColor } from "@/lib/ticket-utils";

interface TicketRow {
  id: number;
  ticketNumber: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  clientName: string;
  assignedToName?: string;
  slaStatus: "on_track" | "response_breached" | "resolve_breached";
  replyCount: number;
  createdAt: string;
}

const STATUS_OPTS = [
  { value: "all", label: "All Statuses" },
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "awaiting_client", label: "Awaiting Client" },
  { value: "awaiting_internal", label: "Awaiting Internal" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

const PRIORITY_OPTS = [
  { value: "all", label: "All Priorities" },
  { value: "urgent", label: "Urgent" },
  { value: "high", label: "High" },
  { value: "normal", label: "Normal" },
  { value: "low", label: "Low" },
];

function SlaIndicator({ slaStatus }: { slaStatus: TicketRow["slaStatus"] }) {
  if (slaStatus === "response_breached") {
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-red-600">
        <AlertTriangle size={11} />
        Response SLA
      </span>
    );
  }
  if (slaStatus === "resolve_breached") {
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-orange-500">
        <Clock size={11} />
        Resolve SLA
      </span>
    );
  }
  return null;
}

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const load = useCallback(() => {
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (priorityFilter !== "all") params.set("priority", priorityFilter);
    fetch(`/api/admin/tickets/dashboard?${params}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setTickets(d.tickets ?? []);
      })
      .catch(() => toast.error("Failed to load tickets"))
      .finally(() => setLoading(false));
  }, [statusFilter, priorityFilter]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  const breached = tickets.filter((t) => t.slaStatus !== "on_track");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Support Tickets</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {tickets.length} ticket{tickets.length !== 1 ? "s" : ""}
            {breached.length > 0 && (
              <span className="ml-2 text-red-600 font-medium">
                · {breached.length} SLA breach{breached.length !== 1 ? "es" : ""}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All Priorities" />
          </SelectTrigger>
          <SelectContent>
            {PRIORITY_OPTS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {(statusFilter !== "all" || priorityFilter !== "all") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setStatusFilter("all"); setPriorityFilter("all"); }}
          >
            Clear
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          <TicketCheck className="mx-auto mb-3 opacity-30" size={40} />
          <p className="font-medium">No tickets found</p>
          <p className="text-sm mt-1">Try adjusting your filters.</p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            {tickets.map((ticket) => (
              <Link
                key={ticket.id}
                href={`/admin/tickets/${ticket.id}`}
                className="flex items-center gap-4 px-4 py-4 border-b last:border-0 hover:bg-muted/20 transition-colors group"
              >
                {/* Priority stripe */}
                <div
                  className={`w-1 self-stretch rounded-full shrink-0 ${
                    ticket.priority === "urgent"
                      ? "bg-red-500"
                      : ticket.priority === "high"
                      ? "bg-orange-400"
                      : ticket.priority === "normal"
                      ? "bg-blue-400"
                      : "bg-slate-300"
                  }`}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-muted-foreground font-mono">
                      {ticket.ticketNumber}
                    </span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${statusBadgeColor(ticket.status)}`}>
                      {formatStatus(ticket.status)}
                    </span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${priorityBadgeColor(ticket.priority)}`}>
                      {formatPriority(ticket.priority)}
                    </span>
                    <SlaIndicator slaStatus={ticket.slaStatus} />
                  </div>
                  <p className="text-sm font-medium mt-1 truncate">{ticket.subject}</p>
                  <div className="flex gap-3 mt-0.5 flex-wrap">
                    <p className="text-xs text-muted-foreground">{ticket.clientName}</p>
                    {ticket.assignedToName && (
                      <p className="text-xs text-muted-foreground">→ {ticket.assignedToName}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {ticket.replyCount} repl{ticket.replyCount !== 1 ? "ies" : "y"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(ticket.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <ChevronRight
                  size={16}
                  className="text-muted-foreground shrink-0 group-hover:text-foreground transition-colors"
                />
              </Link>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
