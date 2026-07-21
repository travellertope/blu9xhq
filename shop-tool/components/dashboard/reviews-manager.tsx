"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import type { ShopReview } from "@/types";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-blue text-xs" aria-label={`${rating} out of 5 stars`}>
      {"★".repeat(rating)}
      <span className="text-line">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

export default function ReviewsManager({ initialReviews }: { initialReviews: ShopReview[] }) {
  const [reviews, setReviews] = useState(initialReviews);

  async function toggleHidden(id: string, hidden: boolean) {
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, hidden } : r)));
    await fetch(`/api/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hidden }),
    });
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this review? This can't be undone.")) return;
    setReviews((prev) => prev.filter((r) => r.id !== id));
    await fetch(`/api/reviews/${id}`, { method: "DELETE" });
  }

  return (
    <div className="space-y-3 bg-white border border-line rounded-lg p-4">
      <Label>Reviews</Label>
      <p className="text-xs text-ink-soft -mt-1">
        Shown on your storefront. Anyone can leave one — hide or delete anything that isn&apos;t genuine.
      </p>

      {reviews.length === 0 ? (
        <p className="text-sm text-ink-soft py-4 text-center">No reviews yet.</p>
      ) : (
        <ul className="space-y-2.5">
          {reviews.map((r) => (
            <li key={r.id} className="border border-line rounded-md p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-ink truncate">{r.reviewer_name}</span>
                <Stars rating={r.rating} />
              </div>
              {r.comment && <p className="text-sm text-ink-soft mt-1">{r.comment}</p>}
              <div className="flex items-center gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => toggleHidden(r.id, !r.hidden)}
                  className="text-xs font-semibold text-blue"
                >
                  {r.hidden ? "Unhide" : "Hide"}
                </button>
                <button type="button" onClick={() => handleDelete(r.id)} className="text-xs font-semibold text-coral">
                  Delete
                </button>
                {r.hidden && <span className="text-xs text-ink-soft">Hidden from storefront</span>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
