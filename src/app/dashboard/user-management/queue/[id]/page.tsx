"use client";

import { useState } from "react";
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
} from "lucide-react";
import Link from "next/link";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import {
  MOCK_QUEUES,
  MOCK_USERS,
  STATUS_STYLES,
  type Queue,
  type QueueStatus,
} from "@/features/rbac/mock-data";
import { addLocalItem, getLocalItems } from "@/lib/local-store";

// ─── New Queue Form ──────────────────────────────────────────────────────────────────

function NewQueueForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [queueStatus, setQueueStatus] = useState<QueueStatus>("active");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [memberSearch, setMemberSearch] = useState("");
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const inputCls = "w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all";

  const toggleMember = (userId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(userId) ? prev.filter((m) => m !== userId) : [...prev, userId]
    );
  };

  const handleSave = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Queue name is required";
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    const existingQueues = [...getLocalItems<Queue>("queues"), ...MOCK_QUEUES];
    const nextNum = existingQueues.length + 1;
    const newQueue: Queue = {
      id: `new-${Date.now()}`,
      queueId: `QUE${String(nextNum).padStart(3, "0")}`,
      name: name.trim(),
      status: queueStatus,
      members: selectedMembers,
    };
    addLocalItem("queues", newQueue);
    setSaved(true);
    setTimeout(() => router.push("/dashboard/user-management"), 800);
  };

  const filteredUsers = MOCK_USERS.filter(
    (u) => u.username.toLowerCase().includes(memberSearch.toLowerCase()) ||
           u.email.toLowerCase().includes(memberSearch.toLowerCase())
  );

  return (
    <div className="p-6 space-y-5 max-w-2xl mx-auto">
      <Breadcrumb items={[
        { label: "User Management", href: "/dashboard/user-management" },
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
        <button
          onClick={handleSave}
          disabled={saved}
          className="cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
        >
          {saved ? <Check className="size-4" /> : <Plus className="size-4" />}
          {saved ? "Saved!" : "Save Queue"}
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-5">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-500">Queue Name <span className="text-red-500">*</span></label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Support Team A" className={inputCls + (errors.name ? " border-red-400" : "")} />
          {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-500">Status</label>
          <div className="relative">
            <select value={queueStatus} onChange={(e) => setQueueStatus(e.target.value as QueueStatus)}
              className="w-full appearance-none px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all pr-8">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <Power className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400 pointer-events-none" />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-500">Members <span className="text-zinc-400">(optional)</span></label>
          <input value={memberSearch} onChange={(e) => setMemberSearch(e.target.value)} placeholder="Search users to add..." className={inputCls} />
          <div className="mt-2 space-y-1.5 max-h-48 overflow-y-auto">
            {filteredUsers.map((u) => (
              <button key={u.id} type="button" onClick={() => toggleMember(u.userId)}
                className={`cursor-pointer w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all text-left ${
                  selectedMembers.includes(u.userId)
                    ? "border-primary bg-primary/5 dark:bg-primary/10"
                    : "border-zinc-200 dark:border-zinc-700 hover:border-primary/40 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                }`}>
                <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0 uppercase">
                  {u.username.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{u.username}</p>
                  <p className="text-xs text-zinc-400 truncate">{u.email}</p>
                </div>
                {selectedMembers.includes(u.userId) && <Check className="size-4 text-primary flex-shrink-0" />}
              </button>
            ))}
          </div>
          {selectedMembers.length > 0 && (
            <p className="text-xs text-zinc-500">{selectedMembers.length} member{selectedMembers.length > 1 ? "s" : ""} selected</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Add Member Modal ─────────────────────────────────────────────────────────

function AddMemberModal({
  currentMembers,
  onClose,
  onAdd,
}: {
  currentMembers: string[];
  onClose: () => void;
  onAdd: (userId: string) => void;
}) {
  const available = MOCK_USERS.filter((u) => !currentMembers.includes(u.userId));
  const [search, setSearch] = useState("");

  const filtered = available.filter(
    (u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 w-full max-w-sm shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Add Member</h3>
          <button onClick={onClose} className="cursor-pointer size-7 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors">
            <X className="size-4 text-zinc-400" />
          </button>
        </div>
        <div className="px-5 pt-4 pb-2">
          <input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>
        <div className="p-3 space-y-1.5 max-h-72 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-sm text-zinc-400 text-center py-4">No available users.</p>
          ) : (
            filtered.map((u) => (
              <button
                key={u.id}
                onClick={() => { onAdd(u.userId); onClose(); }}
                className="cursor-pointer w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-primary/40 hover:bg-primary/5 transition-all text-left"
              >
                <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0 uppercase">
                  {u.username.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{u.username}</p>
                  <p className="text-xs text-zinc-400 truncate">{u.email}</p>
                </div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold capitalize ${STATUS_STYLES[u.status]}`}>
                  {u.status}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────

function EditModal({
  queue,
  onClose,
  onSave,
}: {
  queue: Queue;
  onClose: () => void;
  onSave: (name: string) => void;
}) {
  const [name, setName] = useState(queue.name);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 w-full max-w-sm shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Edit Queue</h3>
          <button onClick={onClose} className="cursor-pointer size-7 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors">
            <X className="size-4 text-zinc-400" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-500">Queue Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>
        </div>
        <div className="flex items-center gap-2 px-5 pb-5">
          <button
            onClick={() => { onSave(name); onClose(); }}
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

export default function QueueDetailPage() {
  const params = useParams();
  const rawId = params?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  if (id === "new") return <NewQueueForm />;

  const allQueues = [...getLocalItems<Queue>("queues"), ...MOCK_QUEUES];
  const initialQueue = allQueues.find((q) => q.id === id);
  const [queue, setQueue] = useState<Queue | undefined>(initialQueue);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  if (!queue) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Layers className="size-12 text-zinc-300" />
        <p className="text-zinc-500 text-sm">Queue not found.</p>
        <Link
          href="/dashboard/user-management"
          className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          Back to User Management
        </Link>
      </div>
    );
  }

  const userMap = Object.fromEntries(MOCK_USERS.map((u) => [u.userId, u]));
  const members = queue.members.map((uid) => userMap[uid]).filter(Boolean);
  const isActive = queue.status === "active";

  const handleToggleStatus = () => {
    setQueue((prev) => prev ? { ...prev, status: (prev.status === "active" ? "inactive" : "active") as QueueStatus } : prev);
  };

  const handleRemoveMember = (userId: string) => {
    setQueue((prev) => prev ? { ...prev, members: prev.members.filter((m) => m !== userId) } : prev);
  };

  const handleAddMember = (userId: string) => {
    setQueue((prev) => prev ? { ...prev, members: [...prev.members, userId] } : prev);
  };

  return (
    <>
      <div className="p-6 space-y-5 max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "User Management", href: "/dashboard/user-management" },
            { label: queue.name },
          ]}
        />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Layers className="size-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{queue.name}</h1>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold capitalize ${STATUS_STYLES[queue.status]}`}>
                  {queue.status}
                </span>
              </div>
              <span className="text-sm font-mono text-zinc-400">{queue.queueId}</span>
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

        {/* Members Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="size-4 text-zinc-400" />
              <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Members
                <span className="ml-2 text-xs font-normal text-zinc-400">({members.length})</span>
              </h2>
            </div>
            <button
              onClick={() => setShowAddMember(true)}
              className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors"
            >
              <Plus className="size-3.5" />
              Add Member
            </button>
          </div>

          {members.length === 0 ? (
            <div className="p-8 text-center">
              <User className="size-8 text-zinc-300 mx-auto mb-2" />
              <p className="text-sm text-zinc-400">No members in this queue yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {members.map((member) => (
                <div key={member.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0 uppercase">
                    {member.username.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{member.username}</p>
                    <p className="text-xs text-zinc-400 truncate">{member.email}</p>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold capitalize ${STATUS_STYLES[member.status]}`}>
                    {member.status}
                  </span>
                  <Link
                    href={`/dashboard/user-management/users/${member.id}`}
                    className="text-xs text-zinc-400 hover:text-primary transition-colors font-medium"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => handleRemoveMember(member.userId)}
                    className="cursor-pointer size-7 flex items-center justify-center rounded-lg text-zinc-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showAddMember && (
        <AddMemberModal
          currentMembers={queue.members}
          onClose={() => setShowAddMember(false)}
          onAdd={handleAddMember}
        />
      )}
      {showEdit && (
        <EditModal
          queue={queue}
          onClose={() => setShowEdit(false)}
          onSave={(name) => setQueue((prev) => prev ? { ...prev, name } : prev)}
        />
      )}
    </>
  );
}
