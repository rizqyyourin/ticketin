"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  ClipboardList,
  Tag,
  AlertTriangle,
  Clock,
  CalendarDays,
  UserCheck,
  MessageSquare,
  Activity,
  X,
  Check,
  User,
  ChevronDown,
  Loader2,
  Play,
  Pause,
  CheckCircle2,
  Archive,
  Zap,
  CircleDot,
  ArrowRight,
  Star,
} from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import {
  type Priority,
  type Status,
  type ServiceRequestDetail,
  type SRComment,
  type SRActivityLog,
  type SRAssignedUser,
  type QueueWithMembers,
  SLA_HOURS,
} from "@/features/service-request/types";
import { DetailShell } from "@/components/layouts/page-shell";

// ─── Status transitions ───────────────────────────────────────────────────────
// new         → open | in_progress | closed
// open        → in_progress | closed
// in_progress → pending | resolved | closed
// pending     → in_progress | closed
// resolved    → in_progress (reopen) | closed
// closed      → (terminal)

const STATUS_TRANSITIONS: Record<Status, Array<{ status: Status; hint: string }>> = {
  new: [
    { status: "open", hint: "Acknowledge and open this ticket" },
    { status: "in_progress", hint: "Agent picks up immediately" },
    { status: "closed", hint: "Close without opening" },
  ],
  open: [
    { status: "in_progress", hint: "Agent picks up and starts working on this ticket" },
    { status: "closed", hint: "Close ticket without resolution" },
  ],
  in_progress: [
    { status: "pending", hint: "Awaiting information or response from customer" },
    { status: "resolved", hint: "Issue has been resolved" },
    { status: "closed", hint: "Force close this ticket" },
  ],
  pending: [
    { status: "in_progress", hint: "Customer has responded, resume working" },
    { status: "closed", hint: "No customer response, closing ticket" },
  ],
  resolved: [
    { status: "in_progress", hint: "Reopen — issue needs further investigation" },
    { status: "closed", hint: "Customer confirmed the resolution" },
  ],
  closed: [],
};

// ─── Style maps ──────────────────────────────────────────────────────────────

