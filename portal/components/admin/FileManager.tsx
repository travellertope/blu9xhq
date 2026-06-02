"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PermissionGuard } from "@/components/shared/PermissionGuard";
import {
  FileText,
  FileImage,
  Film,
  Archive,
  File,
  Download,
  Trash2,
  Grid,
  List,
  Upload,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { ALLOWED_MIME_TYPES } from "@/lib/r2";
import { format, parseISO } from "date-fns";

interface FileItem {
  id: number;
  title: string;
  description?: string;
  category?: string;
  mimeType?: string;
  fileSize?: number;
  visibility?: "shared" | "internal";
  uploadedBy?: number;
  date: string;
  r2Key?: string;
}

interface UploadQueueItem {
  file: File;
  name: string;
  category: string;
  description: string;
  visibility: "shared" | "internal";
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
}

const CATEGORIES = [
  { value: "contract", label: "Contract" },
  { value: "deliverable", label: "Deliverable" },
  { value: "invoice", label: "Invoice" },
  { value: "brand_asset", label: "Brand Asset" },
  { value: "brief", label: "Brief" },
  { value: "general", label: "General" },
];

const CATEGORY_COLORS: Record<string, string> = {
  contract:    "bg-blue-100 text-blue-700",
  deliverable: "bg-green-100 text-green-700",
  invoice:     "bg-yellow-100 text-yellow-700",
  brand_asset: "bg-purple-100 text-purple-700",
  brief:       "bg-orange-100 text-orange-700",
  general:     "bg-slate-100 text-slate-600",
};

function getMimeIcon(mimeType: string | undefined) {
  if (!mimeType) return { Icon: File, color: "text-slate-400" };
  if (mimeType === "application/pdf") return { Icon: FileText, color: "text-red-500" };
  if (mimeType.includes("word")) return { Icon: FileText, color: "text-blue-500" };
  if (mimeType.includes("excel") || mimeType.includes("spreadsheet")) return { Icon: FileText, color: "text-green-500" };
  if (mimeType.startsWith("image/")) return { Icon: FileImage, color: "text-purple-500" };
  if (mimeType.startsWith("video/")) return { Icon: Film, color: "text-slate-500" };
  if (mimeType === "application/zip") return { Icon: Archive, color: "text-amber-500" };
  return { Icon: File, color: "text-slate-400" };
}

function formatFileSize(bytes: number | undefined): string {
  if (!bytes || isNaN(bytes)) return "—";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

interface FileCardProps {
  file: FileItem;
  onDownload: (id: number) => void;
  onDelete: (id: number) => void;
}

function FileCard({ file, onDownload, onDelete }: FileCardProps) {
  const { Icon, color } = getMimeIcon(file.mimeType);
  const catStyle = CATEGORY_COLORS[file.category ?? "general"] ?? CATEGORY_COLORS.general;
  const dateStr = file.date ? format(parseISO(file.date), "MMM d, yyyy") : "—";

  return (
    <div className="border rounded-lg p-4 bg-white hover:shadow-sm transition-shadow flex flex-col gap-2">
      <div className="flex items-start gap-3">
        <Icon className={`h-8 w-8 shrink-0 mt-0.5 ${color}`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-900 truncate" title={file.title}>
            {file.title}
          </p>
          {file.description && (
            <p className="text-xs text-slate-500 truncate mt-0.5">{file.description}</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <span className={`inline-flex text-xs px-2 py-0.5 rounded-full font-medium ${catStyle}`}>
          {file.category?.replace(/_/g, " ") ?? "—"}
        </span>
        <span
          className={`inline-flex text-xs px-2 py-0.5 rounded-full font-medium ${
            file.visibility === "shared"
              ? "bg-indigo-50 text-indigo-600"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          {file.visibility === "shared" ? "Shared" : "Internal"}
        </span>
      </div>

      <div className="text-xs text-slate-400 flex items-center justify-between">
        <span>{dateStr}</span>
        <span>{formatFileSize(file.fileSize)}</span>
      </div>

      <div className="flex gap-2 pt-1">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 h-7 text-xs"
          onClick={() => onDownload(file.id)}
        >
          <Download className="h-3.5 w-3.5 mr-1" />
          Download
        </Button>
        <PermissionGuard permission="delete_files">
          <Button
            size="sm"
            variant="outline"
            className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={() => onDelete(file.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </PermissionGuard>
      </div>
    </div>
  );
}

interface FileManagerProps {
  clientId: number;
  clientName?: string;
}

export function FileManager({ clientId }: FileManagerProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showUploadPanel, setShowUploadPanel] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const uploadQueueRef = useRef(uploadQueue);
  uploadQueueRef.current = uploadQueue;

  // Register window bridge so ClientProfileActions "Add File" button can trigger the upload panel
  useEffect(() => {
    const key = `__openFileUpload_${clientId}`;
    (window as any)[key] = () => {
      setShowUploadPanel(true);
      setTimeout(() => {
        const el = rootRef.current;
        if (!el) return;
        let container: HTMLElement | null = el.parentElement;
        while (container && container !== document.documentElement) {
          const { overflowY } = window.getComputedStyle(container);
          if (overflowY === "auto" || overflowY === "scroll") break;
          container = container.parentElement;
        }
        if (container && container !== document.documentElement) {
          const gap = el.getBoundingClientRect().top - container.getBoundingClientRect().top - 24;
          container.scrollBy({ top: gap, behavior: "smooth" });
        }
      }, 50);
    };
    return () => { delete (window as any)[key]; };
  }, [clientId]);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/files?clientId=${clientId}`);
      if (!res.ok) throw new Error("Failed to fetch files");
      const data = await res.json();
      setFiles(data.files ?? []);
    } catch {
      toast.error("Failed to load files");
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newItems: UploadQueueItem[] = acceptedFiles.map((f) => ({
      file: f,
      name: f.name,
      category: "general",
      description: "",
      visibility: "internal",
      progress: 0,
      status: "pending",
    }));
    setUploadQueue((prev) => [...prev, ...newItems]);
    setShowUploadPanel(true);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: Object.fromEntries(
      (ALLOWED_MIME_TYPES as readonly string[]).map((t) => [t, []])
    ),
    multiple: true,
  });

  const updateQueueItem = (index: number, patch: Partial<UploadQueueItem>) => {
    setUploadQueue((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const removeFromQueue = (index: number) => {
    setUploadQueue((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadAll = async () => {
    const currentQueue = uploadQueueRef.current;
    const pending = currentQueue.filter((q) => q.status === "pending");
    if (!pending.length) return;
    setUploading(true);
    let successCount = 0;

    for (let i = 0; i < currentQueue.length; i++) {
      const item = currentQueue[i];
      if (item.status !== "pending") continue;

      updateQueueItem(i, { status: "uploading", progress: 0 });

      // Simulate progress to 90%
      let prog = 0;
      const interval = setInterval(() => {
        prog = Math.min(prog + 10, 90);
        updateQueueItem(i, { progress: prog });
      }, 200);

      try {
        const formData = new FormData();
        formData.append("file", item.file);
        formData.append("clientId", String(clientId));
        formData.append("name", item.name);
        formData.append("category", item.category);
        formData.append("description", item.description);
        formData.append("visibility", item.visibility);

        const res = await fetch("/api/admin/files/upload", {
          method: "POST",
          body: formData,
        });

        clearInterval(interval);

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error ?? "Upload failed");
        }

        updateQueueItem(i, { status: "done", progress: 100 });
        successCount++;
      } catch (e: unknown) {
        clearInterval(interval);
        const msg = e instanceof Error ? e.message : "Unknown error";
        updateQueueItem(i, { status: "error", progress: 0, error: msg });
        toast.error(`Failed to upload ${item.name}: ${msg}`);
      }
    }

    setUploading(false);
    await fetchFiles();
    setUploadQueue((prev) => {
      const remaining = prev.filter((q) => q.status !== "done");
      if (successCount > 0 && remaining.every((q) => q.status === "error")) {
        setShowUploadPanel(false);
      }
      return remaining;
    });
    if (successCount > 0) {
      toast.success(successCount === 1 ? "File uploaded" : `${successCount} files uploaded`);
    }
  };

  const handleDownload = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/files/${id}/download`);
      if (!res.ok) throw new Error("Failed to get download URL");
      const { signedUrl } = await res.json();
      window.open(signedUrl, "_blank");
    } catch {
      toast.error("Failed to download file");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this file? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/files/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete file");
      setFiles((prev) => prev.filter((f) => f.id !== id));
      toast.success("File deleted");
    } catch {
      toast.error("Failed to delete file");
    }
  };

  const filteredFiles = filterCategory === "all"
    ? files
    : files.filter((f) => f.category === filterCategory);

  return (
    <div ref={rootRef} className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="h-8 w-36 text-xs">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="ml-auto flex items-center gap-2">
          <Button
            size="sm"
            variant={viewMode === "grid" ? "default" : "outline"}
            className="h-8 w-8 p-0"
            onClick={() => setViewMode("grid")}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={viewMode === "list" ? "default" : "outline"}
            className="h-8 w-8 p-0"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Upload Area */}
      <PermissionGuard permission="upload_manage_files">
        <div>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-indigo-400 bg-indigo-50"
                : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-8 w-8 mx-auto mb-2 text-slate-400" />
            <p className="text-sm text-slate-600">
              {isDragActive ? "Drop files here…" : "Drag & drop files here, or click to select"}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              PDF, Word, Excel, PowerPoint, images, videos, ZIP — up to 50MB
            </p>
          </div>

          {/* Upload Queue */}
          {uploadQueue.length > 0 && (
            <div className="mt-3 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-700">{uploadQueue.length} file(s) queued</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={uploadAll}
                    disabled={uploading || uploadQueue.every((q) => q.status !== "pending")}
                  >
                    <Upload className="h-3.5 w-3.5 mr-1.5" />
                    Upload All
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowUploadPanel((v) => !v)}
                  >
                    {showUploadPanel ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {showUploadPanel && (
                <div className="space-y-3 border rounded-lg p-3 bg-slate-50">
                  {uploadQueue.map((item, idx) => (
                    <div key={idx} className="border rounded-lg bg-white p-3 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium truncate">{item.file.name}</p>
                        {item.status === "pending" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 text-slate-400"
                            onClick={() => removeFromQueue(idx)}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>

                      {item.status === "pending" && (
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">File Name</Label>
                            <Input
                              className="h-7 text-xs mt-0.5"
                              value={item.name}
                              onChange={(e) => updateQueueItem(idx, { name: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Category</Label>
                            <Select
                              value={item.category}
                              onValueChange={(v) => updateQueueItem(idx, { category: v })}
                            >
                              <SelectTrigger className="h-7 text-xs mt-0.5">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {CATEGORIES.map((c) => (
                                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs">Visibility</Label>
                            <Select
                              value={item.visibility}
                              onValueChange={(v) => updateQueueItem(idx, { visibility: v as "shared" | "internal" })}
                            >
                              <SelectTrigger className="h-7 text-xs mt-0.5">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="internal">Internal</SelectItem>
                                <SelectItem value="shared">Shared with client</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs">Description</Label>
                            <Input
                              className="h-7 text-xs mt-0.5"
                              placeholder="Optional"
                              value={item.description}
                              onChange={(e) => updateQueueItem(idx, { description: e.target.value })}
                            />
                          </div>
                        </div>
                      )}

                      {(item.status === "uploading" || item.status === "done") && (
                        <div className="space-y-1">
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                item.status === "done" ? "bg-green-500" : "bg-indigo-500"
                              }`}
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                          <p className="text-xs text-slate-400">
                            {item.status === "done" ? "Uploaded" : `${item.progress}%`}
                          </p>
                        </div>
                      )}

                      {item.status === "error" && (
                        <p className="text-xs text-red-500">{item.error}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </PermissionGuard>

      {/* File list/grid */}
      {loading ? (
        <div className="py-8 text-center text-slate-400 text-sm">Loading files…</div>
      ) : filteredFiles.length === 0 ? (
        <div className="py-8 text-center text-slate-400">
          <p className="text-sm font-medium">No files yet</p>
          <p className="text-xs mt-1">Upload files using the area above</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredFiles.map((file) => (
            <FileCard
              key={file.id}
              file={file}
              onDownload={handleDownload}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-500">Name</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-500">Category</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-500">Visibility</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-500">Size</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-500">Date</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredFiles.map((file) => {
                const { Icon, color } = getMimeIcon(file.mimeType);
                const catStyle = CATEGORY_COLORS[file.category ?? "general"] ?? CATEGORY_COLORS.general;
                return (
                  <tr key={file.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${color}`} />
                        <span className="font-medium text-slate-900 truncate max-w-[200px]">{file.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex text-xs px-2 py-0.5 rounded-full font-medium ${catStyle}`}>
                        {file.category?.replace("_", " ") ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`text-xs ${file.visibility === "shared" ? "text-indigo-600" : "text-slate-400"}`}>
                        {file.visibility === "shared" ? "Shared" : "Internal"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-slate-500">{formatFileSize(file.fileSize)}</td>
                    <td className="px-4 py-2.5 text-slate-500">
                      {file.date ? format(parseISO(file.date), "MMM d, yyyy") : "—"}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1 justify-end">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          onClick={() => handleDownload(file.id)}
                        >
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                        <PermissionGuard permission="delete_files">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-red-400 hover:text-red-600"
                            onClick={() => handleDelete(file.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </PermissionGuard>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
