"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ServiceRow {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  basePrice: number | null;
  currency: string;
  billingCycle: string | null;
  isActive: boolean;
}

function formatPrice(price: number | null, currency: string, cycle: string | null) {
  if (!price) return "—";
  const formatted = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currency || "GBP",
    minimumFractionDigits: 0,
  }).format(price);
  return cycle ? `${formatted} / ${cycle.replace("_", " ")}` : formatted;
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/services")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setServices(d.services ?? []);
      })
      .catch(() => toast.error("Failed to load services"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => <div key={i} className="h-14 bg-muted rounded animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Services</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {services.length} service{services.length !== 1 ? "s" : ""} in your catalogue
        </p>
      </div>

      {services.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          <Package className="mx-auto mb-3 opacity-30" size={40} />
          <p className="font-medium">No services yet</p>
          <p className="text-sm mt-1">Add services via the WordPress admin to get started.</p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Service</th>
                  <th className="px-4 py-3 font-medium hidden sm:table-cell">Category</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Description</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {services.map((s) => (
                  <tr key={s.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium">{s.name}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-xs bg-muted rounded px-2 py-0.5 capitalize">
                        {s.category?.replace(/_/g, " ") ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatPrice(s.basePrice, s.currency, s.billingCycle)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell max-w-xs truncate">
                      {s.description ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                        s.isActive
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-slate-50 text-slate-500 border-slate-200"
                      }`}>
                        {s.isActive ? "Active" : "Inactive"}
                      </span>
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
