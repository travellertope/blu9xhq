"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { ArrowLeft, Download, CreditCard, Building2, Upload, CheckCircle } from "lucide-react";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface LineItem {
  description: string;
  amount: number;
}

interface InvoiceDetail {
  id: number;
  invoiceNumber: string;
  status: string;
  total: number;
  currency: string;
  issuedDate: string;
  dueDate: string;
  paidAt?: string;
  notes?: string;
  lineItems: LineItem[];
  hasPdf?: boolean;
  pdfKey?: string;
  paymentGateway: string;
  subscriptionName: string;
}

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

interface BankDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  sortCode: string;
}

function isOverdue(dueDate: string) {
  return new Date(dueDate) < new Date();
}

function formatAmount(currency: string, amount: number) {
  return currency + " " + (amount ?? 0).toLocaleString();
}

// ─── Stripe new-card payment element ─────────────────────────────────────────

function StripeNewCardForm({
  onSuccess,
  currency,
  amount,
}: {
  clientSecret?: string;
  onSuccess: () => void;
  currency: string;
  amount: number;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);

  async function handlePay() {
    if (!stripe || !elements) return;
    setPaying(true);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.href },
      redirect: "if_required",
    });
    setPaying(false);
    if (error) {
      toast.error(error.message ?? "Payment failed");
    } else {
      onSuccess();
    }
  }

  return (
    <div className="space-y-4">
      <PaymentElement />
      <button
        onClick={handlePay}
        disabled={paying || !stripe}
        className="w-full bg-[#1875F2] hover:bg-[#1461CE] disabled:opacity-50 text-white rounded-md px-4 py-2.5 text-sm font-medium transition-colors"
      >
        {paying ? "Processing…" : "Pay " + formatAmount(currency, amount) + " Now"}
      </button>
    </div>
  );
}

// ─── Bank transfer section ────────────────────────────────────────────────────

