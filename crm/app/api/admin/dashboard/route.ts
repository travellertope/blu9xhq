import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/apiPermissions";
import {
  listInvoices,
  listClientPosts,
  listClientSubscriptions,
  listFollowUpCommunications,
  listServices,
  wpRestList,
  type WPCommunicationPost,
  type WPSubscriptionPost,
} from "@/lib/wp-api";
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
  const role = user.bluuhqRole ?? "viewer";
  const scope = getDashboardScope(role);

  const hideMetrics = role === "support_staff" || role === "viewer";

  const [
    outstandingInvoices,
    overdueInvoicesResult,
    clientsResult,
    subscriptionsResult,
    upcomingRenewalsResult,
    followUpsResult,
    recentActivityResult,
    servicesResult,
    sequencesResult,
    cancellationQueueResult,
  ] = await Promise.all([
    // Outstanding (sent)
    hideMetrics
      ? Promise.resolve({ items: [], total: 0, totalPages: 1 })
      : listInvoices({ status: "sent", per_page: 100 }).catch(() => ({ items: [], total: 0, totalPages: 1 })),

    // Overdue
    listInvoices({ status: "overdue", per_page: 20 }).catch(() => ({ items: [], total: 0, totalPages: 1 })),

    // Active clients
    hideMetrics
      ? Promise.resolve({ items: [], total: 0, totalPages: 1 })
      : listClientPosts({ per_page: 100 }).catch(() => ({ items: [], total: 0, totalPages: 1 })),

    // Subscriptions for MRR
    hideMetrics
      ? Promise.resolve({ items: [], total: 0, totalPages: 1 })
      : listClientSubscriptions(0).catch(() => ({ items: [], total: 0, totalPages: 1 })),

    // Upcoming renewals (all sent, filter in code)
    listInvoices({ status: "sent", per_page: 100 }).catch(() => ({ items: [], total: 0, totalPages: 1 })),

    // Follow-ups
    listFollowUpCommunications().catch(() => ({ items: [], total: 0, totalPages: 1 })),

    // Recent activity (system communications)
    wpRestList<WPCommunicationPost>("/wp/v2/bluu_communication", {
      per_page: 20,
      meta_key: "comm_channel",
      meta_value: "system",
      orderby: "date",
      order: "desc",
    }).catch(() => ({ items: [], total: 0, totalPages: 1 })),

    // Services count (for setup checklist)
    listServices({ per_page: 1 }).catch(() => ({ items: [], total: 0, totalPages: 1 })),

    // Sequences count (for setup checklist)
    wpRestList("/wp/v2/bluu_sequence", { per_page: 1, status: "publish" }).catch(() => ({ items: [], total: 0, totalPages: 1 })),

    // Cancellation queue — subscriptions where client has requested cancellation
    // Filter client-side by sub_cancellation_requested_at being non-empty
    wpRestList<WPSubscriptionPost>("/wp/v2/bluu_subscription", {
      per_page: 50,
      status: "publish",
    }).catch(() => ({ items: [], total: 0, totalPages: 1 })),
  ]);

  // Compute metrics
  const outstandingTotal = (outstandingInvoices.items as any[]).reduce(
    (sum: number, inv: any) => sum + (inv.acf?.inv_total ?? 0),
    0
  );
  const overdueTotal = (overdueInvoicesResult.items as any[]).reduce(
    (sum: number, inv: any) => sum + (inv.acf?.inv_total ?? 0),
    0
  );

  const mrrTotal = (subscriptionsResult.items as any[])
    .filter((s: any) => s.acf?.status === "active")
    .reduce((sum: number, s: any) => {
      const amount = s.acf?.amount ?? 0;
      const cycle = s.acf?.billing_cycle ?? "monthly";
      if (cycle === "monthly") return sum + amount;
      if (cycle === "quarterly") return sum + amount / 3;
      if (cycle === "annually" || cycle === "annual") return sum + amount / 12;
      if (cycle === "one_time") return sum; // one-time doesn't contribute to MRR
      return sum + amount;
    }, 0);

  const activeClientsCount = scope === "scoped" && role === "account_manager"
    ? (clientsResult.items as any[]).filter((c: any) =>
        (user.assignedClients ?? []).includes(c.id)
      ).length
    : clientsResult.total;

  // Upcoming renewals: invoices due in next 7 days
  const upcomingRenewals = (upcomingRenewalsResult.items as any[])
    .filter((inv: any) => isWithinDays(inv.acf?.inv_due_date ?? "", 7))
    .slice(0, 10)
    .map((inv: any) => ({
      id: inv.id,
      number: inv.acf?.inv_number,
      clientId: inv.acf?.inv_client,
      total: inv.acf?.inv_total,
      currency: inv.acf?.inv_currency,
      dueDate: inv.acf?.inv_due_date,
      status: inv.acf?.inv_status,
    }));

  // At-risk clients
  const atRiskClients = (clientsResult.items as any[])
    .filter((c: any) => c.acf?.health_status === "at_risk")
    .slice(0, 10)
    .map((c: any) => ({
      id: c.id,
      name: c.acf?.contact_name || c.title?.rendered,
      company: c.acf?.company_name,
      healthStatus: c.acf?.health_status,
      healthNote: c.acf?.health_note,
    }));

  // Follow-ups due today
  const followUpsToday = (followUpsResult.items as any[])
    .filter((c: any) => {
      const notCompleted = !c.acf?.comm_follow_up_completed || c.acf?.comm_follow_up_completed === "0";
      return isToday(c.acf?.comm_follow_up_due ?? "") && notCompleted;
    })
    .map((c: any) => ({
      id: c.id,
      clientId: c.acf?.comm_client,
      subject: c.acf?.comm_subject,
      followUpDue: c.acf?.comm_follow_up_due,
    }));

  // Recent activity
  const recentActivity = (recentActivityResult.items as any[]).map((c: any) => ({
    id: c.id,
    date: c.date,
    clientId: c.acf?.comm_client,
    subject: c.acf?.comm_subject,
    content: c.acf?.comm_content,
  }));

  // Overdue invoices for display
  const overdueInvoices = (overdueInvoicesResult.items as any[]).map((inv: any) => ({
    id: inv.id,
    number: inv.acf?.inv_number,
    clientId: inv.acf?.inv_client,
    total: inv.acf?.inv_total,
    currency: inv.acf?.inv_currency,
    dueDate: inv.acf?.inv_due_date,
    status: inv.acf?.inv_status,
    lastReminderSent: inv.acf?.inv_last_reminder_sent,
  }));

  // Cancellation queue — subscriptions where sub_cancellation_requested_at is set
  const cancellationQueue = (cancellationQueueResult.items as any[])
    .filter((s: any) => !!s.acf?.sub_cancellation_requested_at)
    .slice(0, 10)
    .map((s: any) => ({
      id: s.id,
      title: s.title?.rendered,
      clientId: s.acf?.client_id,
      status: s.acf?.status,
      cancelledAt: s.acf?.sub_cancellation_requested_at,
    }));

  // Setup checklist
  const setupChecklist = {
    hasClient:      clientsResult.total > 0,
    hasService:     servicesResult.total > 0,
    hasBankDetails: !!(process.env.BANK_DETAILS),
    hasStripe:      !!(process.env.STRIPE_SECRET_KEY),
    hasPaystack:    !!(process.env.PAYSTACK_SECRET_KEY),
    hasSequence:    sequencesResult.total > 0,
    hasPortalInvite: !!(process.env.NEXT_PUBLIC_APP_URL),
  };

  return NextResponse.json({
    metrics: hideMetrics
      ? null
      : {
          outstandingCount: outstandingInvoices.total,
          outstandingTotal,
          overdueCount: overdueInvoicesResult.total,
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
