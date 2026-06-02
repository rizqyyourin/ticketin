"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  UserCog,
  User,
  Mail,
  Phone,
  Shield,
  Layers,
  Check,
  X,
  Pencil,
  Power,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { DetailShell } from "@/components/layouts/page-shell";
import { toast } from "sonner";
import { PhoneInput } from "@/components/ui/phone-input";

// ─── Types ────────────────────────────────────────────────────────────────────

type ApiRole = { id: string; name: string; roleId: string };

type ApiUser = {
  id: string;
  userId: string;
  username: string;
  email: string;
  phone: string | null;
  status: "active" | "inactive";
  role: ApiRole | null;
  queueMemberships: { queue: { id: string; queueId: string; name: string; status: string } }[];
};

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
  inactive: "bg-zinc-500/10 text-zinc-400 border border-zinc-400/20",
};

const inputCls = "w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all";

// ─── New User Form ────────────────────────────────────────────────────────────

function NewUserForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [roles, setRoles] = useState<ApiRole[]>([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/roles").then((r) => r.json()).then(setRoles).catch(() => {});
  }, []);

  const handleSave = async () => {
    const e: Record<string, string> = {};
    if (!username.trim()) e.username = "Username is required";
    if (!email.trim()) e.email = "Email is required";
    if (!password.trim()) e.password = "Password is required";
    if (password.length > 0 && password.length < 8) e.password = "Minimum 8 characters";
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    setSaving(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), email: email.trim(), phone: phone || null, password, status, roleId: roleId || null }),
      });
      if (!res.ok) {
        const data = await res.json();
        const msg = data.error ?? "Failed to create user";
        setErrors({ email: msg });
        toast.error(msg);
        setSaving(false);
        return;
      }
      toast.success("User created");
      router.push("/user-management");
    } catch {
      setErrors({ email: "Network error" });
      toast.error("Network error");
      setSaving(false);
    }
  };

  return (
    <DetailShell>
      <Breadcrumb items={[
        { label: "User Management", href: "/user-management" },
        { label: "New User" },
      ]} />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <UserCog className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">New User</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Add a new system user</p>
          </div>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60">
          {saving ? <Loader2 className="size-4 animate-spin" /> : <User className="size-4" />}
          {saving ? "Saving…" : "Save User"}
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-5">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-500">Username <span className="text-red-500">*</span></label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. john.doe" className={inputCls + (errors.username ? " border-red-400" : "")} />
          {errors.username && <p className="text-xs text-red-500">{errors.username}</p>}
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-500">Email <span className="text-red-500">*</span></label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@company.com" className={inputCls + (errors.email ? " border-red-400" : "")} />
          {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-500">Password <span className="text-red-500">*</span></label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimum 8 characters" className={inputCls + (errors.password ? " border-red-400" : "")} />
          {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-500">Phone</label>
          <PhoneInput value={phone} onChange={setPhone} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-500">Role</label>
          <div className="relative">
            <select value={roleId} onChange={(e) => setRoleId(e.target.value)}
              className="w-full appearance-none px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all pr-8">
              <option value="">No Role</option>
              {roles.filter((r) => (r as ApiRole & { status?: string }).status !== "inactive").map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
            <Shield className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400 pointer-events-none" />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-500">Status</label>
          <div className="flex gap-2">
            {(["active", "inactive"] as const).map((s) => (
              <button key={s} type="button" onClick={() => setStatus(s)}
                className={`cursor-pointer flex-1 py-2 rounded-xl text-sm font-medium border transition-all capitalize ${status === s ? "border-primary bg-primary/10 text-primary" : "border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800"}`}>{s}</button>
            ))}
          </div>
        </div>
      </div>
    </DetailShell>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 size-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-zinc-400 mb-0.5">{label}</p>
        <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{value}</div>
      </div>
    </div>
  );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────

function EditModal({ user, roles, onClose, onSaved }: {
  user: ApiUser;
  roles: ApiRole[];
  onClose: () => void;
  onSaved: (updated: ApiUser) => void;
}) {
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState<string | null>(user.phone ?? null);
  const [roleId, setRoleId] = useState(user.role?.id ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, phone: phone || null, roleId: roleId || null }),
      });
      if (!res.ok) {
        const data = await res.json();
        const msg = data.error ?? "Failed to save";
        setError(msg);
        toast.error(msg);
        setSaving(false);
        return;
      }
      const updated = await res.json();
      // Re-fetch full user to get nested role info
      const fullRes = await fetch(`/api/users/${user.id}`);
      toast.success("User updated");
      onSaved(fullRes.ok ? await fullRes.json() : { ...user, ...updated });
    } catch {
      setError("Network error");
      toast.error("Network error");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Edit User</h3>
          <button onClick={onClose} className="cursor-pointer size-7 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors">
            <X className="size-4 text-zinc-400" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          {error && <p className="text-xs text-red-500 bg-red-50 dark:bg-red-500/10 px-3 py-2 rounded-xl">{error}</p>}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-500">Username</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} className={inputCls} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-500">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-500">Phone</label>
            <PhoneInput value={phone} onChange={setPhone} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-500">Role</label>
            <div className="relative">
              <select value={roleId} onChange={(e) => setRoleId(e.target.value)}
                className="w-full appearance-none px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all pr-8">
                <option value="">No Role</option>
                {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
              <Shield className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400 pointer-events-none" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 px-5 pb-5">
          <button onClick={handleSave} disabled={saving}
            className="cursor-pointer flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60">
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
            {saving ? "Saving…" : "Save Changes"}
          </button>
          <button onClick={onClose} className="cursor-pointer px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UserDetailPage() {
  const params = useParams();
  const rawId = params?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  if (id === "new") return <NewUserForm />;

  const [user, setUser] = useState<ApiUser | null>(null);
  const [roles, setRoles] = useState<ApiRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/users/${id}`).then((r) => r.json()),
      fetch("/api/roles").then((r) => r.json()),
    ])
      .then(([userData, rolesData]) => {
        setUser(userData?.error ? null : userData);
        setRoles(rolesData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleToggleStatus = async () => {
    if (!user) return;
    const newStatus = user.status === "active" ? "inactive" : "active";
    setToggling(true);
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) setUser((prev) => prev ? { ...prev, status: newStatus } : prev);
      if (res.ok) toast.success(`User ${newStatus === "active" ? "activated" : "deactivated"}`);
      else toast.error("Failed to update status");
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="size-8 animate-spin text-zinc-300" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <UserCog className="size-12 text-zinc-300" />
        <p className="text-zinc-500 text-sm">User not found.</p>
        <Link href="/user-management" className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors">
          Back to User Management
        </Link>
      </div>
    );
  }

  const isActive = user.status === "active";

  return (
    <>
      <DetailShell>
        <Breadcrumb items={[
          { label: "User Management", href: "/user-management" },
          { label: user.username },
        ]} />

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-lg font-bold text-primary uppercase">
              {user.username.charAt(0)}
            </div>
            <div>
              <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{user.username}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono text-xs text-zinc-400">{user.userId}</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold capitalize ${STATUS_STYLES[user.status]}`}>{user.status}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => setShowEdit(true)} className="cursor-pointer flex items-center gap-2 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
              <Pencil className="size-4" />Edit
            </button>
            <button onClick={handleToggleStatus} disabled={toggling}
              className={`cursor-pointer flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-colors disabled:opacity-60 ${
                isActive ? "border-red-200 dark:border-red-800/40 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10" : "border-emerald-200 dark:border-emerald-800/40 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
              }`}>
              {toggling ? <Loader2 className="size-4 animate-spin" /> : <Power className="size-4" />}
              {isActive ? "Deactivate" : "Activate"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Info */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-4">
              <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                <User className="size-4 text-zinc-400" />User Info
              </h2>
              <InfoRow icon={<User className="size-4 text-zinc-400" />} label="Username" value={user.username} />
              <InfoRow icon={<Mail className="size-4 text-zinc-400" />} label="Email" value={<a href={`mailto:${user.email}`} className="text-primary hover:underline">{user.email}</a>} />
              <InfoRow icon={<Phone className="size-4 text-zinc-400" />} label="Phone" value={<span className="font-mono">{user.phone ?? "—"}</span>} />
              <InfoRow icon={<Shield className="size-4 text-zinc-400" />} label="Role" value={
                user.role
                  ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-primary/10 text-primary text-xs font-medium"><Shield className="size-3" />{user.role.name}</span>
                  : <span className="text-zinc-400 text-xs">No role assigned</span>
              } />
            </div>
          </div>

          {/* Queues */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
                <Layers className="size-4 text-zinc-400" />
                <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  Assigned Queues
                  {user.queueMemberships.length > 0 && <span className="ml-2 text-xs font-normal text-zinc-400">({user.queueMemberships.length})</span>}
                </h2>
              </div>
              {user.queueMemberships.length === 0 ? (
                <div className="p-6 text-center">
                  <Layers className="size-7 text-zinc-300 mx-auto mb-2" />
                  <p className="text-sm text-zinc-400">Not assigned to any queue.</p>
                </div>
              ) : (
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {user.queueMemberships.map(({ queue: q }) => (
                    <Link key={q.id} href={`/user-management/queue/${q.id}`}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-primary/40 hover:bg-primary/5 transition-all">
                      <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Layers className="size-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">{q.name}</p>
                        <p className="text-xs text-zinc-400 font-mono">{q.queueId}</p>
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold capitalize ${STATUS_STYLES[q.status]}`}>{q.status}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </DetailShell>

      {showEdit && (
        <EditModal
          user={user}
          roles={roles}
          onClose={() => setShowEdit(false)}
          onSaved={(updated) => { setUser(updated); setShowEdit(false); }}
        />
      )}
    </>
  );
}
