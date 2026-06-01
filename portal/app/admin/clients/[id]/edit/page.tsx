import { notFound } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ClientForm } from "@/components/admin/ClientForm";
import { decrypt } from "@/lib/encryption";

export async function generateMetadata({ params }: { params: { id: string } }) {
  return { title: `Edit Client #${params.id}` };
}

function tryDecrypt(value: string): string {
  try { return decrypt(value); } catch { return value; }
}

async function fetchClientForEdit(id: string) {
  const base   = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const cookie = headers().get("cookie") ?? "";
  const res = await fetch(`${base}/api/admin/clients/${id}`, {
    cache:   "no-store",
    headers: { cookie },
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function EditClientPage({ params }: { params: { id: string } }) {
  const data = await fetchClientForEdit(params.id);
  if (!data) notFound();

  const { post } = data;
  const acf = post.acf;

  // Split contact_name into first / last
  const nameParts = (acf.contact_name || post.title.rendered || "").trim().split(/\s+/);
  const firstName = nameParts[0] ?? "";
  const lastName  = nameParts.slice(1).join(" ");

  // Tags come back as a comma-separated string from WP ACF
  const tags: string[] = acf.tags
    ? String(acf.tags).split(",").map((t: string) => t.trim()).filter(Boolean)
    : [];

  // contact_email/phone are already decrypted by the GET route
  const email = acf.contact_email ?? "";
  const phone = acf.contact_phone ?? "";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/admin/clients/${params.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to profile
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Edit Client</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {acf.contact_name || post.title.rendered}
          {acf.company_name ? ` · ${acf.company_name}` : ""}
        </p>
      </div>

      <ClientForm
        clientId={params.id}
        defaultValues={{
          firstName,
          lastName,
          email,
          portalEmail: acf.portal_email ?? "",
          phone,
          company:     acf.company_name    ?? "",
          website:     acf.company_website ?? "",
          industry:    acf.industry        ?? "",
          status:      (acf.status as "active" | "inactive" | "churned" | "onboarding") ?? "active",
          tags,
          notes:       acf.notes ?? "",
        }}
      />
    </div>
  );
}