const PRIORITY_STYLES: Record<Priority, { badge: string; label: string }> = {
  high: { badge: "bg-red-500/10 text-red-500 border border-red-500/20", label: "High" },
  medium: { badge: "bg-amber-500/10 text-amber-500 border border-amber-500/20", label: "Medium" },
  low: { badge: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20", label: "Low" },
};

const STATUS_STYLES: Record<Status, { badge: string; label: string; dot: string }> = {
  new: { badge: "bg-sky-500/10 text-sky-500 border border-sky-500/20", label: "New", dot: "bg-sky-500" },
  open: { badge: "bg-blue-500/10 text-blue-500 border border-blue-500/20", label: "Open", dot: "bg-blue-500" },
  in_progress: { badge: "bg-violet-500/10 text-violet-500 border border-violet-500/20", label: "In Progress", dot: "bg-violet-500" },
  pending: { badge: "bg-amber-500/10 text-amber-600 border border-amber-500/20", label: "Pending", dot: "bg-amber-500" },
  resolved: { badge: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20", label: "Resolved", dot: "bg-emerald-500" },
  closed: { badge: "bg-zinc-500/10 text-zinc-500 border border-zinc-500/20", label: "Closed", dot: "bg-zinc-400" },
};

// icon + card accent per status (for Change Status modal)
const STATUS_CARD: Record<Status, {
  icon: React.ReactNode;
  accent: string;        // border + icon bg
  iconColor: string;     // icon color
  danger?: boolean;
}> = {
  new:         { icon: <CircleDot className="size-4" />,    accent: "border-sky-500/30 bg-sky-500/5",      iconColor: "text-sky-500" },
  open:        { icon: <ArrowRight className="size-4" />,   accent: "border-blue-500/30 bg-blue-500/5",    iconColor: "text-blue-500" },
  in_progress: { icon: <Play className="size-4" />,         accent: "border-violet-500/30 bg-violet-500/5", iconColor: "text-violet-500" },
  pending:     { icon: <Pause className="size-4" />,        accent: "border-amber-500/30 bg-amber-500/5",  iconColor: "text-amber-500" },
  resolved:    { icon: <CheckCircle2 className="size-4" />, accent: "border-emerald-500/30 bg-emerald-500/5", iconColor: "text-emerald-500" },
  closed:      { icon: <Archive className="size-4" />,      accent: "border-zinc-400/30 bg-zinc-500/5",    iconColor: "text-zinc-500", danger: true },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isBreached(dueDateStr: string): boolean {
  return new Date() > new Date(dueDateStr);
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function getSlaRemaining(dueDateStr: string): { label: string; color: string } {
  const now = new Date();
  const diffMs = new Date(dueDateStr).getTime() - now.getTime();
  if (diffMs <= 0) return { label: "Breached", color: "text-red-500" };
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  if (hours < 1) return { label: `${minutes}m remaining`, color: "text-red-400" };
  if (hours < 3) return { label: `${hours}h ${minutes}m remaining`, color: "text-amber-500" };
  return { label: `${hours}h ${minutes}m remaining`, color: "text-emerald-500" };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

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

function CommentBubble({ comment, customerName }: { comment: SRComment; customerName?: string }) {
  const isAgent = comment.role === "agent";
  const isSystem = comment.role === "system";
  const displayName = comment.author?.username ?? (comment.role === "customer" ? (customerName ?? "Customer") : "System");

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <span className="text-xs text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full">
          {comment.content}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex gap-3 ${isAgent ? "" : "flex-row-reverse"}`}>
      <div className={`size-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white ${isAgent ? "bg-primary" : "bg-zinc-400"}`}>
        {displayName.charAt(0).toUpperCase()}
      </div>
      <div className={`max-w-[75%] flex flex-col gap-1 ${isAgent ? "" : "items-end"}`}>
        <div className={`flex items-center gap-2 ${isAgent ? "" : "flex-row-reverse"}`}>
          <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{displayName}</span>
          <span className="text-xs text-zinc-400">{formatDateTime(comment.createdAt)}</span>
        </div>
        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
          isAgent
            ? "bg-primary/10 text-zinc-800 dark:text-zinc-200 rounded-tl-sm"
            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-tr-sm"
        }`}>
          {comment.content}
        </div>
      </div>
    </div>
  );
}

function ActivityItem({ log }: { log: SRActivityLog }) {
  const iconMap: Record<SRActivityLog["type"], React.ReactNode> = {
    created: <ClipboardList className="size-3.5 text-blue-500" />,
    assignment: <UserCheck className="size-3.5 text-violet-500" />,
    status_change: <Activity className="size-3.5 text-amber-500" />,
    comment: <MessageSquare className="size-3.5 text-emerald-500" />,
  };

  return (
    <div className="flex gap-3 items-start">
      <div className="mt-0.5 size-6 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
        {iconMap[log.type]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-zinc-700 dark:text-zinc-300">{log.detail}</p>
        <p className="text-xs text-zinc-400 mt-0.5">
          {log.actor?.username ?? "System"} · {formatDateTime(log.createdAt)}
        </p>
      </div>
    </div>
  );
}

// ─── Change Status Modal ──────────────────────────────────────────────────────

function ChangeStatusModal({
  currentStatus,
  saving,
  onClose,
  onConfirm,
}: {
  currentStatus: Status;
  saving: boolean;
  onClose: () => void;
  onConfirm: (status: Status) => void;
}) {
  const transitions = STATUS_TRANSITIONS[currentStatus];
  const [pendingStatus, setPendingStatus] = useState<Status | null>(null);

  const handleClick = (status: Status) => {
    const card = STATUS_CARD[status];
    if (card.danger) {
      // require confirm step for destructive transitions
      setPendingStatus((prev) => (prev === status ? null : status));
    } else {
      onConfirm(status);
    }
  };

  const currentCard = STATUS_CARD[currentStatus];
  const currentStyle = STATUS_STYLES[currentStatus];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={!saving ? onClose : undefined} />
      <div className="relative z-10 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 w-full max-w-sm mx-4 shadow-xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Change Status</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Select where this ticket should move</p>
          </div>
          <button
            onClick={onClose}
            disabled={saving}
            className="size-7 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors disabled:opacity-50"
          >
            <X className="size-4 text-zinc-400" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Current state pill */}
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
            <div className={`size-7 rounded-lg flex items-center justify-center ${currentCard.iconColor} bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700`}>
              {currentCard.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-zinc-400 uppercase tracking-wide font-medium">Current</p>
              <p className={`text-sm font-semibold ${currentCard.iconColor}`}>{currentStyle.label}</p>
            </div>
            <Zap className="size-3.5 text-zinc-300" />
          </div>

          {transitions.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-6">
              <Archive className="size-8 text-zinc-300" />
              <p className="text-sm text-zinc-400 text-center">Ticket is closed — no further transitions.</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-zinc-100 dark:bg-zinc-800" />
                <span className="text-[10px] text-zinc-400 uppercase tracking-wide font-medium">Move to</span>
                <div className="h-px flex-1 bg-zinc-100 dark:bg-zinc-800" />
              </div>

              {transitions.map(({ status, hint }) => {
                const s = STATUS_STYLES[status];
                const card = STATUS_CARD[status];
                const isConfirming = pendingStatus === status;
                return (
                  <div key={status} className="space-y-1">
                    <button
                      onClick={() => handleClick(status)}
                      disabled={saving}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left group disabled:opacity-60
                        ${isConfirming
                          ? "border-red-400/50 bg-red-50 dark:bg-red-500/10"
                          : card.danger
                            ? "border-zinc-200 dark:border-zinc-700 hover:border-red-400/50 hover:bg-red-50 dark:hover:bg-red-500/10"
                            : `border-zinc-200 dark:border-zinc-700 hover:${card.accent}`
                        }`}
                    >
                      {/* Icon box */}
                      <div className={`size-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors
                        ${isConfirming ? "bg-red-100 dark:bg-red-500/20 text-red-500" : `bg-zinc-100 dark:bg-zinc-800 ${card.iconColor} group-hover:bg-white dark:group-hover:bg-zinc-900`}`}>
                        {card.icon}
                      </div>

                      {/* Label + hint */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-sm font-semibold ${isConfirming ? "text-red-600 dark:text-red-400" : "text-zinc-800 dark:text-zinc-200"}`}>
                            {s.label}
                          </span>
                          {card.danger && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-red-100 dark:bg-red-500/20 text-red-500 font-medium">
                              Irreversible
                            </span>
                          )}
                        </div>
                        <p className={`text-xs mt-0.5 leading-relaxed ${isConfirming ? "text-red-500/80" : "text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300"}`}>
                          {hint}
                        </p>
                      </div>

                      {/* Arrow or confirm indicator */}
                      {isConfirming ? (
                        <AlertTriangle className="size-4 text-red-500 flex-shrink-0" />
                      ) : (
                        <ArrowRight className="size-4 text-zinc-300 group-hover:text-zinc-400 flex-shrink-0 transition-colors" />
                      )}
                    </button>

                    {/* Inline confirm for dangerous actions */}
                    {isConfirming && (
                      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-300/40">
                        <p className="text-xs text-red-600 dark:text-red-400 flex-1">Close this ticket? This cannot be undone.</p>
                        <button
                          onClick={() => { setPendingStatus(null); onConfirm(status); }}
                          disabled={saving}
                          className="px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-semibold transition-colors flex items-center gap-1 disabled:opacity-60"
                        >
                          {saving ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3" />}
                          Confirm
                        </button>
                        <button
                          onClick={() => setPendingStatus(null)}
                          disabled={saving}
                          className="px-2 py-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 text-red-500 text-xs font-medium transition-colors disabled:opacity-60"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

              {saving && (
                <div className="flex items-center justify-center gap-2 py-2">
                  <Loader2 className="size-4 animate-spin text-primary" />
                  <span className="text-xs text-zinc-400">Updating status…</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Assign Modal ─────────────────────────────────────────────────────────────

interface AssignPayload {
  userId: string | null;
  username: string | null;
  email: string | null;
  queueId: string | null;
  queueName: string | null;
}

function AssignModal({
  currentAssignedUser,
  currentQueueId,
  saving,
  onClose,
  onConfirm,
}: {
  currentAssignedUser: SRAssignedUser | null;
  currentQueueId: string | null;
  saving: boolean;
  onClose: () => void;
  onConfirm: (payload: AssignPayload) => void;
}) {
  const [queues, setQueues] = useState<QueueWithMembers[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQueueId, setSelectedQueueId] = useState(currentQueueId ?? "");

  useEffect(() => {
    fetch("/api/queues")
      .then((r) => r.json())
      .then((data: QueueWithMembers[]) => setQueues(data))
      .catch(() => setQueues([]))
      .finally(() => setLoading(false));
  }, []);

  const selectedQueue = queues.find((q) => q.id === selectedQueueId);

  const handleSelectUser = (member: QueueWithMembers["members"][0] | null) => {
    if (!member) {
      onConfirm({ userId: null, username: null, email: null, queueId: selectedQueueId || null, queueName: selectedQueue?.name ?? null });
    } else {
      onConfirm({ userId: member.userId, username: member.user.username, email: member.user.email, queueId: selectedQueueId, queueName: selectedQueue?.name ?? null });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={!saving ? onClose : undefined} />
      <div className="relative z-10 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 w-full max-w-md mx-4 shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Assign Ticket</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Select a queue, then pick an agent</p>
          </div>
          <button onClick={onClose} disabled={saving} className="size-7 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors disabled:opacity-50">
            <X className="size-4 text-zinc-400" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="size-5 animate-spin text-zinc-400" />
            </div>
          ) : (
            <>
              {currentAssignedUser && (
                <button
                  onClick={() => onConfirm({ userId: null, username: null, email: null, queueId: null, queueName: null })}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-500/5 transition-all text-sm text-zinc-500 hover:text-red-500 disabled:opacity-60"
                >
                  <X className="size-4" /> Unassign
                </button>
              )}

              {/* Step 1: Queue */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Step 1 — Select Queue</p>
                {queues.filter((q) => q.status === "active").length === 0 ? (
                  <p className="text-xs text-zinc-400 py-2">No active queues found.</p>
                ) : (
                  <div className="space-y-1.5">
                    {queues.filter((q) => q.status === "active").map((q) => {
                      const isSel = q.id === selectedQueueId;
                      return (
                        <button
                          key={q.id}
                          type="button"
                          onClick={() => { setSelectedQueueId(q.id); }}
                          className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-left transition-all ${isSel ? "border-primary/50 bg-primary/5" : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"}`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={`size-2 rounded-full ${isSel ? "bg-primary" : "bg-zinc-300 dark:bg-zinc-600"}`} />
                            <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{q.name}</span>
                            <span className="text-xs text-zinc-400">{q.members.length} member{q.members.length !== 1 ? "s" : ""}</span>
                          </div>
                          {isSel && <Check className="size-3.5 text-primary" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Step 2: Users from selected queue */}
              {selectedQueue && (
                <div className="space-y-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                    Step 2 — Pick Agent <span className="normal-case text-primary font-medium">({selectedQueue.name})</span>
                  </p>
                  {selectedQueue.members.length === 0 ? (
                    <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5 py-2">
                      <AlertTriangle className="size-3.5" /> Queue has no members yet
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      <button
                        type="button"
                        onClick={() => handleSelectUser(null)}
                        disabled={saving}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-600 hover:border-primary/40 hover:bg-primary/5 transition-all text-left disabled:opacity-60"
                      >
                        <div className="size-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
                          <UserCheck className="size-3.5 text-zinc-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Assign to queue only</p>
                          <p className="text-xs text-zinc-400">Auto-escalation will pick the first available agent</p>
                        </div>
                      </button>
                      {selectedQueue.members.map((m) => {
                        const isSel = m.userId === currentAssignedUser?.id;
                        return (
                          <button
                            key={m.id}
                            onClick={() => handleSelectUser(m)}
                            disabled={saving}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all text-left disabled:opacity-60 ${isSel ? "border-primary/50 bg-primary/5" : "border-zinc-200 dark:border-zinc-700 hover:border-primary/30 hover:bg-zinc-50 dark:hover:bg-zinc-800"}`}
                          >
                            <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                              {m.user.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{m.user.username}</p>
                              <p className="text-xs text-zinc-400 truncate">{m.user.email}</p>
                            </div>
                            {isSel && <Check className="size-4 text-primary flex-shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  <p className="text-xs text-zinc-400 pt-1 flex items-start gap-1.5">
                    <AlertTriangle className="size-3 mt-0.5 flex-shrink-0 text-amber-400" />
                    If agent doesn&apos;t respond within 5 min, ticket auto-escalates to next member in queue.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}


// ─── Page ─────────────────────────────────────────────────────────────────────

const ACTIVITY_PREVIEW = 3;

export default function ServiceRequestDetailPage() {
  const params = useParams();
  const rawId = params?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const { data: session } = useSession();
  const currentUserInitial = (session?.user?.name ?? session?.user?.email ?? "?").charAt(0).toUpperCase();

  const [req, setReq] = useState<ServiceRequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [currentStatus, setCurrentStatus] = useState<Status>("new");
  const [currentAssignedUser, setCurrentAssignedUser] = useState<SRAssignedUser | null>(null);
  const [currentQueueId, setCurrentQueueId] = useState<string | null>(null);
  const [showChangeStatus, setShowChangeStatus] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingAssign, setSavingAssign] = useState(false);
  const [activityExpanded, setActivityExpanded] = useState(false);
  const [comments, setComments] = useState<SRComment[]>([]);
  const [activityLogs, setActivityLogs] = useState<SRActivityLog[]>([]);
  const [commentInput, setCommentInput] = useState("");
  const [sendingComment, setSendingComment] = useState(false);
  const [csatSentAt, setCsatSentAt] = useState<string | null>(null);

  // Scroll container for comments — auto-scroll to bottom on new messages
  const commentsScrollRef = useRef<HTMLDivElement>(null);
  const prevCommentCountRef = useRef(0);

  // Track latest comment ID to detect new ones without replacing optimistic updates
  const latestCommentIdRef = useRef<string | null>(null);

  const pollComments = useCallback(async () => {
    if (!id) return;
    try {
      const [commentsRes, srRes] = await Promise.all([
        fetch(`/api/service-requests/${id}/comments`, { cache: "no-store" }),
        fetch(`/api/service-requests/${id}`, { cache: "no-store" }),
      ]);
      if (commentsRes.ok) {
        const fresh: SRComment[] = await commentsRes.json();
        setComments((prev) => {
          // Merge: keep any local optimistic entries, add new server entries
          const serverIds = new Set(fresh.map((c) => c.id));
          const localOnly = prev.filter((c) => !serverIds.has(c.id));
          return [...fresh, ...localOnly.filter((c) => c.id.startsWith("optimistic-"))];
        });
        if (fresh.length > 0) {
          latestCommentIdRef.current = fresh[fresh.length - 1].id;
        }
      }
      if (srRes.ok) {
        const srData: ServiceRequestDetail = await srRes.json();
        setCsatSentAt(srData.csatSentAt ?? null);
      }
    } catch {
      // Silent — polling failure is non-fatal
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setFetchError(null);
    fetch(`/api/service-requests/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: ServiceRequestDetail) => {
        setReq(data);
        setCurrentStatus(data.status);
        setCurrentAssignedUser(data.assignedUser);
        setCurrentQueueId(data.queue?.id ?? null);
        setComments(data.comments);
        setActivityLogs(data.activityLogs);
        setCsatSentAt(data.csatSentAt ?? null);
      })
      .catch((err) => {
        setFetchError(err.message ?? "Failed to load ticket");
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Poll comments every 5 seconds for reactivity (inbound emails, other agents)
  useEffect(() => {
    if (!id) return;
    const interval = setInterval(pollComments, 5000);
    return () => clearInterval(interval);
  }, [id, pollComments]);

  // Auto-scroll to bottom when comment count increases
  useEffect(() => {
    if (comments.length > prevCommentCountRef.current && commentsScrollRef.current) {
      commentsScrollRef.current.scrollTop = commentsScrollRef.current.scrollHeight;
    }
    prevCommentCountRef.current = comments.length;
  }, [comments.length]);

  const handleChangeStatus = async (newStatus: Status) => {
    if (!req) return;
    setSavingStatus(true);
    try {
      const res = await fetch(`/api/service-requests/${req.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const updated: ServiceRequestDetail = await res.json();
      setCurrentStatus(updated.status);
      // Append activity log entry locally
      setActivityLogs((prev) => [
        {
          id: `local-${Date.now()}`,
          type: "status_change",
          detail: `Status changed from ${currentStatus} to ${newStatus}`,
          createdAt: new Date().toISOString(),
          actor: null,
        },
        ...prev,
      ]);
      setShowChangeStatus(false);
    } catch {
      // Keep modal open on error — user can retry
    } finally {
      setSavingStatus(false);
    }
  };

  const handleAssign = async (payload: AssignPayload) => {
    if (!req) return;
    setSavingAssign(true);
    try {
      const body: Record<string, unknown> = {
        assignedTo: payload.userId ?? null,
      };
      if (payload.queueId !== undefined) body.queueId = payload.queueId;
      const res = await fetch(`/api/service-requests/${req.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const updated: ServiceRequestDetail = await res.json();
      setReq(updated);
      setCurrentStatus(updated.status);
      setCurrentAssignedUser(updated.assignedUser);
      setCurrentQueueId(updated.queue?.id ?? null);
      setActivityLogs((prev) => {
        // Merge: prepend any new activity logs not already in state
        const existingIds = new Set(prev.map((l) => l.id));
        const fresh = (updated.activityLogs ?? []).filter((l) => !existingIds.has(l.id));
        return [...fresh, ...prev];
      });
      setShowAssign(false);
    } catch {
      // Keep modal open on error
    } finally {
      setSavingAssign(false);
    }
  };

  const handleSendComment = async () => {
    if (!req || !commentInput.trim()) return;
    const text = commentInput.trim();
    setSendingComment(true);
    setCommentInput("");

    // Optimistic insert
    const optimisticId = `optimistic-${Date.now()}`;
    const optimistic: SRComment = {
      id: optimisticId,
      content: text,
      role: "agent",
      createdAt: new Date().toISOString(),
      serviceRequestId: req.id,
      authorId: session?.user?.id ?? null,
      author: { username: session?.user?.name ?? session?.user?.email ?? "You" },
      emailMessageId: null,
    };
    setComments((prev) => [...prev, optimistic]);

    try {
      const res = await fetch(`/api/service-requests/${req.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text, role: "agent" }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      // Remove optimistic BEFORE polling so the merge doesn't keep it alongside the real entry
      setComments((prev) => prev.filter((c) => c.id !== optimisticId));
      await pollComments();
    } catch {
      // Revert optimistic on failure
      setComments((prev) => prev.filter((c) => c.id !== optimisticId));
      setCommentInput(text);
    } finally {
      setSendingComment(false);
    }
  };

  // ─── Loading ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <DetailShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="size-8 animate-spin text-zinc-300" />
        </div>
      </DetailShell>
    );
  }

  if (fetchError || !req) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <ClipboardList className="size-12 text-zinc-300" />
        <p className="text-zinc-500 text-sm">{fetchError ?? "Service request not found."}</p>
        <Link
          href="/service-request"
          className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          Back to Service Requests
        </Link>
      </div>
    );
  }

  const p = PRIORITY_STYLES[req.priority];
  const s = STATUS_STYLES[currentStatus];
  const breached = isBreached(req.dueDate);
  const sla = getSlaRemaining(req.dueDate);
  const slaHours = SLA_HOURS[req.priority];

  const sortedActivity = [...activityLogs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const visibleActivity = activityExpanded
    ? sortedActivity
    : sortedActivity.slice(0, ACTIVITY_PREVIEW);
  const hiddenCount = sortedActivity.length - ACTIVITY_PREVIEW;

  return (
    <>
      <DetailShell>
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Service Request", href: "/service-request" },
            { label: req.ticketNumber },
          ]}
        />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div className="flex items-start gap-3">
            <div className="size-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <ClipboardList className="size-5 text-primary" />
            </div>
            <div>
              <span className="font-mono text-base font-bold text-primary">{req.ticketNumber}</span>
              <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5 leading-snug">
                {req.subject}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setShowChangeStatus(true)}
              className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Change Status
            </button>
            <button
              onClick={() => setShowAssign(true)}
              className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Assign
            </button>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Description + Comments */}
          <div className="lg:col-span-2 space-y-6">

            {/* Description */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-3">
              <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                <Tag className="size-4 text-zinc-400" />
                Description
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {req.description}
              </p>
            </div>

            {/* Comments */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col" style={{ height: '480px' }}>
              <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2 flex-shrink-0">
                <MessageSquare className="size-4 text-zinc-400" />
                <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  Comments
                  {comments.length > 0 && (
                    <span className="ml-2 text-xs font-normal text-zinc-400">({comments.length})</span>
                  )}
                </h2>
              </div>
              <div
                ref={commentsScrollRef}
                className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0"
              >
                {comments.length === 0 && !csatSentAt ? (
                  <p className="text-sm text-zinc-400 text-center py-6">No comments yet.</p>
                ) : (
                  (() => {
                    // Build merged timeline: comments + optional CSAT event
                    type TimelineItem =
                      | { kind: "comment"; data: SRComment }
                      | { kind: "csat"; sentAt: string };

                    const items: TimelineItem[] = comments.map((c) => ({ kind: "comment", data: c }));
                    if (csatSentAt) {
                      items.push({ kind: "csat", sentAt: csatSentAt });
                      items.sort((a, b) => {
                        const ta = a.kind === "comment" ? a.data.createdAt : a.sentAt;
                        const tb = b.kind === "comment" ? b.data.createdAt : b.sentAt;
                        return new Date(ta).getTime() - new Date(tb).getTime();
                      });
                    }

                    return items.map((item, idx) =>
                      item.kind === "comment" ? (
                        <CommentBubble key={item.data.id} comment={item.data} customerName={req?.contact.customerName} />
                      ) : (
                        <div key={`csat-${idx}`} className="flex justify-center">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                            <Star className="size-3 fill-amber-400 text-amber-400" />
                            CSAT survey sent · {formatDateTime(item.sentAt)}
                          </div>
                        </div>
                      )
                    );
                  })()
                )}
              </div>

              {/* Comment input */}
              <div className="px-5 pb-5">
                <div className="flex gap-3">
                  <div className="size-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {currentUserInitial}
                  </div>
                  <div className="flex-1 relative">
                    <textarea
                      rows={3}
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      placeholder="Write a comment..."
                      className="w-full px-4 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
                    />
                    <button
                      onClick={handleSendComment}
                      disabled={sendingComment || !commentInput.trim()}
                      className="absolute bottom-3 right-3 px-3 py-1 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-1"
                    >
                      {sendingComment && <Loader2 className="size-3 animate-spin" />}
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Info + Activity */}
          <div className="space-y-6">

            {/* Ticket Info */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Ticket Info</h2>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold ${s.badge}`}>
                    <span className={`size-1.5 rounded-full ${s.dot}`} />
                    {s.label}
                  </span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold ${p.badge}`}>
                    {p.label}
                  </span>
                </div>
              </div>

              <InfoRow
                icon={<User className="size-4 text-zinc-400" />}
                label="Customer"
                value={
                  <div>
                    <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{req.contact.customerName}</p>
                    <p className="text-xs text-zinc-400">{req.contact.email}</p>
                  </div>
                }
              />

              <InfoRow
                icon={<Tag className="size-4 text-zinc-400" />}
                label="Category"
                value={req.category}
              />

              <InfoRow
                icon={<UserCheck className="size-4 text-zinc-400" />}
                label="Assigned To"
                value={
                  currentAssignedUser ? (
                    <span>{currentAssignedUser.username}</span>
                  ) : (
                    <span className="text-zinc-400 font-normal">Unassigned</span>
                  )
                }
              />

              <InfoRow
                icon={<CalendarDays className="size-4 text-zinc-400" />}
                label="Created At"
                value={formatDateTime(req.createdAt)}
              />

              <InfoRow
                icon={<Clock className="size-4 text-zinc-400" />}
                label="Last Updated"
                value={formatDateTime(req.updatedAt)}
              />

              {/* SLA block */}
              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400 font-medium">SLA Deadline</span>
                  {breached && (
                    <span className="inline-flex items-center gap-1 text-xs text-red-500 font-semibold">
                      <AlertTriangle className="size-3" />
                      Breached
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  {formatDateTime(req.dueDate)}
                </p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400">SLA: {slaHours}h for {req.priority} priority</span>
                  <span className={`font-semibold ${sla.color}`}>{sla.label}</span>
                </div>
                <div className="h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  {(() => {
                    const total = slaHours * 60 * 60 * 1000;
                    const elapsed = new Date(req.updatedAt).getTime() - new Date(req.createdAt).getTime();
                    const pct = Math.min(100, Math.round((elapsed / total) * 100));
                    const barColor = breached ? "bg-red-500" : pct > 80 ? "bg-amber-500" : "bg-emerald-500";
                    return <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />;
                  })()}
                </div>
              </div>
            </div>

            {/* Activity Log */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
                <Activity className="size-4 text-zinc-400" />
                <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Activity</h2>
              </div>
              <div className="p-5 space-y-4">
                {sortedActivity.length === 0 ? (
                  <p className="text-sm text-zinc-400 text-center py-4">No activity yet.</p>
                ) : (
                  <>
                    {visibleActivity.map((log) => <ActivityItem key={log.id} log={log} />)}
                    {!activityExpanded && hiddenCount > 0 && (
                      <button
                        onClick={() => setActivityExpanded(true)}
                        className="w-full flex items-center justify-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 py-1 transition-colors"
                      >
                        <ChevronDown className="size-3.5" />
                        Show {hiddenCount} more
                      </button>
                    )}
                    {activityExpanded && hiddenCount > 0 && (
                      <button
                        onClick={() => setActivityExpanded(false)}
                        className="w-full flex items-center justify-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 py-1 transition-colors"
                      >
                        <ChevronDown className="size-3.5 rotate-180" />
                        Show less
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      </DetailShell>

      {/* Change Status Modal */}
      {showChangeStatus && (
        <ChangeStatusModal
          currentStatus={currentStatus}
          saving={savingStatus}
          onClose={() => setShowChangeStatus(false)}
          onConfirm={handleChangeStatus}
        />
      )}

      {/* Assign Modal */}
      {showAssign && (
        <AssignModal
          currentAssignedUser={currentAssignedUser}
          currentQueueId={currentQueueId}
          saving={savingAssign}
          onClose={() => setShowAssign(false)}
          onConfirm={handleAssign}
        />
      )}
    </>
  );
}
