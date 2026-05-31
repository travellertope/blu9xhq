"use client";

import { useParams } from "next/navigation";
import { FileManager } from "@/components/admin/FileManager";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function ClientFilesPage() {
  const params = useParams();
  const id = params.id as string;
  const clientId = parseInt(id, 10);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <a href={`/admin/clients/${id}`}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Client
          </a>
        </Button>
        <h1 className="text-xl font-bold text-slate-900">Files</h1>
      </div>
      <FileManager clientId={clientId} />
    </div>
  );
}
