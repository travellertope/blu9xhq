"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { CreditCard, Trash2, Star, Plus, CheckCircle } from "lucide-react";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface SavedCard {
  id?: string;
  brand?: string;
  last4: string;
  expMonth?: number;
  expYear?: number;
  isDefault?: boolean;
  authorizationCode?: string;
  cardType?: string;
}

function ConfirmModal({
  open,
  message,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl space-y-4">
        <p className="text-sm text-slate-700">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="text-sm text-slate-500 hover:text-slate-700 px-4 py-2 rounded-md border border-slate-200">
            Cancel
          </button>
          <button onClick={onConfirm} className="text-sm font-medium text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md">
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

function AddStripeCardForm({
  onSuccess,
  onCancel,
}: {
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!stripe || !elements) return;
    setSaving(true);
    const { setupIntent, error } = await stripe.confirmSetup({
      elements,
      confirmParams: { return_url: window.location.href },
      redirect: "if_required",
    });
    if (error) {
      toast.error(error.message ?? "Failed to add card");
      setSaving(false);
      return;
    }
    if (setupIntent?.status === "succeeded") {
      await fetch("/api/portal/payment-methods/setup", { method: "POST" });
      toast.success("Card added!");
      onSuccess();
    }
    setSaving(false);
  }

  return (
    <div className="border border-slate-200 rounded-xl p-5 space-y-4 bg-white">
      <h3 className="text-sm font-semibold text-slate-700">Add New Card</h3>
      <PaymentElement />
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 text-sm text-slate-500 border border-slate-200 rounded-md py-2 hover:bg-slate-50">
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving || !stripe}
          className="flex-1 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-md py-2 transition-colors"
        >
          {saving ? "Saving…" : "Save Card"}
        </button>
      </div>
    </div>
  );
}

export default function PaymentMethodsPage() {
  const [cards, setCards] = useState<SavedCard[]>([]);
  const [gateway, setGateway] = useState("stripe");
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [setupClientSecret, setSetupClientSecret] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadCards = useCallback(async () => {
    try {
      const res = await fetch("/api/portal/payment-methods");
      const data = await res.json() as { gateway: string; methods: SavedCard[] };
      setGateway(data.gateway ?? "stripe");
      setCards(data.methods ?? []);
    } catch {
      toast.error("Failed to load payment methods");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCards(); }, [loadCards]);

  async function handleAddStripe() {
    try {
      const res = await fetch("/api/portal/payment-methods/setup");
      const data = await res.json() as { clientSecret?: string };
      if (data.clientSecret) {
        setSetupClientSecret(data.clientSecret);
        setShowAddForm(true);
      }
    } catch {
      toast.error("Failed to initialize card setup");
    }
  }

  async function handleAddPaystack() {
    try {
      const res = await fetch("/api/portal/payment-methods/paystack-auth", { method: "POST" });
      const data = await res.json() as { authorizationUrl?: string };
      if (data.authorizationUrl) window.location.href = data.authorizationUrl;
    } catch {
      toast.error("Failed to initialize Paystack");
    }
  }

  async function handleSetDefault(id: string) {
    setActionLoading(id);
    try {
      const res = await fetch("/api/portal/payment-methods/" + id + "/set-default", { method: "PATCH" });
      if (!res.ok) throw new Error("Failed");
      toast.success("Default card updated");
      await loadCards();
    } catch {
      toast.error("Failed to update default");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRemove(id: string) {
    setActionLoading(id);
    try {
      const res = await fetch("/api/portal/payment-methods/" + id, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      toast.success("Card removed");
      setCards((prev) => prev.filter((c) => c.id !== id));
    } catch {
      toast.error("Failed to remove card");
    } finally {
      setActionLoading(null);
      setConfirmRemove(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-3 max-w-lg">
        {[1, 2].map((i) => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Payment Methods</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage your saved cards for one-click payments</p>
      </div>

      {cards.length === 0 && !showAddForm ? (
        <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl">
          <CreditCard className="mx-auto mb-3 text-slate-300" size={36} />
          <p className="text-sm text-slate-500 mb-4">No payment methods saved. Add one below to enable one-click payments.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {cards.map((card) => {
            const id = card.id ?? card.authorizationCode ?? "";
            return (
              <div key={id} className="flex items-center gap-4 border border-slate-200 rounded-xl p-4 bg-white">
                <div className="h-10 w-14 bg-slate-100 rounded flex items-center justify-center">
                  <CreditCard size={20} className="text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800">
                    <span className="capitalize">{card.brand ?? card.cardType ?? "Card"}</span>
                    {" •••• •••• •••• " + card.last4}
                  </p>
                  {(card.expMonth || card.expYear) && (
                    <p className="text-xs text-slate-400">
                      Expires {String(card.expMonth).padStart(2, "0")}/{String(card.expYear).slice(-2)}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {card.isDefault ? (
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                      <CheckCircle size={10} />
                      Default
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSetDefault(id)}
                      disabled={actionLoading === id}
                      className="text-xs text-slate-500 hover:text-indigo-600 px-2 py-1 rounded border border-slate-200 hover:border-indigo-300 transition-colors disabled:opacity-50"
                    >
                      <Star size={12} className="inline mr-1" />
                      Set Default
                    </button>
                  )}
                  <button
                    onClick={() => setConfirmRemove(id)}
                    disabled={actionLoading === id}
                    className="text-slate-400 hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add card section */}
      {showAddForm && gateway === "stripe" && setupClientSecret ? (
        <Elements stripe={stripePromise} options={{ clientSecret: setupClientSecret }}>
          <AddStripeCardForm
            onSuccess={() => { setShowAddForm(false); setSetupClientSecret(null); loadCards(); }}
            onCancel={() => { setShowAddForm(false); setSetupClientSecret(null); }}
          />
        </Elements>
      ) : (
        !showAddForm && (
          <button
            onClick={gateway === "stripe" ? handleAddStripe : handleAddPaystack}
            className="w-full inline-flex items-center justify-center gap-2 border border-indigo-200 text-indigo-600 hover:bg-indigo-50 rounded-xl px-4 py-3 text-sm font-medium transition-colors"
          >
            <Plus size={16} />
            Add New Payment Method
          </button>
        )
      )}

      <ConfirmModal
        open={!!confirmRemove}
        message="Remove this card? This cannot be undone."
        onConfirm={() => confirmRemove && handleRemove(confirmRemove)}
        onCancel={() => setConfirmRemove(null)}
      />
    </div>
  );
}
