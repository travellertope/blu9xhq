"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Download, FolderOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PortalFile {
  id: number;
  title: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  category: string;
  description?: string;
  uploadedAt: string;
  downloadUrl?: string;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function PortalFilesPage() {
  const [files, setFiles] = useState<PortalFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/portal/files")
      .then((r) => r.json())
      .then((d) => setFiles(d.files ?? []))
      .catch(() => toast.error("Failed to load files"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Files</h1>
        <p className="text-muted-foreground text-sm">Documents and deliverables shared with you</p>
      </div>

      {!files.length ? (
        <div className="text-center py-16 text-muted-foreground">
          <FolderOpen className="mx-auto mb-3 opacity-40" size={40} />
          <p className="font-medium">No files shared yet</p>
          <p className="text-sm mt-1">Documents and deliverables will appear here when shared.</p>
        </div>
      ) : (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Shared files</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-4 px-4 py-3 border-b last:border-0 hover:bg-muted/30 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.title || file.originalName}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {file.category.replace("_", " ")} · {formatBytes(file.fileSize)} ·{" "}
                    {new Date(file.uploadedAt).toLocaleDateString()}
                  </p>
                  {file.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{file.description}</p>
                  )}
                </div>
                {file.downloadUrl ? (
                  <a
                    href={file.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Download ${file.originalName}`}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground border rounded-md px-2.5 py-1.5 transition-colors"
                  >
                    <Download size={13} />
                    Download
                  </a>
                ) : (
                  <span className="text-xs text-muted-foreground">Unavailable</span>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
