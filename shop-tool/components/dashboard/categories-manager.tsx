"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Category } from "@/types";

export default function CategoriesManager({ initialCategories }: { initialCategories: Category[] }) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [name, setName] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setAdding(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Couldn't save category");
      const body = await res.json();
      setCategories((prev) => [...prev, body.category as Category]);
      setName("");
      // Product edit/add forms fetch categories server-side, so they need a
      // refresh to see a category created just now in this same session.
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setAdding(false);
    }
  }

  async function handleRemove(id: string) {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    await fetch(`/api/categories/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="space-y-3 bg-white border border-line rounded-lg p-4">
      <Label>Categories</Label>
      <p className="text-xs text-ink-soft -mt-1">
        Shown as a filter on your storefront. Products without a category still show up under
        &quot;All&quot;.
      </p>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">{error}</div>
      )}

      {categories.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <li
              key={cat.id}
              className="flex items-center gap-1.5 bg-bg-soft border border-line rounded-full pl-3 pr-2 py-1"
            >
              <span className="text-sm text-ink">{cat.name}</span>
              <button
                type="button"
                onClick={() => handleRemove(cat.id)}
                className="text-ink-soft text-xs shrink-0"
                aria-label={`Remove ${cat.name}`}
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
          placeholder="e.g. Bags"
          className="flex-1"
        />
        <Button type="submit" size="sm" disabled={adding || !name}>
          Add
        </Button>
      </form>
    </div>
  );
}
