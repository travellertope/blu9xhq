"use client";

import { withPermission } from "@/components/shared/PermissionGuard";
import { usePermissions } from "@/hooks/usePermissions";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { RoleBadge } from "@/components/admin/RoleBadge";
import { ROLES, ROLE_LABELS, type Role } from "@/lib/permissions";
import { toast } from "sonner";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface TeamMember {
  id: number;
  name: string;
  email: string;
  bluuhq_role: Role;
  bluuhq_status: "active" | "deactivated";
  bluuhq_assigned_clients: number[];
  bluuhq_last_active: string | null;
}

interface AuditEntry {
  id: number;
  date: string;
  action: string;
  detail: string;
  actorWpUserId: number;
  clientId: number | null;
}

// ─── Invite Modal ──────────────────────────────────────────────────────────────

function InviteModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "viewer" as Role,
  });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, assignedClients: [] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to invite");
      toast.success(`Invite sent to ${form.email}`);
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-semibold mb-4">Invite Team Member</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={form.firstName}
                onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={form.lastName}
                onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={form.role}
              onChange={e => setForm(f => ({ ...f, role: e.target.value as Role }))}
            >
              {Object.entries(ROLE_LABELS)
                .filter(([r]) => r !== ROLES.SUPER_ADMIN)
                .map(([r, label]) => (
                  <option key={r} value={r}>{label}</option>
                ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? "Sending…" : "Send Invite"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Assign Clients Modal ──────────────────────────────────────────────────────

interface Client {
  id: number;
  title: { rendered: string };
  acf: { company_name?: string };
}

function AssignClientsModal({
  member,
  onClose,
  onSuccess,
}: {
  member: TeamMember;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { update }                  = useSession();
  const [clients, setClients]       = useState<Client[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [selected, setSelected]     = useState<Set<number>>(new Set(member.bluuhq_assigned_clients));
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/admin/clients?per_page=100&orderby=title&order=asc")
      .then(r => r.json())
      .then(d => setClients(d.clients ?? []))
      .catch(() => toast.error("Failed to load clients"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = clients.filter(c => {
    const name    = c.title.rendered.toLowerCase();
    const company = (c.acf.company_name ?? "").toLowerCase();
    const q       = search.toLowerCase();
    return name.includes(q) || company.includes(q);
  });

  function toggle(id: number) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleSave() {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/team/${member.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedClients: Array.from(selected) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save");
      toast.success(`Clients updated for ${member.name}`);
      // Refresh the team member's session so their assignedClients updates immediately
      await update({ refreshAssignedClients: true }).catch(() => {});
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 flex flex-col max-h-[80vh]">
        <h2 className="text-lg font-semibold mb-1">Assign Clients</h2>
        <p className="text-sm text-gray-500 mb-4">{member.name}</p>

        <input
          type="text"
          placeholder="Search clients…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full border rounded-md px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <div className="flex-1 overflow-y-auto border rounded-md divide-y min-h-0">
          {loading ? (
            <p className="text-sm text-gray-400 text-center py-6">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No clients found</p>
          ) : (
            filtered.map(c => (
              <label
                key={c.id}
                className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selected.has(c.id)}
                  onChange={() => toggle(c.id)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">{c.title.rendered}</p>
                  {c.acf.company_name && (
                    <p className="text-xs text-gray-500">{c.acf.company_name}</p>
                  )}
                </div>
              </label>
            ))
          )}
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t">
          <span className="text-xs text-gray-400">{selected.size} client{selected.size !== 1 ? "s" : ""} selected</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={submitting}
              className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Role Modal ───────────────────────────────────────────────────────────

function EditRoleModal({
  member,
  onClose,
  onSuccess,
}: {
  member: TeamMember;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [role, setRole] = useState<Role>(member.bluuhq_role);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/team/${member.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to update");
      toast.success(`Role updated for ${member.name}`);
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6">
        <h2 className="text-lg font-semibold mb-1">Edit Role</h2>
        <p className="text-sm text-gray-500 mb-4">{member.name}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={role}
              onChange={e => setRole(e.target.value as Role)}
            >
              {Object.entries(ROLE_LABELS)
                .filter(([r]) => r !== ROLES.SUPER_ADMIN)
                .map(([r, label]) => (
                  <option key={r} value={r}>{label}</option>
                ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Active Members Tab ────────────────────────────────────────────────────────

function ActiveMembersTab({
  members,
  onRefresh,
}: {
  members: TeamMember[];
  onRefresh: () => void;
}) {
  const { isSuper } = usePermissions();
  const [showInvite, setShowInvite] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [assigningMember, setAssigningMember] = useState<TeamMember | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const active = members.filter(m => m.bluuhq_status === "active");

  async function handleDeactivate(member: TeamMember) {
    if (!confirm(`Deactivate ${member.name}? They will lose portal access immediately.`)) return;
    setActionLoading(member.id);
    try {
      const res = await fetch(`/api/admin/team/${member.id}/deactivate`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to deactivate");
      toast.success(`${member.name} deactivated`);
      onRefresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setActionLoading(null);
    }
  }

  function formatLastActive(iso: string | null) {
    if (!iso) return "Never";
    return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">{active.length} active member{active.length !== 1 ? "s" : ""}</p>
        {isSuper && (
          <button
            onClick={() => setShowInvite(true)}
            className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700"
          >
            + Invite Team Member
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="pb-3 font-medium">Name</th>
              <th className="pb-3 font-medium">Email</th>
              <th className="pb-3 font-medium">Role</th>
              <th className="pb-3 font-medium">Clients</th>
              <th className="pb-3 font-medium">Last Active</th>
              {isSuper && <th className="pb-3 font-medium">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y">
            {active.map(member => (
              <tr key={member.id} className="hover:bg-gray-50">
                <td className="py-3 font-medium text-gray-900">{member.name}</td>
                <td className="py-3 text-gray-600">{member.email}</td>
                <td className="py-3">
                  <RoleBadge role={member.bluuhq_role} />
                </td>
                <td className="py-3 text-gray-600">
                  {member.bluuhq_role === ROLES.ACCOUNT_MANAGER
                    ? `${member.bluuhq_assigned_clients.length} assigned`
                    : "—"}
                </td>
                <td className="py-3 text-gray-600">{formatLastActive(member.bluuhq_last_active)}</td>
                {isSuper && (
                  <td className="py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingMember(member)}
                        className="text-indigo-600 hover:text-indigo-800 text-xs font-medium"
                      >
                        Edit Role
                      </button>
                      {member.bluuhq_role === ROLES.ACCOUNT_MANAGER && (
                        <button
                          onClick={() => setAssigningMember(member)}
                          className="text-indigo-600 hover:text-indigo-800 text-xs font-medium"
                        >
                          Assign Clients
                        </button>
                      )}
                      <button
                        onClick={() => handleDeactivate(member)}
                        disabled={actionLoading === member.id}
                        className="text-red-600 hover:text-red-800 text-xs font-medium disabled:opacity-40"
                      >
                        {actionLoading === member.id ? "…" : "Deactivate"}
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
            {active.length === 0 && (
              <tr>
                <td colSpan={isSuper ? 6 : 5} className="py-8 text-center text-gray-400">
                  No active members
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showInvite && <InviteModal onClose={() => setShowInvite(false)} onSuccess={onRefresh} />}
      {editingMember && (
        <EditRoleModal
          member={editingMember}
          onClose={() => setEditingMember(null)}
          onSuccess={onRefresh}
        />
      )}
      {assigningMember && (
        <AssignClientsModal
          member={assigningMember}
          onClose={() => setAssigningMember(null)}
          onSuccess={onRefresh}
        />
      )}
    </>
  );
}

// ─── Deactivated Tab ──────────────────────────────────────────────────────────

function DeactivatedTab({ members, onRefresh }: { members: TeamMember[]; onRefresh: () => void }) {
  const { isSuper } = usePermissions();
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const deactivated = members.filter(m => m.bluuhq_status === "deactivated");

  async function handleReactivate(member: TeamMember) {
    setActionLoading(member.id);
    try {
      const res = await fetch(`/api/admin/team/${member.id}/reactivate`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to reactivate");
      toast.success(`${member.name} reactivated`);
      onRefresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-gray-500">
            <th className="pb-3 font-medium">Name</th>
            <th className="pb-3 font-medium">Email</th>
            <th className="pb-3 font-medium">Role</th>
            {isSuper && <th className="pb-3 font-medium">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y">
          {deactivated.map(member => (
            <tr key={member.id} className="hover:bg-gray-50 opacity-70">
              <td className="py-3 font-medium text-gray-700">{member.name}</td>
              <td className="py-3 text-gray-500">{member.email}</td>
              <td className="py-3">
                <RoleBadge role={member.bluuhq_role} />
              </td>
              {isSuper && (
                <td className="py-3">
                  <button
                    onClick={() => handleReactivate(member)}
                    disabled={actionLoading === member.id}
                    className="text-green-600 hover:text-green-800 text-xs font-medium disabled:opacity-40"
                  >
                    {actionLoading === member.id ? "…" : "Reactivate"}
                  </button>
                </td>
              )}
            </tr>
          ))}
          {deactivated.length === 0 && (
            <tr>
              <td colSpan={isSuper ? 4 : 3} className="py-8 text-center text-gray-400">
                No deactivated members
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// ─── Audit Log Tab ─────────────────────────────────────────────────────────────

function AuditLogTab() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/audit-log?page=${p}&perPage=25`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setEntries(data.entries);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(page); }, [load, page]);

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString("en-GB", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  }

  return (
    <div>
      {loading ? (
        <div className="py-12 text-center text-gray-400 text-sm">Loading…</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Action</th>
                  <th className="pb-3 font-medium">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {entries.map(entry => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="py-3 text-gray-500 whitespace-nowrap">{formatDate(entry.date)}</td>
                    <td className="py-3 font-mono text-xs text-indigo-700 bg-indigo-50 rounded px-2 whitespace-nowrap">
                      {entry.action}
                    </td>
                    <td className="py-3 text-gray-700">{entry.detail}</td>
                  </tr>
                ))}
                {entries.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-gray-400">No audit entries yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-50"
              >
                Previous
              </button>
              <span>Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

type Tab = "active" | "deactivated" | "audit";

function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("active");

  const loadMembers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/team");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMembers(data.members ?? []);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadMembers(); }, [loadMembers]);

  const tabs: { id: Tab; label: string }[] = [
    { id: "active", label: "Active Members" },
    { id: "deactivated", label: "Deactivated" },
    { id: "audit", label: "Audit Log" },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Team</h1>
        <p className="text-sm text-gray-500 mt-1">Manage team members, roles, and access</p>
      </div>

      <div className="border-b mb-6">
        <nav className="flex gap-6">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t.id
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="bg-white rounded-lg border p-6">
        {loading ? (
          <div className="py-12 text-center text-gray-400 text-sm">Loading team…</div>
        ) : (
          <>
            {tab === "active" && <ActiveMembersTab members={members} onRefresh={loadMembers} />}
            {tab === "deactivated" && <DeactivatedTab members={members} onRefresh={loadMembers} />}
            {tab === "audit" && <AuditLogTab />}
          </>
        )}
      </div>
    </div>
  );
}

export default withPermission("manage_team")(TeamPage);
