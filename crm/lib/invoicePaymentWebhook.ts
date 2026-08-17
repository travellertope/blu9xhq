const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function markInvoicePaid(params: {
  invoiceId: string;
  tenantId: string;
  gateway: "stripe" | "paystack";
  gatewayRef: string;
}) {
  const today = new Date().toISOString().split("T")[0];

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/invoices?id=eq.${params.invoiceId}&tenant_id=eq.${params.tenantId}`,
    {
      method: "PATCH",
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        status: "paid",
        paid_date: today,
        payment_gateway: params.gateway,
        gateway_payment_id: params.gatewayRef,
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to mark invoice paid: ${res.status} ${text}`);
  }
}
