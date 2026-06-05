import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendCsatSurveyEmail } from "@/lib/email";
import { randomBytes } from "crypto";

// Public endpoint — protected by shared secret, NOT NextAuth
// Example caller: IMAP poll script or email-forwarding webhook

export async function POST(request: Request) {
  const body = await request.json();

  // Secret validation
  const expectedSecret = process.env.INBOUND_EMAIL_SECRET;
  if (!expectedSecret || body.secret !== expectedSecret) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const {
    subject,
  }: {
    subject?: string;
  } = body;

  // Normalize to string — mailparser can return arrays or objects
  const toStr = (v: unknown): string => {
    if (!v) return "";
    if (Array.isArray(v)) return v.join(" ");
    if (typeof v === "object") return String(v);
    return String(v);
  };

  const inReplyToStr = toStr(body.inReplyTo);
  const referencesStr = toStr(body.references);
  const rawText: string = toStr(body.text);
  const from: string = toStr(body.from);

  // Strip quoted reply history — keep only the new content the customer wrote
  const stripQuoted = (t: string): string => {
    const lines = t.split("\n");
    const cutIdx = lines.findIndex(
      (l, i) =>
        l.trimStart().startsWith(">") ||
        /^On .+wrote:/i.test(l) ||
        /^Pada .+menulis:/i.test(l) ||
        // Gmail Indonesian: "Pada [date] [name] <email>" on one line, "menulis:" on next
        // Also handles line-wrapped form: "Pada ... <\n email> menulis:"
        (/^Pada /i.test(l.trim()) && (
          lines[i + 1]?.trim() === "menulis:" ||
          /^menulis:/i.test(lines[i + 1] ?? "") ||
          />\s*menulis:$/i.test(lines[i + 1] ?? "")
        )) ||
        /^-{3,}\s*Original Message/i.test(l)
    );
    const clean = (cutIdx === -1 ? lines : lines.slice(0, cutIdx))
      .join("\n")
      .trim();
    return clean || t.trim();
  };
  const text = stripQuoted(rawText);

  if (!from || !text) {
    return NextResponse.json({ error: "from and text required" }, { status: 400 });
  }

  // Parse all reference IDs — split on whitespace OR commas (Gmail uses commas)
  const splitRefs = (s: string) => s.split(/[\s,]+/).filter(Boolean);
  const refIds: string[] = [];
  if (inReplyToStr) refIds.push(...splitRefs(inReplyToStr));
  if (referencesStr) refIds.push(...splitRefs(referencesStr));

  // Deduplicate
  const uniqueRefIds = [...new Set(refIds)];

  // Find the ticket matching any of the thread IDs
  const ticket = uniqueRefIds.length
    ? await prisma.serviceRequest.findFirst({
        where: { emailThreadId: { in: uniqueRefIds } },
        select: { id: true, ticketNumber: true, contact: { select: { email: true } } },
      })
    : null;

  if (!ticket) {
    // Could not match to a ticket — log and return 200 so caller doesn't retry
    console.warn("[Inbound] No ticket matched for references:", refIds, "subject:", subject);
    return NextResponse.json({ status: "unmatched" });
  }

  // Create comment as customer
  await prisma.comment.create({
    data: {
      content: text,
      role: "customer",
      authorId: null,
      serviceRequestId: ticket.id,
      emailMessageId: null,
    },
  });

  // Activity log
  await prisma.activityLog.create({
    data: {
      type: "comment",
      detail: `Inbound email reply from ${from}`,
      actorId: null,
      serviceRequestId: ticket.id,
    },
  });

  // ── CSAT trigger: every_reply ──────────────────────────────────────────────
  const csatSettings = await prisma.csatSettings.findFirst();
  if (csatSettings?.enabled && csatSettings.trigger === "every_reply") {
    try {
      const sr = await prisma.serviceRequest.findUnique({
        where: { id: ticket.id },
        select: { status: true, emailThreadId: true, subject: true, contact: { select: { customerName: true, email: true } }, ticketNumber: true },
      });
      if (sr && sr.status !== "resolved" && sr.status !== "closed") {
        await prisma.csatSurvey.deleteMany({ where: { serviceRequestId: ticket.id } });
        const csatToken = randomBytes(24).toString("hex");
        await prisma.serviceRequest.update({
          where: { id: ticket.id },
          data: { csatToken, csatSentAt: new Date() },
        });
        sendCsatSurveyEmail({
          to: sr.contact.email,
          customerName: sr.contact.customerName,
          ticketNumber: sr.ticketNumber,
          ticketSubject: sr.subject,
          question: csatSettings.question,
          csatToken,
          threadId: sr.emailThreadId,
          lastMessageId: await prisma.comment.findFirst({
            where: { serviceRequestId: ticket.id, emailMessageId: { not: null } },
            orderBy: { createdAt: "desc" },
            select: { emailMessageId: true },
          }).then((c) => c?.emailMessageId ?? null),
        }).catch((err) => console.error("[CSAT] Failed to send survey email (every_reply):", err));
      }
    } catch (err) {
      console.error("[CSAT] every_reply setup failed:", err);
    }
  }

  return NextResponse.json({ status: "ok", ticketId: ticket.id });
}
