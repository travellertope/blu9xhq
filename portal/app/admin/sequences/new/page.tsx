"use client";

import { withPermission } from "@/components/shared/PermissionGuard";
import { SequenceEditorClient } from "../[id]/SequenceEditorClient";

function NewSequencePage() {
  return <SequenceEditorClient />;
}

export default withPermission("build_sequences")(NewSequencePage);
