"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { FolderOpen, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FileRow {
  id: number;
  title: string;
  clientId: number;
  clientName: string | null;
  category: string;
  mimeType: string;
  fileSize: number;
  visibility: string;
  date: string;
  publicUrl?: string;
}

const CATEGORY_OPTS = [
  { value: "all", label: "All Categories" },
  { value: "contract", label: "Contract" },
  { value: "deliverable", label: "Deliverable" },
  { value: "invoice", label: "Invoice" },
  { value: "brand_asset", label: "Brand Asset" },
  { value: "brief", label: "Brief" },
  { value: "general", label: "General" },
];

function formatBytes(bytes: number) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AdminFilesPage() {
  const [files, setFiles] = useState<FileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(page));
    fetch(`/api/admin/files?${params}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        const all: FileRow[] = d.files ?? [];
        const filtered = category !== "all" ? all.filter((f) => f.category === category) : all;
        setFiles(filtered);
        setTotalPages(d.totalPages ?? 1);
        setTotal(d.total ?? 0);
      })
      .catch(() => toast.error("Failed to load files"))
      .finally(() => setLoading(false));
  }, [page, category]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Files</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {total} file{total !== 1 ? "s" : ""} across all clients
          </p>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap items-center">
        <Select value={category} onValueChange={(v) => { setCategory(v); setPage(1); }}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORY_OPTS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-muted rounded animate-pulse" />
          ))}
        </div>
      ) : files.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          <FolderOpen className="mx-auto mb-3 opacity-30" size={40} />
          <p className="font-medium">No files found</p>
          <p className="text-sm mt-1">Files uploaded to client profiles appear here.</p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left text-muted-foreground">
                  <th className="px-4 py-3 font-medium">File</th>
                  <th className="px-4 py-3 font-medium">Client</th>
                  <th className="px-4 py-3 font-medium hidden sm:table-cell">Category</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Size</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Visibility</th>
                  <th className="px-4 py-3 font-medium hidden lg:table-cell">Uploaded</th>
                  <th className="px-4 py-3 font-medium w-10" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {files.map((f) => (
                  <tr key={f.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium truncate max-w-[200px]">{f.title}</td>
                    <td className="px-4 py-3">
                      {f.clientId ? (
                        <Link
                          href={`/admin/clients/${f.clientId}`}
                          className="text-indigo-600 hover:underline text-sm"
                        >
                          {f.clientName ?? `Client #${f.clientId}`}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-xs bg-muted rounded px-2 py-0.5 capitalize">
                        {f.category?.replace(/_/g, " ") ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                      {formatBytes(f.fileSize)}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                        f.visibility === "shared"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-slate-50 text-slate-600 border-slate-200"
                      }`}>
                        {f.visibility}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell text-xs">
                      {new Date(f.date).toLocaleDateString("en-GB", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      {f.publicUrl && (
                        <a href={f.publicUrl} target="_blank" rel="noreferrer">
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <Download size={13} />
                          </Button>
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="outline" size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft size={14} className="mr-1" /> Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline" size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next <ChevronRight size={14} className="ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
