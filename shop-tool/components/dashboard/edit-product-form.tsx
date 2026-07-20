"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Category, Product, ProductVariant } from "@/types";

interface VariantDraft {
  name: string;
  optionsText: string; // comma-separated while editing
}

export default function EditProductForm({
  product,
  categories,
}: {
  product: Product;
  categories: Category[];
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description ?? "");
  const [price, setPrice] = useState(String(product.price));
  const [compareAtPrice, setCompareAtPrice] = useState(
    product.compare_at_price ? String(product.compare_at_price) : ""
  );
  const [categoryId, setCategoryId] = useState(product.category_id ?? "");
  const [stockQty, setStockQty] = useState(product.stock_qty === null ? "" : String(product.stock_qty));
  const [images, setImages] = useState<string[]>(product.images);
  const [variants, setVariants] = useState<VariantDraft[]>(
    product.variants.map((v) => ({ name: v.name, optionsText: v.options.join(", ") }))
  );
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleAddImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/uploads", { method: "POST", body: form });
      if (!res.ok) throw new Error("Photo upload failed");
      const body = await res.json();
      setImages((prev) => [...prev, body.url]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Photo upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function removeImage(url: string) {
    setImages((prev) => prev.filter((i) => i !== url));
  }

  function addVariant() {
    setVariants((prev) => [...prev, { name: "", optionsText: "" }]);
  }

  function updateVariant(index: number, patch: Partial<VariantDraft>) {
    setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  }

  function removeVariant(index: number) {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const parsedVariants: ProductVariant[] = variants
      .filter((v) => v.name.trim() && v.optionsText.trim())
      .map((v) => ({
        name: v.name.trim(),
        options: v.optionsText.split(",").map((o) => o.trim()).filter(Boolean),
      }));

    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description: description || null,
          price: Number(price),
          compare_at_price: compareAtPrice ? Number(compareAtPrice) : null,
          category_id: categoryId || null,
          stock_qty: stockQty === "" ? null : Number(stockQty),
          images,
          variants: parsedVariants,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Couldn't save changes");
      }
      router.replace("/dashboard/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete "${product.name}"? This can't be undone.`)) return;
    await fetch(`/api/products/${product.id}`, { method: "DELETE" });
    router.replace("/dashboard/products");
    router.refresh();
  }

  return (
    <div className="max-w-sm mx-auto space-y-5 pb-8">
      <h1 className="text-lg font-bold text-ink">Edit product</h1>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <Label>Photos</Label>
          <div className="mt-1.5 grid grid-cols-4 gap-2">
            {images.map((url) => (
              <div key={url} className="relative aspect-square rounded-md overflow-hidden bg-bg-soft">
                <Image src={url} alt="" fill className="object-cover" sizes="80px" />
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full w-5 h-5 text-xs"
                  aria-label="Remove photo"
                >
                  ✕
                </button>
              </div>
            ))}
            {images.length < 4 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="aspect-square rounded-md border-2 border-dashed border-line flex items-center justify-center text-ink-soft text-xs"
              >
                {uploading ? "…" : "+ Add"}
              </button>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAddImage} className="hidden" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="price">Price</Label>
            <Input id="price" type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="compareAtPrice">Sale price was</Label>
            <Input
              id="compareAtPrice"
              type="number"
              min="0"
              step="0.01"
              value={compareAtPrice}
              onChange={(e) => setCompareAtPrice(e.target.value)}
              placeholder="Optional"
            />
          </div>
        </div>

        {categories.length > 0 && (
          <div className="space-y-1.5">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">No category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="stock">Stock quantity</Label>
          <Input
            id="stock"
            type="number"
            min="0"
            value={stockQty}
            onChange={(e) => setStockQty(e.target.value)}
            placeholder="Leave blank for unlimited"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label>Variants</Label>
            <button type="button" onClick={addVariant} className="text-sm font-semibold text-blue">
              + Add variant
            </button>
          </div>
          <div className="mt-1.5 space-y-2">
            {variants.map((variant, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  placeholder="Size"
                  value={variant.name}
                  onChange={(e) => updateVariant(i, { name: e.target.value })}
                  className="flex-1"
                />
                <Input
                  placeholder="S, M, L"
                  value={variant.optionsText}
                  onChange={(e) => updateVariant(i, { optionsText: e.target.value })}
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={() => removeVariant(i)}
                  className="text-ink-soft px-2"
                  aria-label="Remove variant"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
        <Button type="button" variant="outline" className="w-full text-red-600" onClick={handleDelete}>
          Delete product
        </Button>
      </form>
    </div>
  );
}
