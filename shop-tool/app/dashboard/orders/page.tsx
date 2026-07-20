import { getMyShop } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import OrderRow from "@/components/dashboard/order-row";
import type { OrderIntent } from "@/types";

export default async function OrdersPage() {
  const shop = await getMyShop();
  if (!shop) return null;

  const supabase = createSupabaseServerClient();
  const { data: orders } = await supabase
    .from("order_intents")
    .select("*")
    .eq("shop_id", shop.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-ink">Orders</h1>
      <p className="text-sm text-ink-soft -mt-2">
        These are checkout clicks, not confirmed sales — update the status once you&apos;ve
        heard back on WhatsApp.
      </p>

      {!orders || orders.length === 0 ? (
        <p className="text-center text-ink-soft py-16">No orders yet.</p>
      ) : (
        <div className="space-y-2">
          {(orders as OrderIntent[]).map((order) => (
            <OrderRow key={order.id} order={order} currency={shop.currency} />
          ))}
        </div>
      )}
    </div>
  );
}
