"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Layers,
  User,
  Check,
  X,
  Power,
  Pencil,
  Plus,
  Trash2,
  Loader2,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { DetailShell } from "@/components/layouts/page-shell";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

type ApiUserMini = { id: string; userId: string; username: string; email: string; status: string };

type ApiQueue = {
  id: string;
  queueId: string;
  name: string;
  status: "active" | "inactive";
  members: { user: ApiUserMini }[];
};

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
  inactive: "bg-zinc-500/10 text-zinc-400 border border-zinc-400/20",
};

const inputCls = "w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all";

// ─── New Queue Form ───────────────────────────────────────────────────────────

function NewQueueForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [allUsers, setAllUsers] = useState<ApiUserMini[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/users").then((r) => r.json()).then(setAllUsers).catch(() => {});
  }, []);

  const toggleUser = (id: string) =>
    setSelectedIds((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const handleSave = async () => {
    if (!name.trim()) { setErrors({ name: "Queue name is required" }); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/queues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), status, memberIds: Array.from(selectedIds) }),
      });
      if (!res.ok) {
        const data = await res.json();
        const msg = data.error ?? "Failed to create queue";
        setErrors({ name: msg });
        toast.error(msg);
        setSaving(false);
        return;
      }
      toast.success("Queue created");
      router.push("/user-management?tab=queue");
    } catch {
      setErrors({ name: "Network error" });
      toast.error("Network error");
      setSaving(false);
    }
  };

  return (
    <DetailShell>
      <Breadcrumb items={[
        { label: "User Management", href: "/user-management" },
        { label: "New Queue" },
      ]} />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Layers className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">New Queue</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Create a new agent queue</p>
          </div>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60">
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Layers className="size-4" />}
          {saving ? "Saving…" : "Save Queue"}
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-5">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-500">Queue Name <span className="text-red-500">*</span></label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Technical Support"
            className={inputCls + (errors.name ? " border-red-400" : "")} />
          {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
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
        <div className="space-y-2">
          <label className="text-xs font-medium text-zinc-500">Members</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
            {allUsers.length === 0 && <p className="text-xs text-zinc-400 col-span-2">No users available.</p>}
            {allUsers.map((u) => (
              <button key={u.id} type="button" onClick={() => toggleUser(u.id)}
                className={`cursor-pointer flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all ${selectedIds.has(u.id) ? "border-primary bg-primary/10" : "border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"}`}>
                <div className={`size-5 rounded-md flex items-center justify-center flex-shrink-0 ${selectedIds.has(u.id) ? "bg-primary text-white" : "bg-zinc-200 dark:bg-zinc-700"}`}>
                  {selectedIds.has(u.id) && <Check className="size-3 stroke-[2.5]" />}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200 truncate">{u.username}</p>
                  <p className="text-xs text-zinc-400 truncate">{u.email}</p>
                </div>
              </button>
            ))}
          </div>
          {selectedIds.size > 0 && <p className="text-xs text-primary">{selectedIds.size} member{selectedIds.size !== 1 ? "s" : ""} selected</p>}
        </div>
      </div>
    </DetailShell>
  );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────

