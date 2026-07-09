import { Suspense } from "react";
import { headers } from "next/headers";
import { Skeleton } from "@/components/ui/skeleton";
import { ClientTable } from "@/components/admin/ClientTable";
import type { WPClientPost } from "@/lib/wp-api";

export const metadata = { title: "Clients" };

interface SearchParams {
  page?: string;
  search?: string;
  status?: string;
  orderby?: string;
  order?: string;
}

async function fetchClients(searchParams: SearchParams) {
  const params = new URLSearchParams();
  params.set("page", searchParams.page ?? "1");
  if (searchParams.search)  params.set("search",  searchParams.search);
  if (searchParams.status)  params.set("status",  searchParams.status);
  if (searchParams.orderby) params.set("orderby", searchParams.orderby);
  if (searchParams.order)   params.set("order",   searchParams.order);

  const cookie = headers().get("cookie") ?? "";
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/admin/clients?${params.toString()}`,
    { cache: "no-store", headers: { cookie } }
  );

  if (!res.ok) {
    return { clients: [] as WPClientPost[], total: 0, totalPages: 0, page: 1 };
  }
  return res.json() as Promise<{
    clients: WPClientPost[];
    total: number;
    totalPages: number;
    page: number;
  }>;
}

function ClientTableSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <Skeleton className="h-10 flex-1 max-w-md" />
        <Skeleton className="h-10 w-36" />
        <Skeleton className="h-10 w-32 ml-auto" />
      </div>
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  );
}

async function ClientsContent({ searchParams }: { searchParams: SearchParams }) {
  const data = await fetchClients(searchParams);
  return (
    <ClientTable
      clients={data.clients}
      total={data.total}
      totalPages={data.totalPages}
      page={data.page}
    />
  );
}

export default function ClientsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Clients</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage your client accounts and relationships</p>
      </div>

      <Suspense fallback={<ClientTableSkeleton />}>
        <ClientsContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
