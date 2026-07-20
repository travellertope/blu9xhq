"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatMoney } from "@/lib/whatsapp";
import type { DeliveryZone } from "@/types";

export default function DeliveryZonesManager({
  currency,
  initialZones,
}: {
  currency: string;
  initialZones: DeliveryZone[];
}) {
  const [zones, setZones] = useState(initialZones);
  const [name, setName] = useState("");
  const [fee, setFee] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setAdding(true);
    try {
      const res = await fetch("/api/delivery-zones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, fee: Number(fee) || 0 }),
      });
      if (!res.ok) throw new Error("Couldn't save delivery zone");
      const body = await res.json();
      setZones((prev) => [...prev, body.zone as DeliveryZone]);
      setName("");
      setFee("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setAdding(false);
    }
  }

  async function handleRemove(id: string) {
    setZones((prev) => prev.filter((z) => z.id !== id));
    await fetch(`/api/delivery-zones/${id}`, { method: "DELETE" });
  }

  return (
    <div className="space-y-3 pt-2 border-t border-line">
      <Label>Delivery zones</Label>
      <p className="text-xs text-ink-soft -mt-1">
        Shown as a pickup/delivery picker in the cart. Leave empty to keep using the plain
        delivery info text above instead.
      </p>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">{error}</div>
      )}

      {zones.length > 0 && (
        <ul className="space-y-1.5">
          {zones.map((zone) => (
            <li
              key={zone.id}
              className="flex items-center justify-between gap-2 bg-white border border-line rounded-md px-3 py-2"
            >
              <span className="text-sm text-ink">
                {zone.name} — {formatMoney(zone.fee, currency)}
              </span>
              <button
                type="button"
                onClick={() => handleRemove(zone.id)}
                className="text-ink-soft text-sm shrink-0"
                aria-label={`Remove ${zone.name}`}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleAdd} className="flex gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Lagos Island"
          className="flex-1"
        />
        <Input
          value={fee}
          onChange={(e) => setFee(e.target.value)}
          type="number"
          min="0"
          step="0.01"
          placeholder="Fee"
          className="w-24"
        />
        <Button type="submit" size="sm" disabled={adding || !name}>
          Add
        </Button>
      </form>
    </div>
  );
}
