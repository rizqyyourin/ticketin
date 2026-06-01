"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
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
} from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import {
  ALL_REQUESTS,
  QUEUE_AGENTS,
  type Priority,
  type Status,
  type Comment,
  type ActivityLog,
  SLA_HOURS,
} from "@/features/service-request/mock-data";
import { getLocalItems } from "@/lib/local-store";

function reviveSR(raw: unknown[]): import("@/features/service-request/mock-data").ServiceRequest[] {
  return (raw as Array<Record<string, unknown>>).map((r) => ({
    ...r,
    createdAt: new Date(r.createdAt as string),
    updatedAt: new Date(r.updatedAt as string),
    dueDate: new Date(r.dueDate as string),
    activityLog: ((r.activityLog ?? []) as Array<Record<string, unknown>>).map((a) => ({ ...a, createdAt: new Date(a.createdAt as string) })),
    comments: ((r.comments ?? []) as Array<Record<string, unknown>>).map((c) => ({ ...c, createdAt: new Date(c.createdAt as string) })),
  })) as import("@/features/service-request/mock-data").ServiceRequest[];
}

// ─── Status transitions (flow documentation) ─────────────────────────────────
//
// open        → in_progress | closed
// in_progress → pending | resolved | closed
// pending     → in_progress | closed
// resolved    → closed
// closed      → (terminal)

