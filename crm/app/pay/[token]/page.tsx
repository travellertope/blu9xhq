import { notFound } from "next/navigation";
import { format, parseISO } from "date-fns";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PayNowButton from "@/components/pay/pay-now-button";

interface InvoiceLineItemRow {
  description: string;
  amount: number;
}

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  sent: "Awaiting payment",
  paid: "Paid",
  overdue: "Overdue",
  void: "Void",
};

export default async function PayPage({
  params,
  searchParams,
}: {
  params: { token: string };
  searchParams: { paid?: string };
}) {
  const supabase = createSupabaseAdminClient();
  const { data: invoice } = await supabase
    .from("invoices")
    .select("*, clients(company_name, contact_name), tenants(name, logo_url, accent_colour)")
    .eq("public_token", params.token)
    .maybeSingle();

  if (!invoice) notFound();

  const tenant = invoice.tenants as { name: string; logo_url: string | null; accent_colour: string | null } | null;
  const client = invoice.clients as { company_name: string; contact_name: string } | null;
  const lineItems: InvoiceLineItemRow[] = invoice.line_items ?? [];
  const accent = tenant?.accent_colour || "#2F5FE0";
  const justPaid = searchParams.paid === "1";
  const canPay = !justPaid && (invoice.status === "sent" || invoice.status === "overdue");

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center">
          {tenant?.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={tenant.logo_url} alt={tenant.name} className="h-10 mx-auto object-contain" />
          ) : (
            <p className="font-bold text-lg text-slate-900">{tenant?.name ?? "Invoice"}</p>
          )}
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Invoice {invoice.invoice_number}</CardTitle>
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{
                  background: invoice.status === "paid" || justPaid ? "#DCFCE7" : "#F1F5F9",
                  color: invoice.status === "paid" || justPaid ? "#15803D" : "#475569",
                }}
              >
                {justPaid ? "Paid" : (STATUS_LABEL[invoice.status] ?? invoice.status)}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-slate-500">Billed to</p>
                <p className="font-medium text-slate-900">
                  {client?.company_name || client?.contact_name || "—"}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Due date</p>
                <p className="font-medium text-slate-900">
                  {invoice.due_date ? format(parseISO(invoice.due_date), "MMM d, yyyy") : "—"}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {lineItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-sm py-2 border-b last:border-0 border-slate-100"
                >
                  <span className="text-slate-700">{item.description}</span>
                  <span className="font-medium text-slate-900">
                    {invoice.currency} {item.amount?.toLocaleString()}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between pt-2 font-bold">
                <span>Total</span>
                <span className="text-lg">
                  {invoice.currency} {invoice.total?.toLocaleString()}
                </span>
              </div>
            </div>

            {invoice.status === "paid" || justPaid ? (
              <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 text-center font-medium">
                This invoice has been paid — thank you!
              </div>
            ) : invoice.status === "void" ? (
              <div className="rounded-lg bg-slate-100 border border-slate-200 px-4 py-3 text-sm text-slate-500 text-center">
                This invoice has been voided.
              </div>
            ) : canPay ? (
              <PayNowButton token={params.token} accentColor={accent} />
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
