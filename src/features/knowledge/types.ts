// Shared types and constants for Knowledge Management feature

export type KnowledgeStatus = "published" | "draft" | "archived";

export interface KnowledgeArticle {
  id: string;
  articleId: string;
  title: string;
  type: string;
  ticketType: string;
  status: KnowledgeStatus;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: { username: string } | null;
}

export const STATUS_STYLES: Record<KnowledgeStatus, string> = {
  published: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
  draft:     "bg-amber-500/10 text-amber-500 border border-amber-500/20",
  archived:  "bg-zinc-500/10 text-zinc-400 border border-zinc-400/20",
};

export const ARTICLE_TYPES = [
  "How-To Guide", "FAQ", "Troubleshooting", "Tutorial", "Policy", "Reference",
];

export const TICKET_TYPES = [
  "Technical Support", "Billing", "Account Issue",
  "General Inquiry", "Service Request", "Complaint", "Feature Request",
];
