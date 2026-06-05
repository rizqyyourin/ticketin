import nodemailer from "nodemailer";
import { randomBytes } from "crypto";

function createTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

/** Generate a RFC-5322 compliant Message-ID */
export function generateMessageId(prefix: string): string {
  const rand = randomBytes(12).toString("hex");
  const domain = process.env.EMAIL_DOMAIN ?? "ticketin.co.id";
  return `<${prefix}.${rand}@${domain}>`;
}

/** Anchor thread ID for a ticket — stable per ticket number */
export function ticketThreadId(ticketNumber: string): string {
  const domain = process.env.EMAIL_DOMAIN ?? "ticketin.co.id";
  return `<thread.${ticketNumber}@${domain}>`;
}

// ─── Agent reply email ────────────────────────────────────────────────────────

interface AgentReplyEmailOptions {
  to: string;
  customerName: string;
  ticketNumber: string;
  ticketSubject: string;
  content: string;
  agentName: string;
  /** Stored Message-ID for this specific comment */
  messageId: string;
  /** Thread anchor ID — same for all emails in this ticket */
  threadId: string;
  /** Whether this is the first outbound email on this ticket */
  isFirstEmail: boolean;
}

export async function sendAgentReplyEmail({
  to,
  customerName,
  ticketNumber,
  ticketSubject,
  content,
  agentName,
  messageId,
  threadId,
  isFirstEmail,
}: AgentReplyEmailOptions) {
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e4e4e7;">
        <tr>
          <td style="background:#e5484d;padding:20px 32px;">
            <table cellpadding="0" cellspacing="0"><tr>
              <td style="background:rgba(255,255,255,0.2);border-radius:8px;width:24px;height:24px;text-align:center;vertical-align:middle;">
                <span style="color:#ffffff;font-size:11px;font-weight:900;">T</span>
              </td>
              <td style="padding-left:8px;"><span style="color:#ffffff;font-size:15px;font-weight:800;letter-spacing:-0.5px;">ticketin.</span></td>
            </tr></table>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 32px;">
            <p style="margin:0 0 4px;color:#71717a;font-size:12px;">Ticket <strong style="color:#18181b;font-family:monospace;">#${ticketNumber}</strong></p>
            <p style="margin:0 0 20px;color:#71717a;font-size:12px;">${ticketSubject}</p>
            <p style="margin:0 0 16px;color:#52525b;font-size:14px;">Hi <strong>${customerName}</strong>,</p>
            <div style="background:#f9f9f9;border-left:3px solid #e5484d;border-radius:0 8px 8px 0;padding:16px 20px;margin-bottom:20px;">
              <p style="margin:0;color:#27272a;font-size:14px;line-height:1.65;white-space:pre-wrap;">${content.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
            </div>
            <p style="margin:0;color:#71717a;font-size:12px;">— <strong>${agentName}</strong> from Ticketin Support</p>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px;border-top:1px solid #f4f4f5;">
            <p style="margin:0;color:#a1a1aa;font-size:11px;">Reply to this email to respond directly on your ticket.</p>
            <p style="margin:4px 0 0;color:#a1a1aa;font-size:11px;">
              <a href="${baseUrl}" style="color:#e5484d;text-decoration:none;">ticketin.co.id</a>
              &nbsp;·&nbsp; © 2026 Ticketin
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const headers: Record<string, string> = {
    "Message-ID": messageId,
    References: threadId,
  };
  if (!isFirstEmail) {
    headers["In-Reply-To"] = threadId;
  }

  const transporter = createTransport();
  await transporter.sendMail({
    from: `"Ticketin Support" <${process.env.SMTP_USER}>`,
    to,
    subject: `Re: [#${ticketNumber}] ${ticketSubject}`,
    html,
    headers,
  });
}

interface CsatEmailOptions {
  to: string;
  customerName: string;
  ticketNumber: string;
  ticketSubject: string;
  question: string;
  csatToken: string;
  /** Thread anchor ID */
  threadId?: string | null;
  /** Actual Message-ID of the last outbound agent email — used as In-Reply-To so Gmail threads correctly */
  lastMessageId?: string | null;
}

export async function sendCsatSurveyEmail({
  to,
  customerName,
  ticketNumber,
  ticketSubject,
  question,
  csatToken,
  threadId,
  lastMessageId,
}: CsatEmailOptions) {
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const surveyUrl = `${baseUrl}/survey/${csatToken}`;

  const dissatisfiedUrl = `${surveyUrl}?rating=dissatisfied`;
  const neutralUrl = `${surveyUrl}?rating=neutral`;
  const satisfiedUrl = `${surveyUrl}?rating=satisfied`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>How did we do?</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e4e4e7;">
          <!-- Header -->
          <tr>
            <td style="background:#e5484d;padding:24px 32px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:rgba(255,255,255,0.2);border-radius:8px;width:28px;height:28px;text-align:center;vertical-align:middle;">
                    <span style="color:#ffffff;font-size:12px;font-weight:900;">T</span>
                  </td>
                  <td style="padding-left:8px;">
                    <span style="color:#ffffff;font-size:16px;font-weight:800;letter-spacing:-0.5px;">ticketin.</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 8px;color:#71717a;font-size:13px;">Ticket <strong style="color:#18181b;font-family:monospace;">#${ticketNumber}</strong> has been resolved.</p>
              <h2 style="margin:0 0 16px;font-size:20px;font-weight:700;color:#18181b;line-height:1.3;">How did we do?</h2>
              <p style="margin:0 0 24px;color:#52525b;font-size:14px;line-height:1.6;">
                Hi <strong>${customerName}</strong>, your support ticket has been resolved. We&apos;d love to hear about your experience.
              </p>
              <p style="margin:0 0 20px;color:#18181b;font-size:14px;font-weight:600;">${question}</p>
              <!-- Rating buttons -->
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td width="30%" style="padding-right:6px;">
                    <a href="${dissatisfiedUrl}" style="display:block;text-decoration:none;background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:14px 8px;text-align:center;">
                      <div style="font-size:24px;margin-bottom:4px;">😞</div>
                      <div style="color:#ef4444;font-size:12px;font-weight:700;">Dissatisfied</div>
                    </a>
                  </td>
                  <td width="30%" style="padding:0 3px;">
                    <a href="${neutralUrl}" style="display:block;text-decoration:none;background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:14px 8px;text-align:center;">
                      <div style="font-size:24px;margin-bottom:4px;">😐</div>
                      <div style="color:#f59e0b;font-size:12px;font-weight:700;">Neutral</div>
                    </a>
                  </td>
                  <td width="30%" style="padding-left:6px;">
                    <a href="${satisfiedUrl}" style="display:block;text-decoration:none;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:14px 8px;text-align:center;">
                      <div style="font-size:24px;margin-bottom:4px;">😊</div>
                      <div style="color:#22c55e;font-size:12px;font-weight:700;">Satisfied</div>
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:20px 0 0;color:#a1a1aa;font-size:11px;line-height:1.5;">
                Clicking a rating will open a short survey page in your browser. Your response helps us improve our service.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:16px 32px;border-top:1px solid #f4f4f5;">
              <p style="margin:0;color:#a1a1aa;font-size:11px;">© 2026 Ticketin. All rights reserved.</p>
              <p style="margin:4px 0 0;color:#a1a1aa;font-size:11px;">
                You received this email because you submitted a support ticket.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  const transporter = createTransport();
  const csatMessageId = generateMessageId(`csat.${ticketNumber}`);
  // In-Reply-To should be the real last Message-ID so Gmail threads correctly.
  // Fall back to synthetic threadId only if no real Message-ID exists.
  const inReplyTo = lastMessageId ?? threadId;
  const references = [threadId, lastMessageId].filter(Boolean).join(" ");
  await transporter.sendMail({
    from: `"Ticketin Support" <${process.env.SMTP_USER}>`,
    to,
    subject: `Re: [#${ticketNumber}] ${ticketSubject}`,
    html,
    messageId: csatMessageId,
    ...(inReplyTo ? {
      inReplyTo,
      references: references || inReplyTo,
    } : {}),
  });
}
