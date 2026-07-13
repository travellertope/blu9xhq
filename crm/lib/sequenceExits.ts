import { getSession } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ExitReason = "client_replied" | "invoice_paid" | "subscription_cancelled" | "manual";

/**
 * Exit all active sequence enrollments for a client that have `exitReason`
 * in their sequence's exit_conditions array.
 *
 * Resolves silently — never throws. Suitable for fire-and-forget from API
 * routes that shouldn't fail if sequence cleanup fails.
 */
export async function exitEnrollmentsForClient(
  clientId: string,
  exitReason: ExitReason,
): Promise<void> {
  const session = await getSession();
  const tenantId = session?.user?.tenantId;
  if (!tenantId) return;

  try {
    const supabase = createSupabaseServerClient();
    const { data: active, error } = await supabase
      .from("sequence_enrollments")
      .select("id, sequences(exit_conditions)")
      .eq("tenant_id", tenantId)
      .eq("client_id", clientId)
      .eq("status", "active");

    if (error) throw error;
    if (!active?.length) return;

    const now = new Date().toISOString();
    const toExit = (active as any[]).filter((e) =>
      (e.sequences?.exit_conditions ?? []).includes(exitReason)
    );
    if (!toExit.length) return;

    const { error: updateErr } = await supabase
      .from("sequence_enrollments")
      .update({ status: "exited", exit_reason: exitReason, exited_at: now })
      .in("id", toExit.map((e) => e.id));
    if (updateErr) throw updateErr;

    console.log(
      `[sequenceExits] Exited ${toExit.length} enrollment(s) — reason: ${exitReason}, client: ${clientId}`,
    );
  } catch (err) {
    console.error(`[sequenceExits] Failed to exit enrollments for client ${clientId}:`, err);
  }
}
