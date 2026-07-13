// Supabase's stricter category vocabulary vs. the WP-era values the admin UI
// still sends/displays — same remap-in-the-route-layer pattern used elsewhere.
export const CATEGORY_TO_DB: Record<string, string> = {
  contract: "contract", deliverable: "deliverable", invoice: "invoice_attachment",
  brand_asset: "asset", brief: "brief", general: "other",
};
export const CATEGORY_FROM_DB: Record<string, string> = {
  contract: "contract", deliverable: "deliverable", invoice_attachment: "invoice",
  asset: "brand_asset", brief: "brief", other: "general", report: "general",
};

export function mapFileRow(row: any, clientName?: string | null) {
  return {
    id:          row.id,
    title:       row.title,
    clientId:    row.client_id,
    clientName:  clientName ?? undefined,
    description: row.description ?? undefined,
    category:    CATEGORY_FROM_DB[row.category] ?? row.category,
    mimeType:    row.mime_type,
    fileSize:    row.file_size,
    visibility:  row.is_visible_to_client ? "shared" : "internal",
    uploadedBy:  row.uploaded_by ?? undefined,
    date:        row.created_at,
    r2Key:       row.r2_key,
  };
}
