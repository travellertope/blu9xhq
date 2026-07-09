"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { withPermission } from "@/components/shared/PermissionGuard";
import { SequenceEditorClient, type WPSequencePost } from "./SequenceEditorClient";

function EditSequencePage() {
  const params = useParams();
  const id = params?.id as string;

  const [sequence, setSequence] = useState<WPSequencePost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    async function load() {
      try {
        const res = await fetch(`/api/admin/sequences/${id}`);
        if (res.status === 404) {
          setNotFound(true);
          return;
        }
        if (!res.ok) throw new Error("Failed to load sequence");
        const data = await res.json();
        setSequence(data.sequence ?? data);
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to load sequence");
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-sm text-gray-400">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading sequence…
      </div>
    );
  }

  if (notFound || !sequence) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-gray-500 text-sm">Sequence not found.</p>
      </div>
    );
  }

  return <SequenceEditorClient initialData={sequence} />;
}

export default withPermission("build_sequences")(EditSequencePage);
