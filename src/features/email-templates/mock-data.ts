export interface EmailTemplate {
  id: string;
  name: string;
  folder: string;
  description: string;
  lastUsed: string;
  subject: string;
  body: string;
}

export const FOLDER_COLORS: Record<string, string> = {
  "Onboarding":      "bg-blue-500/10 text-blue-500",
  "Service Request": "bg-primary/10 text-primary",
  "Feedback":        "bg-purple-500/10 text-purple-500",
  "Auth":            "bg-zinc-500/10 text-zinc-500",
  "Billing":         "bg-amber-500/10 text-amber-500",
  "Support":         "bg-cyan-500/10 text-cyan-500",
  "Alerts":          "bg-red-500/10 text-red-500",
  "Marketing":       "bg-pink-500/10 text-pink-500",
};

export const FOLDERS = Object.keys(FOLDER_COLORS);

export const MOCK_TEMPLATES: EmailTemplate[] = [
  {
    id: "1", name: "Welcome Email", folder: "Onboarding",
    description: "Sent to new customers upon account creation",
    lastUsed: "2026-05-27",
    subject: "Welcome to Ticketin! 🎉",
    body: `Hi {{customer_name}},\n\nWelcome to Ticketin! We're thrilled to have you on board.\n\nYour account has been created successfully. Here's what you can do next:\n\n- Submit support tickets directly from the portal\n- Track the status of your requests in real-time\n- Access our knowledge base for instant answers\n\nIf you have any questions, our support team is here to help.\n\nBest regards,\nThe Ticketin Team`,
  },
  {
    id: "2", name: "Ticket Created", folder: "Service Request",
    description: "Confirmation email when a new ticket is submitted",
    lastUsed: "2026-05-27",
    subject: "Ticket #{{ticket_number}} — We've received your request",
    body: `Hi {{customer_name}},\n\nThank you for reaching out. We've received your support ticket and our team will be in touch shortly.\n\nTicket Details:\n- Ticket Number: {{ticket_number}}\n- Subject: {{ticket_subject}}\n- Priority: {{priority}}\n- SLA Deadline: {{sla_deadline}}\n\nYou can track your ticket status at any time by logging into the support portal.\n\nBest regards,\nTicketin Support Team`,
  },
  {
    id: "3", name: "Ticket Resolved", folder: "Service Request",
    description: "Notify customer when their ticket has been resolved",
    lastUsed: "2026-05-26",
    subject: "Ticket #{{ticket_number}} has been resolved",
    body: `Hi {{customer_name}},\n\nGreat news! Your support ticket {{ticket_number}} has been resolved by our team.\n\nResolution Summary:\n{{resolution_notes}}\n\nIf you're satisfied with the resolution, no further action is needed. If you still experience issues, please reply to this email or submit a new ticket.\n\nThank you for your patience.\n\nBest regards,\nTicketin Support Team`,
  },
  {
    id: "4", name: "CSAT Survey Invite", folder: "Feedback",
    description: "Sends CSAT survey link after ticket closure",
    lastUsed: "2026-05-26",
    subject: "How did we do? Share your feedback 💬",
    body: `Hi {{customer_name}},\n\nYour support ticket #{{ticket_number}} has been closed. We'd love to hear about your experience!\n\nPlease take a moment to rate our support:\n\n[Dissatisfied] [Neutral] [Satisfied]\n\nYour feedback helps us improve our service for everyone.\n\nThank you,\nTicketin Support Team`,
  },
  {
    id: "5", name: "Password Reset", folder: "Auth",
    description: "Password reset link for account recovery",
    lastUsed: "2026-05-25",
    subject: "Reset your Ticketin password",
    body: `Hi {{customer_name}},\n\nWe received a request to reset your password. Click the link below to create a new password:\n\n{{reset_link}}\n\nThis link expires in 30 minutes. If you did not request a password reset, you can safely ignore this email.\n\nBest regards,\nTicketin Security Team`,
  },
  {
    id: "6", name: "Invoice Reminder", folder: "Billing",
    description: "Reminder sent 3 days before invoice due date",
    lastUsed: "2026-05-24",
    subject: "Invoice #{{invoice_number}} is due in 3 days",
    body: `Hi {{customer_name}},\n\nThis is a friendly reminder that Invoice #{{invoice_number}} for {{amount}} is due on {{due_date}}.\n\nYou can view and pay your invoice by logging into your billing portal.\n\nIf you have any questions about your invoice, please contact our billing team.\n\nBest regards,\nTicketin Billing Team`,
  },
  {
    id: "7", name: "Payment Confirmation", folder: "Billing",
    description: "Confirmation receipt after successful payment",
    lastUsed: "2026-05-23",
    subject: "Payment confirmed — Invoice #{{invoice_number}}",
    body: `Hi {{customer_name}},\n\nWe've received your payment. Here are the details:\n\n- Invoice: #{{invoice_number}}\n- Amount Paid: {{amount}}\n- Payment Date: {{payment_date}}\n- Method: {{payment_method}}\n\nA receipt has been attached to this email for your records.\n\nThank you for your payment!\n\nBest regards,\nTicketin Billing Team`,
  },
  {
    id: "8", name: "Escalation Notice", folder: "Service Request",
    description: "Alert customer when ticket is escalated",
    lastUsed: "2026-05-22",
    subject: "Your ticket #{{ticket_number}} has been escalated",
    body: `Hi {{customer_name}},\n\nWe wanted to let you know that your ticket #{{ticket_number}} has been escalated to our senior support team for further investigation.\n\nEscalation Reason: {{escalation_reason}}\n\nOur senior team will review your case and respond within {{sla_hours}} hours.\n\nWe apologize for any inconvenience and appreciate your patience.\n\nBest regards,\nTicketin Support Team`,
  },
  {
    id: "9", name: "Agent Assignment", folder: "Service Request",
    description: "Notify customer when an agent is assigned",
    lastUsed: "2026-05-21",
    subject: "An agent has been assigned to your ticket #{{ticket_number}}",
    body: `Hi {{customer_name}},\n\nGood news! A support agent has been assigned to your ticket #{{ticket_number}}.\n\nAssigned Agent: {{agent_name}}\n\n{{agent_name}} will review your request and get back to you within the SLA timeframe.\n\nBest regards,\nTicketin Support Team`,
  },
  {
    id: "10", name: "Follow Up", folder: "Support",
    description: "Sent if ticket remains open for more than 48 hours",
    lastUsed: "2026-05-20",
    subject: "Following up on your ticket #{{ticket_number}}",
    body: `Hi {{customer_name}},\n\nWe noticed your ticket #{{ticket_number}} has been open for more than 48 hours. We wanted to check in and make sure you're being helped.\n\nIf your issue has been resolved, you can close the ticket from the portal. If you need further assistance, please reply to this email.\n\nBest regards,\nTicketin Support Team`,
  },
  {
    id: "11", name: "SLA Breach Alert", folder: "Alerts",
    description: "Internal alert when SLA deadline is approaching",
    lastUsed: "2026-05-19",
    subject: "[ALERT] SLA breach warning — Ticket #{{ticket_number}}",
    body: `INTERNAL ALERT\n\nTicket #{{ticket_number}} is approaching its SLA deadline.\n\n- Customer: {{customer_name}}\n- Priority: {{priority}}\n- SLA Deadline: {{sla_deadline}}\n- Time Remaining: {{time_remaining}}\n- Assigned To: {{agent_name}}\n\nPlease take immediate action to resolve this ticket before the SLA breach.\n\n— Ticketin System`,
  },
  {
    id: "12", name: "Account Deactivation", folder: "Auth",
    description: "Notifies user when their account is deactivated",
    lastUsed: "2026-05-15",
    subject: "Your Ticketin account has been deactivated",
    body: `Hi {{customer_name}},\n\nYour Ticketin account has been deactivated as of {{deactivation_date}}.\n\nReason: {{deactivation_reason}}\n\nIf you believe this is a mistake or would like to reactivate your account, please contact our support team.\n\nBest regards,\nTicketin Account Team`,
  },
  {
    id: "13", name: "New Feature Announcement", folder: "Marketing",
    description: "Newsletter-style template for new feature releases",
    lastUsed: "2026-05-10",
    subject: "Introducing {{feature_name}} — Now available in Ticketin!",
    body: `Hi {{customer_name}},\n\nWe're excited to announce the launch of {{feature_name}}!\n\nWhat's new:\n{{feature_description}}\n\nHow to get started:\n{{getting_started_steps}}\n\nWe'd love to hear your feedback on this new feature.\n\nBest regards,\nThe Ticketin Product Team`,
  },
  {
    id: "14", name: "Maintenance Notice", folder: "Alerts",
    description: "Scheduled maintenance window notification",
    lastUsed: "2026-05-05",
    subject: "Scheduled maintenance — {{maintenance_date}}",
    body: `Hi {{customer_name}},\n\nWe will be performing scheduled maintenance on our systems.\n\nMaintenance Window:\n- Start: {{start_time}}\n- End: {{end_time}}\n- Duration: {{duration}}\n\nDuring this time, the support portal may be temporarily unavailable. We apologize for any inconvenience.\n\nBest regards,\nTicketin Infrastructure Team`,
  },
  {
    id: "15", name: "Re-engagement", folder: "Marketing",
    description: "Sent to customers who have been inactive for 30+ days",
    lastUsed: "2026-04-28",
    subject: "We miss you! Come back to Ticketin",
    body: `Hi {{customer_name}},\n\nWe noticed you haven't logged in for a while. We've made some improvements you might love!\n\nWhat's new:\n- Improved ticket dashboard with real-time updates\n- Faster response times from our support team\n- New knowledge base articles for common issues\n\nLog in now and see what's new. If you need any help, our team is always here.\n\nBest regards,\nThe Ticketin Team`,
  },
];