const STATUS_TRANSITIONS: Record<Status, Array<{ status: Status; hint: string }>> = {
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
  open: { badge: "bg-blue-500/10 text-blue-500 border border-blue-500/20", label: "Open", dot: "bg-blue-500" },
  in_progress: { badge: "bg-violet-500/10 text-violet-500 border border-violet-500/20", label: "In Progress", dot: "bg-violet-500" },
  pending: { badge: "bg-amber-500/10 text-amber-600 border border-amber-500/20", label: "Pending", dot: "bg-amber-500" },
  resolved: { badge: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20", label: "Resolved", dot: "bg-emerald-500" },
  closed: { badge: "bg-zinc-500/10 text-zinc-500 border border-zinc-500/20", label: "Closed", dot: "bg-zinc-400" },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isBreached(dueDate: Date): boolean {
  return new Date() > dueDate;
}

function formatDateTime(date: Date) {
  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function getSlaRemaining(dueDate: Date): { label: string; color: string } {
  const now = new Date();
  const diffMs = dueDate.getTime() - now.getTime();
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

function CommentBubble({ comment }: { comment: Comment }) {
  const isAgent = comment.role === "agent";
  const isSystem = comment.role === "system";

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
        {comment.author.charAt(0)}
      </div>
      <div className={`max-w-[75%] flex flex-col gap-1 ${isAgent ? "" : "items-end"}`}>
        <div className={`flex items-center gap-2 ${isAgent ? "" : "flex-row-reverse"}`}>
          <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{comment.author}</span>
          <span className="text-xs text-zinc-400">{formatDateTime(comment.createdAt)}</span>
        </div>
        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
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

function ActivityItem({ log }: { log: ActivityLog }) {
  const iconMap: Record<ActivityLog["type"], React.ReactNode> = {
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
        <p className="text-xs text-zinc-400 mt-0.5">{log.actor} · {formatDateTime(log.createdAt)}</p>
      </div>
    </div>
  );
}

// ─── Change Status Modal ──────────────────────────────────────────────────────

function ChangeStatusModal({
  currentStatus,
  onClose,
  onConfirm,
}: {
  currentStatus: Status;
  onClose: () => void;
  onConfirm: (status: Status) => void;
}) {
  const transitions = STATUS_TRANSITIONS[currentStatus];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 w-full max-w-sm mx-4 shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Change Status</h3>
          <button
            onClick={onClose}
            className="size-7 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors"
          >
            <X className="size-4 text-zinc-400" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">Current:</span>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-semibold ${STATUS_STYLES[currentStatus].badge}`}>
              <span className={`size-1.5 rounded-full ${STATUS_STYLES[currentStatus].dot}`} />
              {STATUS_STYLES[currentStatus].label}
            </span>
          </div>

          {transitions.length === 0 ? (
            <p className="text-sm text-zinc-400 py-4 text-center">
              This ticket is closed and cannot be changed.
            </p>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-zinc-400 font-medium uppercase tracking-wide">Move to</p>
              {transitions.map(({ status, hint }) => {
                const s = STATUS_STYLES[status];
                return (
                  <button
                    key={status}
                    onClick={() => onConfirm(status)}
                    className="w-full flex items-start gap-3 px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
                  >
                    <span className={`mt-0.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold flex-shrink-0 ${s.badge}`}>
                      <span className={`size-1.5 rounded-full ${s.dot}`} />
                      {s.label}
                    </span>
                    <span className="text-xs text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors leading-relaxed">
                      {hint}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Assign Modal ─────────────────────────────────────────────────────────────

function AssignModal({
  currentAssignedTo,
  category,
  onClose,
  onConfirm,
}: {
  currentAssignedTo: string | null;
  category: string;
  onClose: () => void;
  onConfirm: (agentName: string | null) => void;
}) {
  const inQueue = QUEUE_AGENTS.filter((a) => a.queues.includes(category));
  const others = QUEUE_AGENTS.filter((a) => !a.queues.includes(category));

  const AgentCard = ({ agent }: { agent: typeof QUEUE_AGENTS[0] }) => {
    const isSelected = agent.name === currentAssignedTo;
    return (
      <button
        key={agent.id}
        onClick={() => onConfirm(agent.name)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${
          isSelected
            ? "border-primary/50 bg-primary/5"
            : "border-zinc-200 dark:border-zinc-700 hover:border-primary/30 hover:bg-zinc-50 dark:hover:bg-zinc-800"
        }`}
      >
        <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
          {agent.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{agent.name}</p>
          <p className="text-xs text-zinc-400">{agent.role} · {agent.email}</p>
        </div>
        {isSelected && <Check className="size-4 text-primary flex-shrink-0" />}
      </button>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 w-full max-w-sm mx-4 shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Assign Ticket</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Queue: {category}</p>
          </div>
          <button
            onClick={onClose}
            className="size-7 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors"
          >
            <X className="size-4 text-zinc-400" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {currentAssignedTo && (
            <button
              onClick={() => onConfirm(null)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-500/5 transition-all text-sm text-zinc-500 hover:text-red-500"
            >
              <X className="size-4" />
              Unassign
            </button>
          )}

          {inQueue.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">In Queue</p>
              {inQueue.map((a) => <AgentCard key={a.id} agent={a} />)}
            </div>
          )}

          {others.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Other Agents</p>
              {others.map((a) => <AgentCard key={a.id} agent={a} />)}
            </div>
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
  const allReqs = [...reviveSR(getLocalItems("sr")), ...ALL_REQUESTS];
  const req = allReqs.find((r) => r.id === id);

  const [currentStatus, setCurrentStatus] = useState<Status>(req?.status ?? "open");
  const [currentAssignedTo, setCurrentAssignedTo] = useState<string | null>(req?.assignedTo ?? null);
  const [showChangeStatus, setShowChangeStatus] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [activityExpanded, setActivityExpanded] = useState(false);
  const [comments, setComments] = useState<Comment[]>(req?.comments ?? []);
  const [commentInput, setCommentInput] = useState("");

  if (!req) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <ClipboardList className="size-12 text-zinc-300" />
        <p className="text-zinc-500 text-sm">Service request not found.</p>
        <Link
          href="/dashboard/service-request"
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

  const sortedActivity = [...req.activityLog].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );
  const visibleActivity = activityExpanded
    ? sortedActivity
    : sortedActivity.slice(0, ACTIVITY_PREVIEW);
  const hiddenCount = sortedActivity.length - ACTIVITY_PREVIEW;

  return (
    <>
      <div className="p-6 space-y-5 max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Service Request", href: "/dashboard/service-request" },
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

          {/* Action buttons — Add Comment removed (will use email SMTP) */}
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
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
                <MessageSquare className="size-4 text-zinc-400" />
                <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  Comments
                  {comments.length > 0 && (
                    <span className="ml-2 text-xs font-normal text-zinc-400">({comments.length})</span>
                  )}
                </h2>
              </div>
              <div className="p-5 space-y-4">
                {comments.length === 0 ? (
                  <p className="text-sm text-zinc-400 text-center py-6">No comments yet.</p>
                ) : (
                  comments.map((c) => <CommentBubble key={c.id} comment={c} />)
                )}
              </div>

              {/* Comment input */}
              <div className="px-5 pb-5">
                <div className="flex gap-3">
                  <div className="size-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    A
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
                      onClick={() => {
                        const text = commentInput.trim();
                        if (!text) return;
                        const newComment: Comment = {
                          id: `c-new-${Date.now()}`,
                          author: "Admin",
                          role: "agent",
                          content: text,
                          createdAt: new Date(),
                        };
                        setComments((prev) => [...prev, newComment]);
                        setCommentInput("");
                      }}
                      className="absolute bottom-3 right-3 px-3 py-1 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors"
                    >
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
              {/* Header: title + status/priority badges on the right */}
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
                    <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{req.customerName}</p>
                    <p className="text-xs text-zinc-400">{req.customerEmail}</p>
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
                  currentAssignedTo ? (
                    <span>{currentAssignedTo}</span>
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
                    const elapsed = req.updatedAt.getTime() - req.createdAt.getTime();
                    const pct = Math.min(100, Math.round((elapsed / total) * 100));
                    const barColor = breached ? "bg-red-500" : pct > 80 ? "bg-amber-500" : "bg-emerald-500";
                    return <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />;
                  })()}
                </div>
              </div>
            </div>

            {/* Activity Log — max 3 preview, expand to show all */}
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
      </div>

      {/* Change Status Modal */}
      {showChangeStatus && (
        <ChangeStatusModal
          currentStatus={currentStatus}
          onClose={() => setShowChangeStatus(false)}
          onConfirm={(status) => {
            setCurrentStatus(status);
            setShowChangeStatus(false);
          }}
        />
      )}

      {/* Assign Modal */}
      {showAssign && (
        <AssignModal
          currentAssignedTo={currentAssignedTo}
          category={req.category}
          onClose={() => setShowAssign(false)}
          onConfirm={(agentName) => {
            setCurrentAssignedTo(agentName);
            setShowAssign(false);
          }}
        />
      )}
    </>
  );
}

