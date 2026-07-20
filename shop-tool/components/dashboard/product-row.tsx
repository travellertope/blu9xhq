"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { formatMoney } from "@/lib/whatsapp";
import type { Product } from "@/types";

export default function ProductRow({ product, currency }: { product: Product; currency: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const image = product.images[0];

  async function toggleActive() {
    setBusy(true);
    await fetch(`/api/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !product.active }),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3 bg-white border border-line rounded-site p-3">
      <div className="w-12 h-12 rounded-md bg-bg-soft flex-shrink-0 overflow-hidden relative">
        {image && <Image src={image} alt={product.name} fill className="object-cover" sizes="48px" />}
      </div>
      <Link href={`/dashboard/products/${product.id}`} className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-ink truncate">{product.name}</p>
        <p className="text-sm text-ink-soft">{formatMoney(product.price, currency)}</p>
      </Link>
      <button
        onClick={toggleActive}
        disabled={busy}
        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
          product.active ? "bg-green/10 text-green" : "bg-ink-soft/10 text-ink-soft"
        }`}
      >
        {product.active ? "Live" : "Hidden"}
      </button>
    </div>
  );
}
