import { ClientForm } from "@/components/admin/ClientForm";

export const metadata = { title: "New Client" };

export default function NewClientPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Add Client</h1>
        <p className="text-sm text-slate-500 mt-0.5">Create a new client account and optionally send a portal invite</p>
      </div>
      <ClientForm />
    </div>
  );
}
