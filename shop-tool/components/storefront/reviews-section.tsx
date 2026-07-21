"use client";

import { useMemo, useState } from "react";
import type { ShopReview } from "@/types";

function Stars({ rating, size = "text-sm" }: { rating: number; size?: string }) {
  return (
    <span className={`text-[var(--shop-accent)] ${size}`} aria-label={`${rating} out of 5 stars`}>
      {"★".repeat(rating)}
      <span className="text-line">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

export default function ReviewsSection({
  shopId,
  initialReviews,
}: {
  shopId: string;
  initialReviews: ShopReview[];
}) {
  const [reviews, setReviews] = useState(initialReviews);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const average = useMemo(() => {
    if (reviews.length === 0) return null;
    return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  }, [reviews]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shop_id: shopId, reviewer_name: name, rating, comment: comment || null }),
      });
      if (!res.ok) throw new Error("Couldn't save your review");
      const body = await res.json();
      setReviews((prev) => [body.review as ShopReview, ...prev]);
      setName("");
      setRating(5);
      setComment("");
      setShowForm(false);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-8 pt-6 border-t border-line">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="shop-font-heading text-lg font-bold text-ink">Reviews</h2>
          {average !== null ? (
            <p className="text-sm text-ink-soft mt-0.5 flex items-center gap-1.5">
              <Stars rating={Math.round(average)} />
              <span>
                {average.toFixed(1)} · {reviews.length} review{reviews.length === 1 ? "" : "s"}
              </span>
            </p>
          ) : (
            <p className="text-sm text-ink-soft mt-0.5">No reviews yet</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="text-sm font-semibold text-[var(--shop-accent)] shrink-0"
        >
          {showForm ? "Cancel" : "Write a review"}
        </button>
      </div>

      {submitted && (
        <p className="text-sm text-green bg-green/10 border border-green/20 rounded-lg px-3 py-2 mb-4">
          Thanks for your review!
        </p>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-bg-soft rounded-lg p-3.5 mb-4 space-y-3">
          {error && <p className="text-xs text-coral">{error}</p>}
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                aria-label={`${n} star${n === 1 ? "" : "s"}`}
                className={`text-2xl leading-none ${n <= rating ? "text-[var(--shop-accent)]" : "text-line"}`}
              >
                ★
              </button>
            ))}
          </div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
            maxLength={80}
            className="w-full rounded-md border border-line px-3 py-2 text-sm bg-white"
          />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Optional comment"
            rows={3}
            maxLength={1000}
            className="w-full rounded-md border border-line px-3 py-2 text-sm bg-white"
          />
          <button
            type="submit"
            disabled={submitting || !name}
            className="w-full h-9 rounded-md bg-[var(--shop-accent)] text-white text-sm font-semibold disabled:opacity-50"
          >
            {submitting ? "Submitting…" : "Submit review"}
          </button>
        </form>
      )}

      {reviews.length > 0 && (
        <ul className="space-y-4">
          {reviews.map((r) => (
            <li key={r.id} className="border-b border-line pb-4 last:border-0 last:pb-0">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-ink">{r.reviewer_name}</span>
                <Stars rating={r.rating} size="text-xs" />
              </div>
              {r.comment && <p className="text-sm text-ink-soft mt-1 leading-relaxed">{r.comment}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
