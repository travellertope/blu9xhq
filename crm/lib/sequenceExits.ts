import { listEnrollments, getSequence, updateEnrollment } from "@/lib/wp-api";

type ExitReason = "client_replied" | "invoice_paid" | "subscription_cancelled" | "manual";

/**
 * Exit all active sequence enrollments for a client that have `exitReason`
 * in their sequence's exit_conditions array.
 *
 * Resolves silently — never throws. Suitable for fire-and-forget from API
 * routes that shouldn't fail if sequence cleanup fails.
 */
export async function exitEnrollmentsForClient(
  clientId: number,
  exitReason: ExitReason,
): Promise<void> {
  let candidates;
  try {
    const result = await listEnrollments({
      per_page:   100,
      meta_key:   "enr_client_id",
      meta_value: clientId,
    });
    candidates = result.items;
  } catch (err) {
    console.error(`[sequenceExits] Failed to list enrollments for client ${clientId}:`, err);
    return;
  }

  const active = candidates.filter((e) => e.acf.enr_status === "active");
  if (active.length === 0) return;

  const now = new Date().toISOString();

  for (const enrollment of active) {
    try {
      const sequence = await getSequence(enrollment.acf.enr_sequence_id);

      let exitConditions: string[] = [];
      try {
        exitConditions = JSON.parse(sequence.acf.exit_conditions ?? "[]") as string[];
      } catch {
        exitConditions = [];
      }

      if (!exitConditions.includes(exitReason)) continue;

      await updateEnrollment(enrollment.id, {
        acf: {
          enr_status:      "exited",
          enr_exit_reason: exitReason,
          enr_exited_at:   now,
        },
      });
      console.log(
        `[sequenceExits] Enrollment ${enrollment.id} exited — reason: ${exitReason}, client: ${clientId}`,
      );
    } catch (err) {
      console.error(`[sequenceExits] Failed to exit enrollment ${enrollment.id}:`, err);
    }
  }
}
