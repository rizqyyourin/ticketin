import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sendAgentReplyEmail, sendCsatSurveyEmail, generateMessageId, ticketThreadId } from "@/lib/email";
import { randomBytes } from "crypto";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const comments = await prisma.comment.findMany({
    where: { serviceRequestId: id },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      content: true,
      role: true,
      emailMessageId: true,
      createdAt: true,
      serviceRequestId: true,
      authorId: true,
      author: { select: { username: true } },
    },
  });

  return NextResponse.json(comments);
}

export async function POST(request: Request, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const { content, role } = body;

  if (!content) {
    return NextResponse.json({ error: "content is required" }, { status: 400 });
  }

  // Fetch ticket + contact for email threading
  const ticket = await prisma.serviceRequest.findUnique({
    where: { id },
    select: {
      ticketNumber: true,
      subject: true,
      status: true,
      emailThreadId: true,
      contact: { select: { customerName: true, email: true } },
    },
  });

  if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const commentRole = role ?? "agent";
  const messageId = generateMessageId(`comment.${id}`);

  const comment = await prisma.comment.create({
    data: {
      content,
      role: commentRole,
      authorId: session.user?.id ?? null,
      serviceRequestId: id,
      emailMessageId: commentRole === "agent" ? messageId : null,
    },
    include: {
      author: { select: { username: true } },
    },
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      type: "comment",
      detail: "Comment added",
      actorId: session.user?.id ?? null,
      serviceRequestId: id,
    },
  });

  // ── Send outbound email for agent comments ──────────────────────────────────
  if (commentRole === "agent") {
    const threadId = ticket.emailThreadId ?? ticketThreadId(ticket.ticketNumber);
    const isFirstEmail = !ticket.emailThreadId;

    // Persist threadId on first email
    if (isFirstEmail) {
      await prisma.serviceRequest.update({
        where: { id },
        data: { emailThreadId: threadId },
      });
    }

    const agentName = session.user?.name ?? "Support Agent";

    // Non-blocking — don't let email failure break the comment
    sendAgentReplyEmail({
      to: ticket.contact.email,
      customerName: ticket.contact.customerName,
      ticketNumber: ticket.ticketNumber,
      ticketSubject: ticket.subject,
      content,
      agentName,
      messageId,
      threadId,
      isFirstEmail,
    }).catch((err) => console.error("[Email] Failed to send agent reply:", err));
  }

  // ── CSAT trigger: every_reply ─────────────────────────────────────────────
  if (commentRole === "agent" && ticket.status !== "resolved" && ticket.status !== "closed") {
    const csatSettings = await prisma.csatSettings.findFirst();
    if (csatSettings?.enabled && csatSettings.trigger === "every_reply") {
      try {
        await prisma.csatSurvey.deleteMany({ where: { serviceRequestId: id } });
        const csatToken = randomBytes(24).toString("hex");
        await prisma.serviceRequest.update({
          where: { id },
          data: { csatToken, csatSentAt: new Date() },
        });
        sendCsatSurveyEmail({
          to: ticket.contact.email,
          customerName: ticket.contact.customerName,
          ticketNumber: ticket.ticketNumber,
          ticketSubject: ticket.subject,
          question: csatSettings.question,
          csatToken,
          threadId: ticket.emailThreadId ?? ticketThreadId(ticket.ticketNumber),
          lastMessageId: messageId,
        }).catch((err) => console.error("[CSAT] Failed to send survey email (every_reply):", err));
      } catch (err) {
        console.error("[CSAT] every_reply setup failed:", err);
      }
    }
  }

  return NextResponse.json(comment, { status: 201 });
}

 