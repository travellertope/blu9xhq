import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/apiPermissions";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getDashboardScope } from "@/lib/permissions";

function isWithinDays(dateStr: string, days: number): boolean {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const future = new Date();
    future.setDate(now.getDate() + days);
    return d >= now && d <= future;
  } catch {
    return false;
  }
}

function isToday(dateStr: string): boolean {
  if (!dateStr) return false;
  try {
    const d = new Date(dateStr);
    const now = new Date();
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  const auth = await requireSession(req);
  if (auth instanceof NextResponse) return auth;
  const { session } = auth;
  const user = session.user as any;
  const tenantId = user.tenantId!;
  const role = user.bluuhqRole ?? "viewer";
  const scope = getDashboardScope(role);

  const hideMetrics = role === "support_staff" || role === "viewer";

  const supabase = createSupabaseServerClient();

  const [
    outstandingInvoicesQ,
    overdueInvoicesQ,
    upcomingRenewalsQ,
    clientsQ,
    atRiskClientsQ,
    subscriptionsQ,
    cancellationQueueQ,
    followUpsQ,
    recentActivityQ,
    servicesCountQ,
    sequencesCountQ,
    tenantSettingsQ,
  ] = await Promise.all([
    // Outstanding (sent) invoices
    hideMetrics
      ? Promise.resolve({ data: [], count: 0 })
      : supabase.from("invoices").select("total", { count: "exact" }).eq("tenant_id", tenantId).eq("status", "sent"),

    // Overdue invoices
    supabase.from("invoices").select("*", { count: "exact" }).eq("tenant_id", tenantId).eq("status", "overdue").limit(20),

    // Upcoming renewals — sent invoices due in the next 7 days
    supabase.from("invoices").select("*").eq("tenant_id", tenantId).eq("status", "sent"),

    // Active clients (count, and full rows for account_manager scoping)
    hideMetrics
      ? Promise.resolve({ data: [], count: 0 })
      : supabase.from("clients").select("id", { count: "exact" }).eq("tenant_id", tenantId),

    // At-risk clients
    supabase.from("clients").select("*").eq("tenant_id", tenantId).eq("health_status", "at_risk").limit(10),

    // Subscriptions for MRR
    hideMetrics
      ? Promise.resolve({ data: [] })
      : supabase.from("subscriptions").select("status,amount,billing_cycle").eq("tenant_id", tenantId),

    // Cancellation queue
    supabase.from("subscriptions").select("*, clients(company_name,contact_name), services(title)").eq("tenant_id", tenantId).not("sub_cancellation_requested_at", "is", null).limit(10),

    // Follow-ups due
    supabase.from("communications").select("*").eq("tenant_id", tenantId).eq("follow_up_needed", true).eq("follow_up_completed", false),

    // Recent activity (system communications)
    supabase.from("communications").select("*").eq("tenant_id", tenantId).eq("channel", "system").order("occurred_at", { ascending: false }).limit(20),

    // Services count (setup checklist)
    supabase.from("services").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId),

    // Sequences count (setup checklist)
    supabase.from("sequences").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId).eq("is_active", true),

    // Bank details (setup checklist)
    supabase.from("tenants").select("bank_account_number").eq("id", tenantId).maybeSingle(),
  ]);

  // Compute metrics
  const outstandingTotal = ((outstandingInvoicesQ.data ?? []) as any[]).reduce(
    (sum: number, inv: any) => sum + (inv.total ?? 0), 0
  );
  const overdueTotal = ((overdueInvoicesQ.data ?? []) as any[]).reduce(
    (sum: number, inv: any) => sum + (inv.total ?? 0), 0
  );

  const mrrTotal = ((subscriptionsQ.data ?? []) as any[])
    .filter((s: any) => s.status === "active")
    .reduce((sum: number, s: any) => {
      const amount = s.amount ?? 0;
      const cycle = s.billing_cycle ?? "monthly";
      if (cycle === "monthly") return sum + amount;
      if (cycle === "quarterly") return sum + amount / 3;
      if (cycle === "annually" || cycle === "annual") return sum + amount / 12;
      if (cycle === "one_time") return sum; // one-time doesn't contribute to MRR
      return sum + amount;
    }, 0);

  let activeClientsCount = clientsQ.count ?? 0;
  if (scope === "scoped" && role === "account_manager") {
    const assigned: string[] = user.assignedClients ?? [];
    activeClientsCount = ((clientsQ.data ?? []) as any[]).filter((c: any) => assigned.includes(c.id)).length;
  }

  // Upcoming renewals: invoices due in next 7 days
  const upcomingRenewals = ((upcomingRenewalsQ.data ?? []) as any[])
    .filter((inv: any) => isWithinDays(inv.due_date ?? "", 7))
    .slice(0, 10)
    .map((inv: any) => ({
      id: inv.id,
      number: inv.invoice_number,
      clientId: inv.client_id,
      total: inv.total,
      currency: inv.currency,
      dueDate: inv.due_date,
      status: inv.status,
    }));

  // At-risk clients
  const atRiskClients = ((atRiskClientsQ.data ?? []) as any[])
    .slice(0, 10)
    .map((c: any) => ({
      id: c.id,
      name: c.contact_name,
      company: c.company_name,
      healthStatus: c.health_status,
      healthNote: c.health_note,
    }));

  // Follow-ups due today
  const followUpsToday = ((followUpsQ.data ?? []) as any[])
    .filter((c: any) => isToday(c.follow_up_due ?? ""))
    .map((c: any) => ({
      id: c.id,
      clientId: c.client_id,
      subject: c.subject,
      followUpDue: c.follow_up_due,
    }));

  // Recent activity
  const recentActivity = ((recentActivityQ.data ?? []) as any[]).map((c: any) => ({
    id: c.id,
    date: c.occurred_at || c.created_at,
    clientId: c.client_id,
    subject: c.subject,
    content: c.body,
  }));

  // Overdue invoices for display
  const overdueInvoices = ((overdueInvoicesQ.data ?? []) as any[]).map((inv: any) => ({
    id: inv.id,
    number: inv.invoice_number,
    clientId: inv.client_id,
    total: inv.total,
    currency: inv.currency,
    dueDate: inv.due_date,
    status: inv.status,
    lastReminderSent: null,
  }));

  // Cancellation queue
  const cancellationQueue = ((cancellationQueueQ.data ?? []) as any[])
    .slice(0, 10)
    .map((s: any) => ({
      id: s.id,
      title: `${s.clients?.company_name || s.clients?.contact_name || "Client"} — ${s.services?.title || "Service"}`,
      clientId: s.client_id,
      status: s.status,
      cancelledAt: s.sub_cancellation_requested_at,
    }));

  // Setup checklist
  const setupChecklist = {
    hasClient:      activeClientsCount > 0,
    hasService:     (servicesCountQ.count ?? 0) > 0,
    hasBankDetails: !!tenantSettingsQ.data?.bank_account_number,
    hasStripe:      !!process.env.STRIPE_SECRET_KEY,
    hasPaystack:    !!process.env.PAYSTACK_SECRET_KEY,
    hasSequence:    (sequencesCountQ.count ?? 0) > 0,
    hasPortalInvite: !!process.env.NEXT_PUBLIC_APP_URL,
  };

  return NextResponse.json({
    metrics: hideMetrics
      ? null
      : {
          outstandingCount: outstandingInvoicesQ.count ?? 0,
          outstandingTotal,
          overdueCount: overdueInvoicesQ.count ?? 0,
          overdueTotal,
          activeClients: activeClientsCount,
          mrr: Math.round(mrrTotal),
        },
    upcomingRenewals,
    overdueInvoices,
    atRiskClients,
    followUpsToday,
    recentActivity,
    cancellationQueue,
    setupChecklist,
  });
}
