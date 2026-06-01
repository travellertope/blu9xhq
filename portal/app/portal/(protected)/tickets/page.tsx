"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { TicketCheck, Plus, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatStatus, formatPriority, statusBadgeColor, priorityBadgeColor } from "@/lib/ticket-utils";

interface Ticket {
  id: number;
  ticketNumber: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
}

const STATUS_FILTERS = [
  { value: "", label: "All" },
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "awaiting_client", label: "Awaiting You" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

export default function PortalTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetch("/api/portal/tickets")
      .then((r) => r.json())
      .then((d) => setTickets(d.tickets ?? []))
      .catch(() => toast.error("Failed to load tickets"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter ? tickets.filter((t) => t.status === filter) : tickets;

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Support Tickets</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Get help and track your requests
          </p>
        </div>
        <Button asChild>
          <Link href="/portal/tickets/new">
            <Plus size={15} className="mr-1.5" />
            New Ticket
          </Link>
        </Button>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-full px-3 py-1 text-sm font-medium transition-colors border ${
              filter === f.value
                ? "bg-foreground text-background border-foreground"
                : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/40"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          <TicketCheck className="mx-auto mb-3 opacity-30" size={40} />
          <p className="font-medium">
            {filter ? `No ${formatStatus(filter).toLowerCase()} tickets` : "No tickets yet"}
          </p>
          <p className="text-sm mt-1">
            {filter
              ? "Try a different filter."
              : "Submit a ticket and our team will respond shortly."}
          </p>
          {!filter && (
            <Button asChild className="mt-4">
              <Link href="/portal/tickets/new">Submit a ticket</Link>
            </Button>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            {filtered.map((ticket) => (
              <Link
                key={ticket.id}
                href={`/portal/tickets/${ticket.id}`}
                className="flex items-center gap-4 px-4 py-4 border-b last:border-0 hover:bg-muted/20 transition-colors group"
              >
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
                  </div>
                  <p className="text-sm font-medium mt-1 truncate">{ticket.subject}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {ticket.category.replace(/_/g, " ")} ·{" "}
                    {new Date(ticket.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </p>
                </div>
                <ChevronRight size={16} className="text-muted-foreground shrink-0 group-hover:text-foreground transition-colors" />
              </Link>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
