// ─── Enums ────────────────────────────────────────────────────────────────────

export type Priority = "low" | "medium" | "high";
export type Status = "new" | "open" | "in_progress" | "pending" | "resolved" | "closed";
export type CommentRole = "agent" | "customer" | "system";
export type ActivityLogType = "created" | "status_change" | "assignment" | "comment";

// ─── SLA ─────────────────────────────────────────────────────────────────────

export const SLA_HOURS: Record<Priority, number> = {
  low: 24,
  medium: 12,
  high: 8,
};

// ─── Queue types ──────────────────────────────────────────────────────────────

export interface QueueMemberUser {
  id: string;
  username: string;
  email: string;
}

export interface QueueWithMembers {
  id: string;
  queueId: string;
  name: string;
  status: string;
  members: Array<{
    id: string;
    userId: string;
    user: QueueMemberUser;
  }>;
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface SRContact {
  id: string;
  customerName: string;
  email: string;
  phone?: string | null;
  organization?: string | null;
}

export interface SRAssignedUser {
  id: string;
  username: string;
  email: string;
}

export interface SRQueue {
  id: string;
  name: string;
}

export interface SRComment {
  id: string;
  content: string;
  role: CommentRole;
  createdAt: string; // ISO
  serviceRequestId: string;
  authorId: string | null;
  emailMessageId: string | null;
  author: { username: string } | null;
}

export interface SRActivityLog {
  id: string;
  type: ActivityLogType;
  detail: string;
  createdAt: string; // ISO
  actor: { username: string } | null;
}

/** Full detail shape — returned by GET /api/service-requests/:id */
export interface ServiceRequestDetail {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  category: string;
  priority: Priority;
  status: Status;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  contact: SRContact;
  assignedUser: SRAssignedUser | null;
  queue: SRQueue | null;
  comments: SRComment[];
  activityLogs: SRActivityLog[];
  csatSentAt: string | null;
}

/** List item shape — returned by GET /api/service-requests */
export interface ServiceRequestListItem {
  id: string;
  ticketNumber: string;
  subject: string;
  category: string;
  priority: Priority;
  status: Status;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  contact: { customerName: string; email: string };
  assignedUser: { username: string } | null;
  queue: { name: string } | null;
}
