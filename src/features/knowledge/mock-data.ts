export type ArticleStatus = "published" | "draft" | "archived";

export interface Article {
  id: string;
  articleId: string;
  title: string;
  type: string;
  ticketType: string;
  status: ArticleStatus;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: string;
}

export const ARTICLE_TYPES = [
  "How-To Guide",
  "FAQ",
  "Troubleshooting",
  "Tutorial",
  "Policy",
  "Reference",
];

export const TICKET_TYPES = [
  "Technical Support",
  "Billing",
  "Account Issue",
  "General Inquiry",
  "Service Request",
  "Complaint",
  "Feature Request",
];

export const STATUS_STYLES: Record<ArticleStatus, string> = {
  published: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
  draft: "bg-amber-500/10 text-amber-500 border border-amber-500/20",
  archived: "bg-zinc-500/10 text-zinc-400 border border-zinc-400/20",
};

const ARTICLE_CONTENTS: Record<string, string> = {
  "ART001": `## How to Reset Your Password\n\nIf you have forgotten your password or need to reset it for security reasons, follow the steps below.\n\n### Steps\n\n1. Navigate to the login page and click **Forgot Password**.\n2. Enter the email address associated with your account.\n3. Check your inbox for a password reset email from noreply@ticketin.co.id.\n4. Click the reset link in the email — it expires in 30 minutes.\n5. Enter your new password and confirm it.\n6. Click **Save** to apply the changes.\n\n### Troubleshooting\n\n- If you don't receive the email within 5 minutes, check your spam folder.\n- Make sure you're entering the correct email address registered with your account.\n- If the link has expired, request a new reset from the login page.`,
  "ART002": `## Understanding Your Invoice\n\nThis article explains the key sections of your monthly invoice and how charges are calculated.\n\n### Invoice Sections\n\n**Header** — Invoice number, issue date, and due date.\n\n**Billing Period** — The period this invoice covers, typically one calendar month.\n\n**Line Items** — A breakdown of services used, including seat count and plan tier.\n\n**Subtotal & Tax** — Net amount before VAT, then 11% VAT added.\n\n**Total Due** — The final amount payable.\n\n### Payment Methods\n\n- Bank Transfer (BCA, Mandiri, BNI)\n- Virtual Account\n- Credit Card (Visa, Mastercard)\n\nPayments must be made within 14 days of the invoice date to avoid service interruption.`,
};

function getContent(articleId: string, title: string): string {
  return ARTICLE_CONTENTS[articleId] ??
    `## ${title}\n\nThis article is currently being written. Please check back later for the full content.\n\nIn the meantime, if you need help with this topic, please submit a support ticket and our team will assist you.`;
}

export const MOCK_ARTICLES: Article[] = [
  { id: "1",  articleId: "ART001", title: "How to Reset Your Password",              type: "How-To Guide",    ticketType: "Account Issue",       status: "published", createdAt: "2026-04-10", updatedAt: "2026-05-20", author: "Lestari N." },
  { id: "2",  articleId: "ART002", title: "Understanding Your Invoice",               type: "FAQ",             ticketType: "Billing",             status: "published", createdAt: "2026-04-12", updatedAt: "2026-05-18", author: "Hendra K." },
  { id: "3",  articleId: "ART003", title: "Troubleshooting Network Connectivity",     type: "Troubleshooting", ticketType: "Technical Support",    status: "published", createdAt: "2026-04-15", updatedAt: "2026-05-15", author: "Rizky A." },
  { id: "4",  articleId: "ART004", title: "Getting Started with the Platform",        type: "Tutorial",        ticketType: "General Inquiry",      status: "published", createdAt: "2026-04-18", updatedAt: "2026-05-12", author: "Dewi S." },
  { id: "5",  articleId: "ART005", title: "Refund and Cancellation Policy",           type: "Policy",          ticketType: "Billing",             status: "draft",     createdAt: "2026-05-01", updatedAt: "2026-05-25", author: "Hendra K." },
  { id: "6",  articleId: "ART006", title: "How to Submit a Service Request",          type: "How-To Guide",    ticketType: "Service Request",     status: "published", createdAt: "2026-04-20", updatedAt: "2026-05-10", author: "Bima P." },
  { id: "7",  articleId: "ART007", title: "Two-Factor Authentication Setup",          type: "Tutorial",        ticketType: "Account Issue",       status: "published", createdAt: "2026-04-22", updatedAt: "2026-05-08", author: "Lestari N." },
  { id: "8",  articleId: "ART008", title: "Common Error Codes Explained",             type: "Reference",       ticketType: "Technical Support",   status: "archived",  createdAt: "2026-03-10", updatedAt: "2026-04-30", author: "Rizky A." },
  { id: "9",  articleId: "ART009", title: "Upgrading Your Subscription Plan",         type: "How-To Guide",    ticketType: "Billing",             status: "published", createdAt: "2026-04-25", updatedAt: "2026-05-06", author: "Dewi S." },
  { id: "10", articleId: "ART010", title: "Data Export and Backup Guide",             type: "Tutorial",        ticketType: "General Inquiry",     status: "draft",     createdAt: "2026-05-05", updatedAt: "2026-05-27", author: "Bima P." },
  { id: "11", articleId: "ART011", title: "API Integration Documentation",            type: "Reference",       ticketType: "Technical Support",   status: "published", createdAt: "2026-04-08", updatedAt: "2026-05-04", author: "Rizky A." },
  { id: "12", articleId: "ART012", title: "Setting Up Email Notifications",           type: "How-To Guide",    ticketType: "Account Issue",       status: "published", createdAt: "2026-04-14", updatedAt: "2026-05-02", author: "Lestari N." },
  { id: "13", articleId: "ART013", title: "Privacy and Data Security Policy",         type: "Policy",          ticketType: "General Inquiry",     status: "published", createdAt: "2026-03-20", updatedAt: "2026-04-28", author: "Hendra K." },
  { id: "14", articleId: "ART014", title: "Mobile App Troubleshooting",               type: "Troubleshooting", ticketType: "Technical Support",   status: "archived",  createdAt: "2026-03-05", updatedAt: "2026-04-15", author: "Rizky A." },
  { id: "15", articleId: "ART015", title: "Team Collaboration Features Overview",     type: "FAQ",             ticketType: "General Inquiry",     status: "published", createdAt: "2026-04-28", updatedAt: "2026-05-22", author: "Dewi S." },
].map((a) => ({ ...a, content: getContent(a.articleId, a.title) })) as Article[];
