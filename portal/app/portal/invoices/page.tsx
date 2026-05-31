"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Download, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PortalInvoice {
  id: number;
  invoiceNumber: string;
  status: string;
  total: number;
  currency: string;
  issuedDate: string;
  dueDate: string;
  paidAt?: string;
  pdfUrl?: string;
}

const STATUS_COLORS: Record<string, string> = {
  sent: "bg-blue-100 text-blue-800",
  paid: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
  void: "bg-muted text-muted-foreground",
};

export default function PortalInvoicesPage() {
  const [invoices, setInvoices] = useState<PortalInvoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/portal/invoices")
      .then((r) => r.json())
      .then((d) => setInvoices(d.invoices ?? []))
      .catch(() => toast.error("Failed to load invoices"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Invoices</h1>
        <p className="text-muted-foreground text-sm">Your billing history</p>
      </div>

      {!invoices.length ? (
        <div className="text-center py-16 text-muted-foreground">
          <FileText className="mx-auto mb-3 opacity-40" size={40} />
          <p className="font-medium">No invoices yet</p>
        </div>
      ) : (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">All invoices</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">Invoice</th>
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">Issued</th>
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">Due</th>
                  <th className="text-right px-4 py-2 font-medium text-muted-foreground">Amount</th>
                  <th className="text-center px-4 py-2 font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium">{inv.invoiceNumber}</td>
                    <td className="px-4 py-3 text-muted-foreground">{inv.issuedDate}</td>
                    <td className="px-4 py-3 text-muted-foreground">{inv.dueDate}</td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {inv.currency} {inv.total?.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          STATUS_COLORS[inv.status] ?? "bg-muted text-muted-foreground"
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {inv.pdfUrl && (
                        <a
                          href={inv.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Download PDF"
                          className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                        >
                          <Download size={14} />
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
