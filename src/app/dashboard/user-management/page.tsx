"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  UserCog,
  Search,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Shield,
  Users,
  Layers,
  X,
  Check,
} from "lucide-react";
import {
  MOCK_USERS,
  MOCK_QUEUES,
  MOCK_ROLES,
  MODULES,
  STATUS_STYLES,
  type User,
  type Queue,
  type Role,
  type RoleStatus,
} from "@/features/rbac/mock-data";
import { addLocalItem, getLocalItems } from "@/lib/local-store";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "users" | "queue" | "roles";

// ─── Helpers ──────────────────────────────────────────────────────────────────

type SortDir = "asc" | "desc";

function SortIcon<T extends string>({ field, sortField, sortDir }: { field: T; sortField: T; sortDir: SortDir }) {
  if (field !== sortField) return <ChevronsUpDown className="size-3.5 text-zinc-400" />;
  return sortDir === "asc"
    ? <ChevronUp className="size-3.5 text-primary" />
    : <ChevronDown className="size-3.5 text-primary" />;
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

function UsersTab() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<"userId" | "username" | "email" | "phone" | "status">("userId");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [users, setUsers] = useState<User[]>([...MOCK_USERS]);

  useEffect(() => {
    const local = getLocalItems<User>("users");
    if (local.length > 0) setUsers([...local, ...MOCK_USERS]);
  }, []);

  const handleSort = (f: typeof sortField) => {
    if (f === sortField) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(f); setSortDir("asc"); }
  };

  const rows = users
    .filter((u) => {
      const q = search.toLowerCase();
      return u.userId.toLowerCase().includes(q) || u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) || u.phone.includes(q) || u.status.includes(q);
    })
    .sort((a, b) => {
      const cmp = a[sortField].localeCompare(b[sortField]);
      return sortDir === "asc" ? cmp : -cmp;
    });

  const th = "px-4 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide select-none cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors";

  return (
    <>
      <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
          <input type="text" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
        </div>
        <span className="text-xs text-zinc-400 ml-auto">{rows.length} user{rows.length !== 1 ? "s" : ""}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
            <tr>
              <th className={th} onClick={() => handleSort("userId")}><div className="flex items-center gap-1.5">User ID <SortIcon field="userId" sortField={sortField} sortDir={sortDir} /></div></th>
              <th className={th} onClick={() => handleSort("username")}><div className="flex items-center gap-1.5">Username <SortIcon field="username" sortField={sortField} sortDir={sortDir} /></div></th>
              <th className={th} onClick={() => handleSort("email")}><div className="flex items-center gap-1.5">Email <SortIcon field="email" sortField={sortField} sortDir={sortDir} /></div></th>
              <th className={th} onClick={() => handleSort("phone")}><div className="flex items-center gap-1.5">Phone Number <SortIcon field="phone" sortField={sortField} sortDir={sortDir} /></div></th>
              <th className={th} onClick={() => handleSort("status")}><div className="flex items-center gap-1.5">Status <SortIcon field="status" sortField={sortField} sortDir={sortDir} /></div></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {rows.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-zinc-400">No users found.</td></tr>
            ) : rows.map((u) => (
              <tr key={u.id} onClick={() => router.push(`/dashboard/user-management/users/${u.id}`)} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer">
                <td className="px-4 py-3.5"><span className="font-mono text-sm font-semibold text-primary">{u.userId}</span></td>
                <td className="px-4 py-3.5"><span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{u.username}</span></td>
                <td className="px-4 py-3.5"><span className="text-sm text-zinc-600 dark:text-zinc-400">{u.email}</span></td>
                <td className="px-4 py-3.5"><span className="text-sm text-zinc-600 dark:text-zinc-400 font-mono">{u.phone}</span></td>
                <td className="px-4 py-3.5">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold capitalize ${STATUS_STYLES[u.status]}`}>{u.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 border-t border-zinc-100 dark:border-zinc-800">
        <span className="text-xs text-zinc-400">Showing {rows.length} of {users.length} users</span>
      </div>
    </>
  );
}

function QueueTab() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<"queueId" | "name" | "status">("queueId");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [queues, setQueues] = useState<Queue[]>([...MOCK_QUEUES]);

  useEffect(() => {
    const local = getLocalItems<Queue>("queues");
    if (local.length > 0) setQueues([...local, ...MOCK_QUEUES]);
  }, []);

  const userMap = Object.fromEntries(MOCK_USERS.map((u) => [u.userId, u.username]));

  const handleSort = (f: typeof sortField) => {
    if (f === sortField) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(f); setSortDir("asc"); }
  };

  const rows = queues
    .filter((q) => {
      const s = search.toLowerCase();
      return q.queueId.toLowerCase().includes(s) || q.name.toLowerCase().includes(s) || q.status.includes(s);
    })
    .sort((a, b) => {
      const cmp = a[sortField].localeCompare(b[sortField]);
      return sortDir === "asc" ? cmp : -cmp;
    });

  const th = "px-4 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide select-none cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors";

  return (
    <>
      <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
          <input type="text" placeholder="Search queues..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
        </div>
        <span className="text-xs text-zinc-400 ml-auto">{rows.length} queue{rows.length !== 1 ? "s" : ""}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
            <tr>
              <th className={th} onClick={() => handleSort("queueId")}><div className="flex items-center gap-1.5">Queue ID <SortIcon field="queueId" sortField={sortField} sortDir={sortDir} /></div></th>
              <th className={th} onClick={() => handleSort("name")}><div className="flex items-center gap-1.5">Queue Name <SortIcon field="name" sortField={sortField} sortDir={sortDir} /></div></th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Members</th>
              <th className={th} onClick={() => handleSort("status")}><div className="flex items-center gap-1.5">Status <SortIcon field="status" sortField={sortField} sortDir={sortDir} /></div></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {rows.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-12 text-center text-sm text-zinc-400">No queues found.</td></tr>
            ) : rows.map((q) => (
              <tr key={q.id} onClick={() => router.push(`/dashboard/user-management/queue/${q.id}`)} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer">
                <td className="px-4 py-3.5"><span className="font-mono text-sm font-semibold text-primary">{q.queueId}</span></td>
                <td className="px-4 py-3.5"><span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{q.name}</span></td>
                <td className="px-4 py-3.5">
                  <div className="flex flex-wrap gap-1">
                    {q.members.map((uid) => (
                      <span key={uid} className="inline-flex items-center px-2 py-0.5 rounded-lg bg-primary/10 text-primary text-xs font-medium">
                        {userMap[uid] ?? uid}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold capitalize ${STATUS_STYLES[q.status]}`}>{q.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 border-t border-zinc-100 dark:border-zinc-800">
        <span className="text-xs text-zinc-400">Showing {rows.length} of {queues.length} queues</span>
      </div>
    </>
  );
}

function RolesTab({ onAddRole }: { onAddRole: () => void }) {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<"roleId" | "name" | "status">("roleId");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [modalRole, setModalRole] = useState<Role | null>(null);
  const [roles, setRoles] = useState<Role[]>([...MOCK_ROLES]);

  useEffect(() => {
    const local = getLocalItems<Role>("roles");
    if (local.length > 0) setRoles([...local, ...MOCK_ROLES]);
  }, []);

  const handleSort = (f: typeof sortField) => {
    if (f === sortField) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(f); setSortDir("asc"); }
  };

  const rows = roles
    .filter((r) => {
      const s = search.toLowerCase();
      return r.roleId.toLowerCase().includes(s) || r.name.toLowerCase().includes(s) || r.status.includes(s);
    })
    .sort((a, b) => {
      const cmp = a[sortField].localeCompare(b[sortField]);
      return sortDir === "asc" ? cmp : -cmp;
    });

  const th = "px-4 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide select-none cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors";
  const activeCount = (r: Role) => Object.values(r.permissions).filter(Boolean).length;

  return (
    <>
      <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
          <input type="text" placeholder="Search roles..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
        </div>
        <span className="text-xs text-zinc-400 ml-auto">{rows.length} role{rows.length !== 1 ? "s" : ""}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
            <tr>
              <th className={th} onClick={() => handleSort("roleId")}><div className="flex items-center gap-1.5">Role ID <SortIcon field="roleId" sortField={sortField} sortDir={sortDir} /></div></th>
              <th className={th} onClick={() => handleSort("name")}><div className="flex items-center gap-1.5">Role Name <SortIcon field="name" sortField={sortField} sortDir={sortDir} /></div></th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Permissions</th>
              <th className={th} onClick={() => handleSort("status")}><div className="flex items-center gap-1.5">Status <SortIcon field="status" sortField={sortField} sortDir={sortDir} /></div></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {rows.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-12 text-center text-sm text-zinc-400">No roles found.</td></tr>
            ) : rows.map((r) => (
              <tr key={r.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                <td className="px-4 py-3.5"><span className="font-mono text-sm font-semibold text-primary">{r.roleId}</span></td>
                <td className="px-4 py-3.5"><span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{r.name}</span></td>
                <td className="px-4 py-3.5">
                  <button
                    onClick={() => setModalRole(r)}
                    className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:border-primary hover:text-primary transition-colors"
                  >
                    <Shield className="size-3" />
                    {activeCount(r)}/{MODULES.length} modules
                  </button>
                </td>
                <td className="px-4 py-3.5">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold capitalize ${STATUS_STYLES[r.status]}`}>{r.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 border-t border-zinc-100 dark:border-zinc-800">
        <span className="text-xs text-zinc-400">Showing {rows.length} of {roles.length} roles</span>
      </div>

      {/* Permission Modal */}
      {modalRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModalRole(null)} />

          {/* Modal */}
          <div className="relative w-full max-w-sm bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <p className="text-xs font-mono text-zinc-400">{modalRole.roleId}</p>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">{modalRole.name}</h3>
              </div>
              <button onClick={() => setModalRole(null)} className="cursor-pointer size-8 flex items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-500">
                <X className="size-4" />
              </button>
            </div>

            {/* Permission list */}
            <div className="px-5 py-4 space-y-2">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">Module Access</p>
              {MODULES.map((mod) => {
                const allowed = modalRole.permissions[mod] ?? false;
                return (
                  <div key={mod} className="flex items-center justify-between py-2 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">{mod}</span>
                    <span className={`size-6 flex items-center justify-center rounded-lg ${allowed ? "bg-emerald-500/15 text-emerald-500" : "bg-zinc-200 dark:bg-zinc-700 text-zinc-400"}`}>
                      {allowed ? <Check className="size-3.5 stroke-[2.5]" /> : <X className="size-3.5" />}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="px-5 pb-4">
              <button onClick={() => setModalRole(null)} className="cursor-pointer w-full py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Add Role Modal ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

function AddRoleModal({ onClose }: { onClose: () => void }) {
  const [roleName, setRoleName] = useState("");
  const [roleStatus, setRoleStatus] = useState<RoleStatus>("active");
  const [permissions, setPermissions] = useState<Record<string, boolean>>(
    Object.fromEntries(MODULES.map((m) => [m, false]))
  );
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const togglePerm = (mod: string) =>
    setPermissions((prev) => ({ ...prev, [mod]: !prev[mod] }));

  const handleSave = () => {
    if (!roleName.trim()) { setError("Role name is required"); return; }
    const existingRoles = [...getLocalItems<Role>("roles"), ...MOCK_ROLES];
    const nextNum = existingRoles.length + 1;
    const newRole: Role = {
      id: `new-${Date.now()}`,
      roleId: `ROL${String(nextNum).padStart(3, "0")}`,
      name: roleName.trim(),
      permissions,
      status: roleStatus,
    };
    addLocalItem("roles", newRole);
    setSaved(true);
    setTimeout(onClose, 800);
  };

  const inputCls = "w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 w-full max-w-md shadow-xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex-shrink-0">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">New Role</h3>
          <button onClick={onClose} className="cursor-pointer size-7 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors">
            <X className="size-4 text-zinc-400" />
          </button>
        </div>
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-500">Role Name <span className="text-red-500">*</span></label>
            <input value={roleName} onChange={(e) => { setRoleName(e.target.value); setError(""); }} placeholder="e.g. Support Agent" className={inputCls + (error ? " border-red-400" : "")} />
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-500">Status</label>
            <div className="flex gap-2">
              {(["active", "inactive"] as RoleStatus[]).map((s) => (
                <button key={s} type="button" onClick={() => setRoleStatus(s)}
                  className={`cursor-pointer flex-1 py-2 rounded-xl text-sm font-medium border transition-all capitalize ${
                    roleStatus === s ? "border-primary bg-primary/10 text-primary" : "border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  }`}>{s}</button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-500">Module Permissions</label>
            {MODULES.map((mod) => (
              <div key={mod} className="flex items-center justify-between py-2 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                <span className="text-sm text-zinc-700 dark:text-zinc-300">{mod}</span>
                <button type="button" onClick={() => togglePerm(mod)}
                  className={`cursor-pointer size-6 flex items-center justify-center rounded-lg transition-colors ${
                    permissions[mod] ? "bg-emerald-500/15 text-emerald-500" : "bg-zinc-200 dark:bg-zinc-700 text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-600"
                  }`}>
                  {permissions[mod] ? <Check className="size-3.5 stroke-[2.5]" /> : <X className="size-3.5" />}
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 px-5 pb-5 flex-shrink-0">
          <button onClick={handleSave} disabled={saved}
            className="cursor-pointer flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60">
            {saved ? <Check className="size-4" /> : <Shield className="size-4" />}
            {saved ? "Saved!" : "Save Role"}
          </button>
          <button onClick={onClose}
            className="cursor-pointer px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "users", label: "Users", icon: Users },
  { id: "queue", label: "Queue", icon: Layers },
  { id: "roles", label: "Roles", icon: Shield },
];

export default function UserManagementPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("users");
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);

  const handleAdd = () => {
    if (activeTab === "users") router.push("/dashboard/user-management/users/new");
    else if (activeTab === "queue") router.push("/dashboard/user-management/queue/new");
    else setShowAddRoleModal(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <UserCog className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">User Management</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage users, queues, and role permissions</p>
          </div>
        </div>
        <button onClick={handleAdd} className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors">
          <span className="text-lg leading-none">+</span>
          {activeTab === "users" ? "Add User" : activeTab === "queue" ? "Add Queue" : "Add Role"}
        </button>
      </div>

      {/* Tabs + Table Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {/* Tab bar */}
        <div className="flex border-b border-zinc-100 dark:border-zinc-800 px-4 pt-3 gap-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-t-xl text-sm font-medium transition-all border-b-2 -mb-px ${
                activeTab === id
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              }`}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "users" && <UsersTab />}
        {activeTab === "queue" && <QueueTab />}
        {activeTab === "roles" && <RolesTab onAddRole={() => setShowAddRoleModal(true)} />}
      </div>

      {showAddRoleModal && <AddRoleModal onClose={() => setShowAddRoleModal(false)} />}
    </div>
  );
}
