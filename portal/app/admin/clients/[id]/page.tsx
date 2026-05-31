import { notFound } from "next/navigation";
import { format, parseISO } from "date-fns";
import { CalendarDays, Mail, Phone, Building2, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ClientStatusBadge } from "@/components/admin/ClientStatusBadge";
import { HealthIndicator } from "@/components/admin/HealthIndicator";
import { ClientProfileActions } from "@/components/admin/ClientProfileActions";
import type { WPClientPost, WPSubscriptionPost } from "@/lib/wp-api";

export async function generateMetadata({ params }: { params: { id: string } }) {
  return { title: `Client #${params.id}` };
}

async function fetchClient(id: string): Promise<{
  post: WPClientPost;
  subscriptions: WPSubscriptionPost[];
  subscriptionCount: number;
} | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/admin/clients/${id}`,
      { cache: "no-store" }
    );
    if (res.status === 404) return null;
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function InfoRow({ icon: Icon, label, value }: {
  icon: React.ElementType;
  label: string;
  value?: string | null;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm text-slate-900">{value}</p>
      </div>
    </div>
  );
}

export default async function ClientProfilePage({ params }: { params: { id: string } }) {
  const data = await fetchClient(params.id);
  if (!data) notFound();

  const { post, subscriptions, subscriptionCount } = data;
  const acf = post.acf;
  const clientName = acf.contact_name || post.title.rendered;
  const createdDate = post.date ? format(parseISO(post.date), "MMM d, yyyy") : "—";

  return (
    <div className="space-y-6 max-w-5xl">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">{clientName}</h1>
            <ClientStatusBadge status={acf.status ?? "onboarding"} />
            <HealthIndicator status={acf.health_status} showLabel />
          </div>
          <p className="text-slate-500 text-sm">
            {acf.company_name}
            {acf.company_website && (
              <a
                href={acf.company_website}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 inline-flex items-center gap-1 text-indigo-600 hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Website
              </a>
            )}
          </p>
          <p className="text-xs text-slate-400 flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" />
            Active since {createdDate}
          </p>
        </div>

        {/* Quick actions — client component handles invite, health override */}
        <ClientProfileActions clientId={params.id} currentHealth={acf.health_status} />
      </div>

      <Separator />

      {/* ── Two-column layout ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left column — contact + mood trend */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                Contact Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow icon={Mail}     label="Email"   value={acf.contact_email} />
              <InfoRow icon={Phone}    label="Phone"   value={acf.contact_phone} />
              <InfoRow icon={Building2} label="Company" value={acf.company_name} />
              {acf.tags && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {acf.tags.split(",").filter(Boolean).map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700"
                    >
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {acf.notes && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                  Internal Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{acf.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Mood Trend — placeholder for Batch 4 */}
          <Card className="border-dashed">
            <CardContent className="py-8 text-center text-slate-400">
              <p className="text-sm font-medium">Mood Trend Chart</p>
              <p className="text-xs mt-1">Built in Batch 4 (AI + Communications)</p>
            </CardContent>
          </Card>
        </div>

        {/* Right column — subscriptions, timeline, files */}
        <div className="lg:col-span-2 space-y-6">

          {/* ── Subscriptions strip ─────────────────────────────────────────── */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                Active Services ({subscriptionCount})
              </CardTitle>
              <Button asChild size="sm" variant="outline">
                <a href={`/admin/subscriptions/new?clientId=${params.id}`}>
                  Assign Service
                </a>
              </Button>
            </CardHeader>
            <CardContent>
              {subscriptions.length === 0 ? (
                <div className="py-6 text-center text-slate-400">
                  <p className="text-sm">No services assigned yet</p>
                  <p className="text-xs mt-1">
                    <a href={`/admin/subscriptions/new?clientId=${params.id}`} className="text-indigo-600 hover:underline">
                      Assign a service →
                    </a>
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {subscriptions.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between rounded-lg border px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-900">{sub.title.rendered}</p>
                        <p className="text-xs text-slate-500">
                          {sub.acf.currency} {sub.acf.amount?.toLocaleString()} /{" "}
                          {sub.acf.billing_cycle?.replace("_", " ")}
                        </p>
                      </div>
                      <div className="text-right">
                        <ClientStatusBadge status={sub.acf.status} />
                        {sub.acf.next_billing_date && (
                          <p className="text-xs text-slate-400 mt-1">
                            Next: {format(parseISO(sub.acf.next_billing_date), "MMM d")}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── Communication timeline — placeholder ────────────────────────── */}
          <Card className="border-dashed">
            <CardContent className="py-8 text-center text-slate-400">
              <p className="text-sm font-medium">Communication Timeline</p>
              <p className="text-xs mt-1">Built in Batch 4 (AI + Communications)</p>
            </CardContent>
          </Card>

          {/* ── File manager — placeholder ───────────────────────────────────── */}
          <Card className="border-dashed">
            <CardContent className="py-8 text-center text-slate-400">
              <p className="text-sm font-medium">File Manager</p>
              <p className="text-xs mt-1">Built in Batch 6 (Files)</p>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
