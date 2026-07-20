import { notFound } from "next/navigation";
import { getMyShop } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import EditProductForm from "@/components/dashboard/edit-product-form";
import type { Category, Product } from "@/types";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const shop = await getMyShop();
  if (!shop) return null;

  const supabase = createSupabaseServerClient();
  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase.from("products").select("*").eq("id", params.id).eq("shop_id", shop.id).maybeSingle(),
    supabase.from("categories").select("*").eq("shop_id", shop.id).order("sort_order"),
  ]);

  if (!product) notFound();

  return (
    <EditProductForm
      product={product as Product}
      categories={(categories ?? []) as Category[]}
    />
  );
}