function EditModal({ queue, onClose, onSaved }: { queue: ApiQueue; onClose: () => void; onSaved: (name: string) => void }) {
  const [name, setName] = useState(queue.name);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!name.trim()) { setError("Name is required"); return; }
    setSaving(true);
    try {
      const res = await fetch(`/api/queues/${queue.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) { const d = await res.json(); const msg = d.error ?? "Failed to save"; setError(msg); toast.error(msg); setSaving(false); return; }
      toast.success("Queue updated");
      onSaved(name.trim());
      onClose();
    } catch {
      setError("Network error");
      toast.error("Network error");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 w-full max-w-sm shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Edit Queue</h3>
          <button onClick={onClose} className="cursor-pointer size-7 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center">
            <X className="size-4 text-zinc-400" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-500">Queue Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
          </div>
        </div>
        <div className="flex items-center gap-2 px-5 pb-5">
          <button onClick={handleSave} disabled={saving}
            className="cursor-pointer flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors">
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
            {saving ? "Saving…" : "Save"}
          </button>
          <button onClick={onClose} className="cursor-pointer px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─── Add Member Modal ─────────────────────────────────────────────────────────

function AddMemberModal({ queue, onClose, onAdded }: {
  queue: ApiQueue;
  onClose: () => void;
  onAdded: (newMember: ApiUserMini) => void;
}) {
  const [allUsers, setAllUsers] = useState<ApiUserMini[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const existingIds = new Set(queue.members.map((m) => m.user.id));

  useEffect(() => {
    fetch("/api/users").then((r) => r.json()).then(setAllUsers).catch(() => {});
  }, []);

  const available = allUsers.filter((u) => !existingIds.has(u.id) && u.status === "active");

  const handleAdd = async () => {
    if (!selected) { setError("Select a user"); return; }
    setSaving(true);
    const newMemberIds = [...queue.members.map((m) => m.user.id), selected];
    try {
      const res = await fetch(`/api/queues/${queue.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberIds: newMemberIds }),
      });
      if (!res.ok) { const d = await res.json(); const msg = d.error ?? "Failed"; setError(msg); toast.error(msg); setSaving(false); return; }
      const user = allUsers.find((u) => u.id === selected)!;
      toast.success(`${user.username} added to queue`);
      onAdded(user);
      onClose();
    } catch {
      setError("Network error");
      toast.error("Network error");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 w-full max-w-sm shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Add Member</h3>
          <button onClick={onClose} className="cursor-pointer size-7 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center">
            <X className="size-4 text-zinc-400" />
          </button>
        </div>
        <div className="p-5 space-y-3 max-h-72 overflow-y-auto">
          {error && <p className="text-xs text-red-500">{error}</p>}
          {available.length === 0
            ? <p className="text-sm text-zinc-400 text-center py-4">No available users.</p>
            : available.map((u) => (
              <button key={u.id} type="button" onClick={() => setSelected(u.id)}
                className={`cursor-pointer w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all ${selected === u.id ? "border-primary bg-primary/10" : "border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"}`}>
                <div className={`size-5 rounded-md flex items-center justify-center flex-shrink-0 ${selected === u.id ? "bg-primary text-white" : "bg-zinc-200 dark:bg-zinc-700"}`}>
                  {selected === u.id && <Check className="size-3 stroke-[2.5]" />}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200 truncate">{u.username}</p>
                  <p className="text-xs text-zinc-400 truncate">{u.email}</p>
                </div>
              </button>
            ))}
        </div>
        <div className="flex gap-2 px-5 pb-5">
          <button onClick={handleAdd} disabled={saving || !selected}
            className="cursor-pointer flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors">
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            {saving ? "Adding…" : "Add Member"}
          </button>
          <button onClick={onClose} className="cursor-pointer px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function QueueDetailPage() {
  const params = useParams();
  const rawId = params?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  if (id === "new") return <NewQueueForm />;

  const [queue, setQueue] = useState<ApiQueue | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/queues/${id}`)
      .then((r) => r.json())
      .then((data) => { setQueue(data?.error ? null : data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const handleToggleStatus = async () => {
    if (!queue) return;
    const newStatus = queue.status === "active" ? "inactive" : "active";
    setToggling(true);
    try {
      const res = await fetch(`/api/queues/${queue.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) setQueue((prev) => prev ? { ...prev, status: newStatus } : prev);
      if (res.ok) toast.success(`Queue ${newStatus === "active" ? "activated" : "deactivated"}`);
      else toast.error("Failed to update status");
    } finally {
      setToggling(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!queue) return;
    setRemovingId(userId);
    const newMemberIds = queue.members.filter((m) => m.user.id !== userId).map((m) => m.user.id);
    try {
      const res = await fetch(`/api/queues/${queue.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberIds: newMemberIds }),
      });
      if (res.ok) setQueue((prev) => prev ? { ...prev, members: prev.members.filter((m) => m.user.id !== userId) } : prev);
      if (res.ok) toast.success("Member removed");
      else toast.error("Failed to remove member");
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="size-8 animate-spin text-zinc-300" />
      </div>
    );
  }

  if (!queue) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Layers className="size-12 text-zinc-300" />
        <p className="text-zinc-500 text-sm">Queue not found.</p>
        <Link href="/user-management" className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors">
          Back to User Management
        </Link>
      </div>
    );
  }

  const isActive = queue.status === "active";

  return (
    <>
      <DetailShell>
        <Breadcrumb items={[
          { label: "User Management", href: "/user-management" },
          { label: queue.name },
        ]} />

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Layers className="size-6 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{queue.name}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono text-xs text-zinc-400">{queue.queueId}</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold capitalize ${STATUS_STYLES[queue.status]}`}>{queue.status}</span>
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

        {/* Members */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="size-4 text-zinc-400" />
              <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Members
                <span className="ml-2 text-xs font-normal text-zinc-400">({queue.members.length})</span>
              </h2>
            </div>
            <button onClick={() => setShowAddMember(true)}
              className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors">
              <Plus className="size-3.5" />Add Member
            </button>
          </div>

          {queue.members.length === 0 ? (
            <div className="p-8 text-center">
              <User className="size-8 text-zinc-300 mx-auto mb-2" />
              <p className="text-sm text-zinc-400">No members in this queue.</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {queue.members.map(({ user: u }) => (
                <div key={u.id} className="flex items-center gap-3 px-5 py-3.5">
                  <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-sm font-bold text-primary uppercase">
                    {u.username.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">{u.username}</p>
                    <div className="flex items-center gap-1 text-xs text-zinc-400">
                      <Mail className="size-3" />{u.email}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold capitalize ${STATUS_STYLES[u.status]}`}>{u.status}</span>
                    <Link href={`/user-management/users/${u.id}`}
                      className="size-7 flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:text-primary hover:border-primary/40 transition-colors">
                      <User className="size-3.5" />
                    </Link>
                    <button onClick={() => handleRemoveMember(u.id)} disabled={removingId === u.id}
                      className="cursor-pointer size-7 flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:text-red-500 hover:border-red-200 dark:hover:border-red-800/40 transition-colors disabled:opacity-50">
                      {removingId === u.id ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DetailShell>

      {showAddMember && (
        <AddMemberModal
          queue={queue}
          onClose={() => setShowAddMember(false)}
          onAdded={(u) => setQueue((prev) => prev ? { ...prev, members: [...prev.members, { user: u }] } : prev)}
        />
      )}
      {showEdit && (
        <EditModal
          queue={queue}
          onClose={() => setShowEdit(false)}
          onSaved={(name) => { setQueue((prev) => prev ? { ...prev, name } : prev); setShowEdit(false); }}
        />
      )}
    </>
  );
}