function BankTransferSection({ invoiceId }: { invoiceId: number }) {
  const [details, setDetails] = useState<BankDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch("/api/portal/settings/bank-details")
      .then((r) => r.json())
      .then((d) => setDetails(d as BankDetails))
      .catch(() => setDetails(null))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmitProof() {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("invoiceId", String(invoiceId));
      fd.append("file", file);
      const res = await fetch("/api/portal/payments/bank-proof", { method: "POST", body: fd });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error((err as { error?: string }).error ?? "Upload failed");
        return;
      }
      setSubmitted(true);
      toast.success("Proof submitted — we'll confirm your payment shortly.");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  if (loading) return <div className="h-32 bg-slate-100 rounded animate-pulse" />;

  return (
    <div className="space-y-4">
      {details && (
        <div className="bg-slate-50 rounded-lg p-4 space-y-2 text-sm">
          <div className="flex items-center gap-2 text-slate-700 font-medium mb-3">
            <Building2 size={16} />
            Bank Transfer Details
          </div>
          {[
            ["Bank", details.bankName],
            ["Account Name", details.accountName],
            ["Account Number", details.accountNumber],
            ["Sort Code", details.sortCode],
          ].map(([label, value]) =>
            value ? (
              <div key={label} className="flex justify-between">
                <span className="text-slate-500">{label}</span>
                <span className="font-mono font-medium text-slate-800">{value}</span>
              </div>
            ) : null
          )}
        </div>
      )}

      {submitted ? (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-700">
          <CheckCircle size={16} />
          Thank you — we&apos;ll confirm your payment shortly.
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-slate-600">After transferring, upload your payment proof below:</p>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Upload proof (PDF or image, max 5MB)</span>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="mt-1 block w-full text-sm text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-[#1461CE] hover:file:bg-blue-100"
            />
          </label>
          <button
            onClick={handleSubmitProof}
            disabled={!file || uploading}
            className="inline-flex items-center gap-2 bg-[#1875F2] hover:bg-[#1461CE] disabled:opacity-50 text-white rounded-md px-4 py-2 text-sm font-medium transition-colors"
          >
            <Upload size={14} />
            {uploading ? "Uploading…" : "Submit Proof"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = Number(params.id);

  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [gateway, setGateway] = useState("stripe");
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [useNewCard, setUseNewCard] = useState(false);
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [invRes, pmRes] = await Promise.all([
        fetch("/api/portal/invoices/" + invoiceId),
        fetch("/api/portal/payment-methods"),
      ]);
      const invData = await invRes.json() as InvoiceDetail & { error?: string };
      if (invData.error) { toast.error(invData.error); return; }
      setInvoice(invData);

      const pmData = await pmRes.json() as { gateway: string; methods: SavedCard[] };
      setGateway(pmData.gateway ?? invData.paymentGateway ?? "stripe");
      setSavedCards(pmData.methods ?? []);
      const def = pmData.methods?.find((c) => c.isDefault);
      if (def) setSelectedCardId(def.id ?? def.authorizationCode ?? null);
    } catch {
      toast.error("Failed to load invoice");
    } finally {
      setLoading(false);
    }
  }, [invoiceId]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (useNewCard && gateway === "stripe" && invoice && ["sent", "overdue"].includes(invoice.status)) {
      fetch("/api/portal/payments/stripe-intent?invoiceId=" + invoiceId)
        .then((r) => r.json())
        .then((d: { clientSecret?: string }) => {
          if (d.clientSecret) setStripeClientSecret(d.clientSecret);
        })
        .catch(() => toast.error("Failed to initialize payment"));
    }
  }, [useNewCard, gateway, invoice, invoiceId]);

  async function handleDownload() {
    if (!invoice) return;
    try {
      const res = await fetch("/api/portal/invoices/" + invoiceId + "/download");
      if (!res.ok) { toast.error("PDF not yet available"); return; }
      const { signedUrl } = await res.json() as { signedUrl: string };
      window.open(signedUrl, "_blank");
    } catch { toast.error("Download failed"); }
  }

  async function handlePayWithSavedCard() {
    if (!selectedCardId || !invoice) return;
    setPaying(true);
    try {
      const body: Record<string, unknown> = { invoiceId };
      if (gateway === "paystack") {
        body.paystackAuthCode = selectedCardId;
      } else {
        body.paymentMethodId = selectedCardId;
      }
      const res = await fetch("/api/portal/payments/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json() as {
        success?: boolean;
        error?: string;
        requiresAction?: boolean;
        clientSecret?: string;
      };
      if (data.success) {
        setPaid(true);
        setInvoice((prev) => prev ? { ...prev, status: "paid" } : prev);
        toast.success("Payment successful!");
      } else if (data.requiresAction && data.clientSecret) {
        setStripeClientSecret(data.clientSecret);
        setUseNewCard(true);
        toast.info("Your card requires additional verification.");
      } else {
        toast.error(data.error ?? "Payment failed");
      }
    } catch {
      toast.error("Payment failed");
    } finally {
      setPaying(false);
    }
  }

  async function handlePaystackRedirect() {
    if (!invoice) return;
    const res = await fetch("/api/portal/payments/paystack-init?invoiceId=" + invoiceId);
    const data = await res.json() as { authorizationUrl?: string; error?: string };
    if (data.authorizationUrl) {
      window.location.href = data.authorizationUrl;
    } else {
      toast.error(data.error ?? "Failed to initialize payment");
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 max-w-2xl mx-auto">
        {[1, 2, 3, 4].map((i) => <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />)}
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500">Invoice not found.</p>
        <Link href="/portal/invoices" className="text-[#1875F2] text-sm mt-2 inline-block">Back to invoices</Link>
      </div>
    );
  }

  const isPayable = invoice.status === "sent" || invoice.status === "overdue";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Invoice {invoice.invoiceNumber}</h1>
          <p className="text-sm text-slate-500">{invoice.subscriptionName}</p>
        </div>
        <div className="ml-auto flex gap-2">
          {invoice.pdfKey && (
            <button onClick={handleDownload} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#1875F2] border border-slate-200 rounded-md px-3 py-1.5 transition-colors">
              <Download size={14} />
              PDF
            </button>
          )}
        </div>
      </div>

      {/* Invoice document */}
      <div className="border border-slate-200 rounded-xl bg-white p-6 space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-slate-900">BluuHQ</h2>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-slate-400">INVOICE</p>
            <p className="font-mono text-slate-600">{invoice.invoiceNumber}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 text-sm">
          <div>
            <p className="text-slate-400 mb-1">Issue Date</p>
            <p className="font-medium text-slate-800">{invoice.issuedDate}</p>
          </div>
          <div>
            <p className="text-slate-400 mb-1">Due Date</p>
            <p className={"font-medium " + (isOverdue(invoice.dueDate) && invoice.status !== "paid" ? "text-red-600" : "text-slate-800")}>
              {invoice.dueDate}
            </p>
          </div>
          {invoice.paidAt && (
            <div>
              <p className="text-slate-400 mb-1">Paid On</p>
              <p className="font-medium text-green-700">{invoice.paidAt}</p>
            </div>
          )}
        </div>

        <div className="border-t border-slate-100" />

        <div>
          <div className="flex justify-between text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
            <span>Description</span>
            <span>Amount</span>
          </div>
          {invoice.lineItems.map((item, i) => (
            <div key={i} className="flex justify-between py-2 text-sm border-b border-slate-50 last:border-0">
              <span className="text-slate-700">{item.description}</span>
              <span className="font-medium text-slate-800">{formatAmount(invoice.currency, item.amount)}</span>
            </div>
          ))}
          <div className="flex justify-between pt-3 font-bold text-slate-800">
            <span>Total</span>
            <span>{formatAmount(invoice.currency, invoice.total)}</span>
          </div>
        </div>

        {invoice.notes && (
          <div className="text-sm text-slate-500 border-t border-slate-100 pt-4">
            <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Notes</p>
            <p>{invoice.notes}</p>
          </div>
        )}

        <div className="flex justify-end">
          <span className={"text-xs font-semibold px-2.5 py-1 rounded-full " +
            (invoice.status === "paid" ? "bg-green-100 text-green-700" :
             invoice.status === "overdue" ? "bg-red-100 text-red-700" :
             invoice.status === "sent" ? "bg-blue-100 text-blue-700" :
             "bg-slate-100 text-slate-600")}>
            {invoice.status === "sent" ? "Outstanding" :
             invoice.status === "overdue" ? "OVERDUE" :
             invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
          </span>
        </div>
      </div>

      {/* Payment section */}
      {isPayable && !paid && (
        <div className="border border-slate-200 rounded-xl bg-white p-6 space-y-5">
          <div>
            <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <CreditCard size={18} />
              Pay This Invoice
            </h3>
            <p className="text-sm text-slate-500 mt-0.5">{formatAmount(invoice.currency, invoice.total)} due</p>
          </div>

          {/* Bank transfer gateway */}
          {(invoice.paymentGateway === "bank_transfer" || gateway === "bank_transfer") && (
            <BankTransferSection invoiceId={invoice.id} />
          )}

          {/* Stripe gateway */}
          {(invoice.paymentGateway === "stripe" || gateway === "stripe") && invoice.paymentGateway !== "bank_transfer" && (
            <div className="space-y-4">
              {savedCards.length > 0 && (
                <div className="space-y-2">
                  {savedCards.map((card) => (
                    <label
                      key={card.id}
                      className={"flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors " +
                        (selectedCardId === card.id && !useNewCard
                          ? "border-indigo-400 bg-blue-50"
                          : "border-slate-200 hover:border-slate-300")}
                    >
                      <input
                        type="radio"
                        name="card"
                        checked={selectedCardId === card.id && !useNewCard}
                        onChange={() => { setSelectedCardId(card.id ?? null); setUseNewCard(false); }}
                        className="text-[#1875F2]"
                      />
                      <div className="flex-1 text-sm">
                        <span className="capitalize font-medium text-slate-700">{card.brand}</span>
                        <span className="text-slate-500 ml-1">•••• {card.last4}</span>
                        <span className="text-slate-400 ml-2 text-xs">
                          Exp {String(card.expMonth).padStart(2, "0")}/{String(card.expYear).slice(-2)}
                        </span>
                      </div>
                      {card.isDefault && (
                        <span className="text-xs bg-blue-100 text-[#1461CE] px-2 py-0.5 rounded-full font-medium">Default</span>
                      )}
                    </label>
                  ))}
                  <label
                    className={"flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors " +
                      (useNewCard ? "border-indigo-400 bg-blue-50" : "border-slate-200 hover:border-slate-300")}
                  >
                    <input
                      type="radio"
                      name="card"
                      checked={useNewCard}
                      onChange={() => setUseNewCard(true)}
                      className="text-[#1875F2]"
                    />
                    <span className="text-sm text-slate-700">Pay with a new card</span>
                  </label>
                </div>
              )}

              {(savedCards.length === 0 || useNewCard) && stripeClientSecret ? (
                <Elements stripe={stripePromise} options={{ clientSecret: stripeClientSecret }}>
                  <StripeNewCardForm
                    clientSecret={stripeClientSecret}
                    currency={invoice.currency}
                    amount={invoice.total}
                    onSuccess={() => {
                      setPaid(true);
                      setInvoice((prev) => prev ? { ...prev, status: "paid" } : prev);
                      toast.success("Payment successful!");
                    }}
                  />
                </Elements>
              ) : !useNewCard && (
                <button
                  onClick={handlePayWithSavedCard}
                  disabled={!selectedCardId || paying}
                  className="w-full bg-[#1875F2] hover:bg-[#1461CE] disabled:opacity-50 text-white rounded-md px-4 py-2.5 text-sm font-medium transition-colors"
                >
                  {paying ? "Processing…" : "Pay " + formatAmount(invoice.currency, invoice.total) + " Now"}
                </button>
              )}
            </div>
          )}

          {/* Paystack gateway */}
          {(invoice.paymentGateway === "paystack" || gateway === "paystack") && invoice.paymentGateway !== "bank_transfer" && (
            <div className="space-y-4">
              {savedCards.length > 0 && (
                <div className="space-y-2">
                  {savedCards.map((card) => (
                    <label
                      key={card.authorizationCode}
                      className={"flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors " +
                        (selectedCardId === card.authorizationCode && !useNewCard
                          ? "border-indigo-400 bg-blue-50"
                          : "border-slate-200 hover:border-slate-300")}
                    >
                      <input
                        type="radio"
                        name="card"
                        checked={selectedCardId === card.authorizationCode && !useNewCard}
                        onChange={() => { setSelectedCardId(card.authorizationCode ?? null); setUseNewCard(false); }}
                        className="text-[#1875F2]"
                      />
                      <div className="flex-1 text-sm">
                        <span className="capitalize font-medium text-slate-700">{card.cardType}</span>
                        <span className="text-slate-500 ml-1">•••• {card.last4}</span>
                      </div>
                    </label>
                  ))}
                  <label
                    className={"flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors " +
                      (useNewCard ? "border-indigo-400 bg-blue-50" : "border-slate-200 hover:border-slate-300")}
                  >
                    <input
                      type="radio"
                      name="card"
                      checked={useNewCard}
                      onChange={() => setUseNewCard(true)}
                      className="text-[#1875F2]"
                    />
                    <span className="text-sm text-slate-700">Add and pay with Paystack</span>
                  </label>
                </div>
              )}

              {(savedCards.length === 0 || useNewCard) ? (
                <button
                  onClick={handlePaystackRedirect}
                  className="w-full bg-[#1875F2] hover:bg-[#1461CE] text-white rounded-md px-4 py-2.5 text-sm font-medium transition-colors"
                >
                  Pay with Paystack →
                </button>
              ) : (
                <button
                  onClick={handlePayWithSavedCard}
                  disabled={!selectedCardId || paying}
                  className="w-full bg-[#1875F2] hover:bg-[#1461CE] disabled:opacity-50 text-white rounded-md px-4 py-2.5 text-sm font-medium transition-colors"
                >
                  {paying ? "Processing…" : "Pay " + formatAmount(invoice.currency, invoice.total) + " Now"}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {paid && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-5 text-green-700">
          <CheckCircle size={24} className="shrink-0" />
          <div>
            <p className="font-semibold">Payment successful!</p>
            <p className="text-sm">A receipt has been sent to your email.</p>
          </div>
        </div>
      )}
    </div>
  );
}
