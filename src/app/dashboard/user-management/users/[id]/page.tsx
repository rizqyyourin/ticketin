"use client";

import { useState } from "react";
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
  AlertTriangle,
  Pencil,
  Power,
} from "lucide-react";
import Link from "next/link";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import {
  MOCK_USERS,
  MOCK_QUEUES,
  MOCK_ROLES,
  STATUS_STYLES,
  type User as UserType,
  type UserStatus,
} from "@/features/rbac/mock-data";
import { addLocalItem, getLocalItems } from "@/lib/local-store";

// ─── New User Form ──────────────────────────────────────────────────────────────────

function NewUserForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<UserStatus>("active");
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const inputCls = "w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all";

  const handleSave = () => {
    const e: Record<string, string> = {};
    if (!username.trim()) e.username = "Username is required";
    if (!email.trim()) e.email = "Email is required";
    if (!phone.trim()) e.phone = "Phone is required";
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    const existingUsers = [...getLocalItems<UserType>("users"), ...MOCK_USERS];
    const nextNum = existingUsers.length + 1;
    const newUser: UserType = {
      id: `new-${Date.now()}`,
      userId: `USR${String(nextNum).padStart(3, "0")}`,
      username: username.trim(),
      email: email.trim(),
      phone: phone.trim(),
      status,
    };
    addLocalItem("users", newUser);
    setSaved(true);
    setTimeout(() => router.push("/dashboard/user-management"), 800);
  };

  return (
    <div className="p-6 space-y-5 max-w-2xl mx-auto">
      <Breadcrumb items={[
        { label: "User Management", href: "/dashboard/user-management" },
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
        <button
          onClick={handleSave}
          disabled={saved}
          className="cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
        >
          {saved ? <Check className="size-4" /> : <User className="size-4" />}
          {saved ? "Saved!" : "Save User"}
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
          <label className="text-xs font-medium text-zinc-500">Phone <span className="text-red-500">*</span></label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+62 8xx-xxxx-xxxx" className={inputCls + (errors.phone ? " border-red-400" : "")} />
          {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-500">Status</label>
          <div className="relative">
            <select value={status} onChange={(e) => setStatus(e.target.value as UserStatus)}
              className="w-full appearance-none px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all pr-8">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <Power className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 size-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-zinc-400 mb-0.5">{label}</p>
        <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{value}</div>
      </div>
    </div>
  );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────

function EditModal({
  user,
  onClose,
  onSave,
}: {
  user: UserType;
  onClose: () => void;
  onSave: (updated: Partial<UserType>) => void;
}) {
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);

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
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-500">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-500">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-500">Phone</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>
        </div>
        <div className="flex items-center gap-2 px-5 pb-5">
          <button
            onClick={() => onSave({ username, email, phone })}
            className="cursor-pointer flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            <Check className="size-4" />
            Save Changes
          </button>
          <button
            onClick={onClose}
            className="cursor-pointer px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = params?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  if (id === "new") return <NewUserForm />;

  const allUsers = [...getLocalItems<UserType>("users"), ...MOCK_USERS];
  const initialUser = allUsers.find((u) => u.id === id);
  const [user, setUser] = useState<UserType | undefined>(initialUser);
  const [showEdit, setShowEdit] = useState(false);

  if (!user) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <UserCog className="size-12 text-zinc-300" />
        <p className="text-zinc-500 text-sm">User not found.</p>
        <Link
          href="/dashboard/user-management"
          className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          Back to User Management
        </Link>
      </div>
    );
  }

  const assignedQueues = MOCK_QUEUES.filter((q) => q.members.includes(user.userId));
  const isActive = user.status === "active";

  const handleToggleStatus = () => {
    setUser((prev) => prev ? { ...prev, status: (prev.status === "active" ? "inactive" : "active") as UserStatus } : prev);
  };

  return (
    <>
      <div className="p-6 space-y-5 max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "User Management", href: "/dashboard/user-management" },
            { label: user.username },
          ]}
        />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-lg font-bold text-primary uppercase">
              {user.username.charAt(0)}
            </div>
            <div>
              <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{user.username}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono text-xs text-zinc-400">{user.userId}</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold capitalize ${STATUS_STYLES[user.status]}`}>
                  {user.status}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setShowEdit(true)}
              className="cursor-pointer flex items-center gap-2 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <Pencil className="size-4" />
              Edit
            </button>
            <button
              onClick={handleToggleStatus}
              className={`cursor-pointer flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-colors ${
                isActive
                  ? "border-red-200 dark:border-red-800/40 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                  : "border-emerald-200 dark:border-emerald-800/40 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
              }`}
            >
              <Power className="size-4" />
              {isActive ? "Deactivate" : "Activate"}
            </button>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: User Info */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-4">
              <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                <User className="size-4 text-zinc-400" />
                User Info
              </h2>
              <InfoRow
                icon={<User className="size-4 text-zinc-400" />}
                label="Username"
                value={user.username}
              />
              <InfoRow
                icon={<Mail className="size-4 text-zinc-400" />}
                label="Email"
                value={<a href={`mailto:${user.email}`} className="text-primary hover:underline">{user.email}</a>}
              />
              <InfoRow
                icon={<Phone className="size-4 text-zinc-400" />}
                label="Phone"
                value={<span className="font-mono">{user.phone}</span>}
              />
            </div>
          </div>

          {/* Right: Queues + Roles */}
          <div className="lg:col-span-2 space-y-6">

            {/* Assigned Queues */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
                <Layers className="size-4 text-zinc-400" />
                <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  Assigned Queues
                  {assignedQueues.length > 0 && (
                    <span className="ml-2 text-xs font-normal text-zinc-400">({assignedQueues.length})</span>
                  )}
                </h2>
              </div>
              {assignedQueues.length === 0 ? (
                <div className="p-6 text-center">
                  <Layers className="size-7 text-zinc-300 mx-auto mb-2" />
                  <p className="text-sm text-zinc-400">Not assigned to any queue.</p>
                </div>
              ) : (
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {assignedQueues.map((q) => (
                    <Link
                      key={q.id}
                      href={`/dashboard/user-management/queue/${q.id}`}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-primary/40 hover:bg-primary/5 transition-all group"
                    >
                      <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Layers className="size-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">{q.name}</p>
                        <p className="text-xs text-zinc-400 font-mono">{q.queueId}</p>
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold capitalize ${STATUS_STYLES[q.status]}`}>
                        {q.status}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Roles Overview */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-3">
              <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                <Shield className="size-4 text-zinc-400" />
                Available Roles
              </h2>
              <div className="flex flex-wrap gap-2">
                {MOCK_ROLES.filter((r) => r.status === "active").map((r) => (
                  <Link
                    key={r.id}
                    href={`/dashboard/user-management?tab=roles`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:border-primary/40 hover:text-primary transition-colors"
                  >
                    <Shield className="size-3" />
                    {r.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showEdit && (
        <EditModal
          user={user}
          onClose={() => setShowEdit(false)}
          onSave={(updated) => {
            setUser((prev) => prev ? { ...prev, ...updated } : prev);
            setShowEdit(false);
          }}
        />
      )}
    </>
  );
}
