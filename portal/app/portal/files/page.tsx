"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import {
  Download,
  FolderOpen,
  Trash2,
  UploadCloud,
  FileText,
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

interface PortalFile {
  id: number;
  name: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  category: string;
  description?: string;
  uploadedAt: string;
  uploadedBy: number;
}

const FILE_CATEGORIES = [
  { value: "all", label: "All" },
  { value: "contract", label: "Contracts" },
  { value: "deliverable", label: "Deliverables" },
  { value: "brand_asset", label: "Brand Assets" },
  { value: "brief", label: "Briefs" },
  { value: "general", label: "General" },
] as const;

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function getMimeIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return "🖼️";
  if (mimeType === "application/pdf") return "📄";
  if (mimeType.includes("word") || mimeType.includes("document")) return "📝";
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) return "📊";
  if (mimeType.startsWith("video/")) return "🎬";
  if (mimeType.startsWith("audio/")) return "🎵";
  if (mimeType.includes("zip") || mimeType.includes("rar")) return "🗜️";
  return "📎";
}

function formatCategory(cat: string) {
  return cat.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

interface UploadingFile {
  id: string;
  name: string;
  progress: number;
  error?: string;
}

export default function PortalFilesPage() {
  const [sharedByBluuHQ, setSharedByBluuHQ] = useState<PortalFile[]>([]);
  const [sharedByClient, setSharedByClient] = useState<PortalFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [uploading, setUploading] = useState<UploadingFile[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<PortalFile | null>(null);
  const [deleting, setDeleting] = useState(false);
  const uploadAbortRefs = useRef<Record<string, AbortController>>({});

  const loadFiles = useCallback(async () => {
    try {
      const res = await fetch("/api/portal/files");
      const data = await res.json();
      setSharedByBluuHQ(data.sharedByBluuHQ ?? []);
      setSharedByClient(data.sharedByClient ?? []);
    } catch {
      toast.error("Failed to load files");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadFiles(); }, [loadFiles]);

  const filteredBluuHQ =
    activeFilter === "all"
      ? sharedByBluuHQ
      : sharedByBluuHQ.filter((f) => f.category === activeFilter);

  const handleDownload = async (file: PortalFile) => {
    try {
      const res = await fetch(`/api/portal/files/${file.id}/download`);
      if (!res.ok) throw new Error("Could not get download link");
      const { signedUrl } = await res.json();
      const a = document.createElement("a");
      a.href = signedUrl;
      a.download = file.originalName;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.click();
    } catch {
      toast.error("Download failed — please try again");
    }
  };

  const uploadFile = useCallback(async (file: File) => {
    const uid = crypto.randomUUID();
    const abort = new AbortController();
    uploadAbortRefs.current[uid] = abort;

    setUploading((prev) => [
      ...prev,
      { id: uid, name: file.name, progress: 0 },
    ]);

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading((prev) =>
        prev.map((u) => (u.id === uid ? { ...u, progress: 30 } : u))
      );
      const res = await fetch("/api/portal/files/upload", {
        method: "POST",
        body: formData,
        signal: abort.signal,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Upload failed");
      }
      setUploading((prev) =>
        prev.map((u) => (u.id === uid ? { ...u, progress: 100 } : u))
      );
      setTimeout(() => {
        setUploading((prev) => prev.filter((u) => u.id !== uid));
      }, 1200);
      await loadFiles();
      toast.success(`${file.name} uploaded`);
    } catch (err) {
      if ((err as { name?: string }).name === "AbortError") {
        setUploading((prev) => prev.filter((u) => u.id !== uid));
        return;
      }
      const msg = err instanceof Error ? err.message : "Upload failed";
      setUploading((prev) =>
        prev.map((u) => (u.id === uid ? { ...u, error: msg } : u))
      );
      toast.error(msg);
    } finally {
      delete uploadAbortRefs.current[uid];
    }
  }, [loadFiles]);

  const onDrop = useCallback(
    (accepted: File[]) => {
      accepted.forEach(uploadFile);
    },
    [uploadFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 50 * 1024 * 1024,
    onDropRejected: (files) => {
      files.forEach((f) => {
        const err = f.errors[0];
        toast.error(`${f.file.name}: ${err?.message ?? "Rejected"}`);
      });
    },
  });

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/portal/files/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Delete failed");
      }
      setSharedByClient((prev) => prev.filter((f) => f.id !== deleteTarget.id));
      toast.success("File removed");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete file");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* ── Section 1: Shared by BluuHQ ─────────────────────────────────── */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Shared with you</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Documents and deliverables from BluuHQ
          </p>
        </div>

        {/* Category filter tabs */}
        <div className="flex gap-1.5 flex-wrap">
          {FILE_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveFilter(cat.value)}
              className={`rounded-full px-3 py-1 text-sm font-medium transition-colors border ${
                activeFilter === cat.value
                  ? "bg-foreground text-background border-foreground"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/40"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {filteredBluuHQ.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <FolderOpen className="mx-auto mb-3 opacity-40" size={38} />
            <p className="font-medium">
              {activeFilter === "all"
                ? "No files shared yet"
                : `No ${FILE_CATEGORIES.find((c) => c.value === activeFilter)?.label.toLowerCase()} yet`}
            </p>
            <p className="text-sm mt-1">Files will appear here when BluuHQ shares them.</p>
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              {filteredBluuHQ.map((file) => (
                <FileRow
                  key={file.id}
                  file={file}
                  onDownload={() => handleDownload(file)}
                />
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* ── Section 2: Shared by client ─────────────────────────────────── */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Shared by you</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Files you&apos;ve uploaded and shared with BluuHQ
          </p>
        </div>

        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl px-6 py-10 text-center cursor-pointer transition-colors ${
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-muted/30"
          }`}
        >
          <input {...getInputProps()} />
          <UploadCloud
            className={`mx-auto mb-3 transition-colors ${
              isDragActive ? "text-primary" : "text-muted-foreground"
            }`}
            size={36}
          />
          {isDragActive ? (
            <p className="font-medium text-primary">Drop files here</p>
          ) : (
            <>
              <p className="font-medium">Drag &amp; drop files here</p>
              <p className="text-sm text-muted-foreground mt-1">
                or <span className="text-primary underline-offset-2 hover:underline">click to browse</span>
              </p>
              <p className="text-xs text-muted-foreground mt-2">Max 50 MB per file</p>
            </>
          )}
        </div>

        {/* Upload progress items */}
        {uploading.map((u) => (
          <div key={u.id} className="flex items-center gap-3 px-4 py-3 border rounded-lg bg-muted/30">
            <FileText size={18} className="text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{u.name}</p>
              {u.error ? (
                <p className="text-xs text-destructive mt-0.5">{u.error}</p>
              ) : (
                <Progress value={u.progress} className="h-1.5 mt-1.5" />
              )}
            </div>
            <button
              onClick={() => {
                uploadAbortRefs.current[u.id]?.abort();
                setUploading((prev) => prev.filter((x) => x.id !== u.id));
              }}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Cancel upload"
            >
              <X size={15} />
            </button>
          </div>
        ))}

        {/* Client-uploaded files list */}
        {sharedByClient.length > 0 && (
          <Card>
            <CardContent className="p-0">
              {sharedByClient.map((file) => (
                <FileRow
                  key={file.id}
                  file={file}
                  onDownload={() => handleDownload(file)}
                  onDelete={() => setDeleteTarget(file)}
                />
              ))}
            </CardContent>
          </Card>
        )}

        {sharedByClient.length === 0 && uploading.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            You haven&apos;t shared any files yet.
          </p>
        )}
      </div>

      {/* Delete confirm dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove file?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            <strong>{deleteTarget?.originalName}</strong> will be permanently deleted and
            removed from BluuHQ&apos;s records.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleting}>
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FileRow({
  file,
  onDownload,
  onDelete,
}: {
  file: PortalFile;
  onDownload: () => void;
  onDelete?: () => void;
}) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    await onDownload();
    setDownloading(false);
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b last:border-0 hover:bg-muted/20 transition-colors">
      <span className="text-xl leading-none shrink-0" aria-hidden="true">
        {getMimeIcon(file.mimeType)}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{file.name || file.originalName}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {formatCategory(file.category)} · {formatBytes(file.fileSize)} ·{" "}
          {new Date(file.uploadedAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>
        {file.description && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{file.description}</p>
        )}
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDownload}
          disabled={downloading}
          className="h-8 gap-1.5 text-xs"
        >
          <Download size={13} />
          {downloading ? "…" : "Download"}
        </Button>
        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
            aria-label="Remove file"
          >
            <Trash2 size={13} />
          </Button>
        )}
      </div>
    </div>
  );
}
