"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { format, parseISO } from "date-fns";
import { MoreHorizontal, ArrowUpDown, ArrowUp, ArrowDown, Search, Plus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ClientStatusBadge } from "./ClientStatusBadge";
import { HealthIndicator } from "./HealthIndicator";
import type { WPClientPost } from "@/lib/wp-api";

interface ClientTableProps {
  clients: WPClientPost[];
  total: number;
  totalPages: number;
  page: number;
}

type SortKey = "title" | "date" | "modified";
type SortDir = "asc" | "desc";

function useDebouncedCallback(fn: (v: string) => void, delay = 300) {
  let timer: ReturnType<typeof setTimeout>;
  return (v: string) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(v), delay);
  };
}

export function ClientTable({ clients, total, totalPages, page }: ClientTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState(searchParams.get("search") ?? "");

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    if (key !== "page") params.set("page", "1");
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  const handleSearch = useCallback(
    useDebouncedCallback((v: string) => updateParam("search", v)),
    [searchParams]
  );

  function handleSort(key: SortKey) {
    const currentOrderby = searchParams.get("orderby") ?? "date";
    const currentOrder = searchParams.get("order") ?? "desc";
    const newOrder: SortDir =
      currentOrderby === key ? (currentOrder === "asc" ? "desc" : "asc") : "desc";
    const params = new URLSearchParams(searchParams.toString());
    params.set("orderby", key);
    params.set("order", newOrder);
    params.set("page", "1");
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  function SortIcon({ col }: { col: SortKey }) {
    const active = searchParams.get("orderby") === col;
    const dir = searchParams.get("order") ?? "desc";
    if (!active) return <ArrowUpDown className="ml-1 h-3.5 w-3.5 text-slate-400 inline" />;
    return dir === "asc"
      ? <ArrowUp className="ml-1 h-3.5 w-3.5 text-indigo-600 inline" />
      : <ArrowDown className="ml-1 h-3.5 w-3.5 text-indigo-600 inline" />;
  }

  async function handleSendInvite(clientId: number) {
    try {
      const res = await fetch(`/api/admin/clients/${clientId}/invite`, { method: "POST" });
      if (!res.ok) throw new Error();
      toast.success("Portal invite sent");
    } catch {
      toast.error("Failed to send invite");
    }
  }

  async function handleDelete(clientId: number, name: string) {
    if (!confirm(`Archive ${name}? This sets their status to churned.`)) return;
    try {
      const res = await fetch(`/api/admin/clients/${clientId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Client archived");
      startTransition(() => router.refresh());
    } catch {
      toast.error("Failed to archive client");
    }
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by name, company…"
              value={searchValue}
              onChange={(e) => {
                setSearchValue(e.target.value);
                handleSearch(e.target.value);
              }}
              className="pl-9"
            />
          </div>
          <Select
            value={searchParams.get("status") ?? "all"}
            onValueChange={(v) => updateParam("status", v === "all" ? "" : v)}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="onboarding">Onboarding</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="churned">Churned</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white">
          <a href="/admin/clients/new">
            <Plus className="h-4 w-4 mr-1.5" />
            Add Client
          </a>
        </Button>
      </div>

      {/* Table */}
      <div className={cn("border rounded-lg overflow-hidden", isPending && "opacity-60 pointer-events-none")}>
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead>
                <button onClick={() => handleSort("title")} className="flex items-center font-medium">
                  Client <SortIcon col="title" />
                </button>
              </TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Health</TableHead>
              <TableHead className="text-center">Subscriptions</TableHead>
              <TableHead>
                <button onClick={() => handleSort("modified")} className="flex items-center font-medium">
                  Last Contact <SortIcon col="modified" />
                </button>
              </TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                  {searchValue ? "No clients match your search." : "No clients yet. Add your first client to get started."}
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client) => {
                const acf = client.acf;
                const name = acf.contact_name || client.title.rendered;
                const lastContact = acf.last_contacted_at ?? client.modified;

                return (
                  <TableRow
                    key={client.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/admin/clients/${client.id}`)}
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-900">{name}</p>
                        <p className="text-xs text-slate-500">{acf.portal_email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600">{acf.company_name}</TableCell>
                    <TableCell>
                      <ClientStatusBadge status={acf.status ?? "onboarding"} />
                    </TableCell>
                    <TableCell>
                      <HealthIndicator status={acf.health_status} showLabel />
                    </TableCell>
                    <TableCell className="text-center text-slate-600">
                      {acf.active_subscription_count ?? 0}
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">
                      {lastContact
                        ? format(parseISO(lastContact), "MMM d, yyyy")
                        : "—"}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => router.push(`/admin/clients/${client.id}`)}>
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/admin/clients/${client.id}/edit`)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSendInvite(client.id)}>
                            Send Portal Invite
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={() => handleDelete(client.id, name)}
                          >
                            Archive Client
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-slate-500">
        <p>{total} client{total !== 1 ? "s" : ""}</p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || isPending}
            onClick={() => updateParam("page", String(page - 1))}
          >
            Previous
          </Button>
          <span>
            Page {page} of {Math.max(totalPages, 1)}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages || isPending}
            onClick={() => updateParam("page", String(page + 1))}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
