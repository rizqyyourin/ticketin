import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sendCsatSurveyEmail } from "@/lib/email";
import { randomBytes } from "crypto";

type Params = { params: Promise<{ id: string }> };

const ESCALATION_MINUTES = 5;

/**
 * Check if the currently assigned agent has failed to respond within the SLA window.
 * If so, auto-escalate to the next member in the queue (round-robin by QueueMember.id order).
 * Returns the (possibly mutated) ticket to be sent back to the client.
 */
async function checkAndEscalate(ticketId: string) {
  const ticket = await prisma.serviceRequest.findUnique({
    where: { id: ticketId },
    include: {
      contact: true,
      assignedUser: { select: { id: true, username: true, email: true } },
      queue: true,
      comments: {
        include: { author: { select: { username: true } } },
        orderBy: { createdAt: "asc" },
      },
      activityLogs: {
        include: { actor: { select: { username: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!ticket) return null;

  // No queue at all → nothing to do
  if (!ticket.queueId) return ticket;

  // Only handle active statuses
  if (ticket.status === "resolved" || ticket.status === "closed") return ticket;

  // ── Case: queue assigned but no specific agent yet → assign to first member ──
  if (!ticket.assignedTo && ticket.queueId) {
    const members = await prisma.queueMember.findMany({
      where: { queueId: ticket.queueId },
      include: { user: { select: { id: true, username: true, email: true } } },
      orderBy: { id: "asc" },
    });
    if (members.length === 0) return ticket;
    const first = members[0];
    const assigned = await prisma.serviceRequest.update({
      where: { id: ticketId },
      data: {
        assignedTo: first.userId,
        activityLogs: {
          create: {
            type: "assignment",
            detail: `Auto-assigned to ${first.user.username} (first available in queue)`,
            actorId: null,
          },
        },
      },
      include: {
        contact: true,
        assignedUser: { select: { id: true, username: true, email: true } },
        queue: true,
        comments: {
          include: { author: { select: { username: true } } },
          orderBy: { createdAt: "asc" },
        },
        activityLogs: {
          include: { actor: { select: { username: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    });
    return assigned;
  }

  // Only escalate if ticket is assigned to a user AND has a queue
  if (!ticket.assignedTo || !ticket.queueId) return ticket;

  // Find last assignment activity log
  const lastAssignment = ticket.activityLogs.find((l) => l.type === "assignment");
  if (!lastAssignment) return ticket;

  const minutesSince = (Date.now() - new Date(lastAssignment.createdAt).getTime()) / 60_000;
  if (minutesSince < ESCALATION_MINUTES) return ticket;

  // Check if assigned user has commented since last assignment
  const hasResponded = ticket.comments.some(
    (c) =>
      c.authorId === ticket.assignedTo &&
      new Date(c.createdAt) > new Date(lastAssignment.createdAt)
  );
  if (hasResponded) return ticket;

  // Get queue members ordered by id (creation order = queue order)
  const members = await prisma.queueMember.findMany({
    where: { queueId: ticket.queueId },
    include: { user: { select: { id: true, username: true, email: true } } },
    orderBy: { id: "asc" },
  });

  if (members.length <= 1) return ticket; // No next member to escalate to

  const currentIdx = members.findIndex((m) => m.userId === ticket.assignedTo);
  const nextMember = members[(currentIdx + 1) % members.length];

  // Avoid escalating back to same user if queue has only 1 member
  if (nextMember.userId === ticket.assignedTo) return ticket;

  // Perform escalation
  const escalated = await prisma.serviceRequest.update({
    where: { id: ticketId },
    data: {
      assignedTo: nextMember.userId,
      activityLogs: {
        create: {
          type: "assignment",
          detail: `Auto-escalated to ${nextMember.user.username} (no response within ${ESCALATION_MINUTES} min)`,
          actorId: null,
        },
      },
    },
    include: {
      contact: true,
      assignedUser: { select: { id: true, username: true, email: true } },
      queue: true,
      comments: {
        include: { author: { select: { username: true } } },
        orderBy: { createdAt: "asc" },
      },
      activityLogs: {
        include: { actor: { select: { username: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return escalated;
}

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const ticket = await checkAndEscalate(id);

  if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(ticket);
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const { status, assignedTo, queueId, ...rest } = body;

  const current = await prisma.serviceRequest.findUnique({
    where: { id },
    select: { status: true, assignedTo: true, queueId: true, emailThreadId: true },
  });
  if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const actorId = session.user?.id ?? null;
  const activityEntries: { type: "status_change" | "assignment"; detail: string; actorId: string | null }[] = [];

  if (status && status !== current.status) {
    activityEntries.push({
      type: "status_change",
      detail: `Status changed from ${current.status} to ${status}`,
      actorId,
    });
  }

  if (assignedTo !== undefined && assignedTo !== current.assignedTo) {
    let assignLabel = "Unassigned";
    if (assignedTo !== null) {
      const assignedUser = await prisma.user.findUnique({
        where: { id: assignedTo },
        select: { username: true },
      });
      assignLabel = `Assigned to ${assignedUser?.username ?? assignedTo}`;
    }
    activityEntries.push({
      type: "assignment",
      detail: assignLabel,
      actorId,
    });
  } else if (queueId !== undefined && queueId !== current.queueId && (assignedTo === undefined || assignedTo === null)) {
    // Queue-only assignment — resolve to first member immediately
    if (queueId !== null) {
      const queue = await prisma.queue.findUnique({ where: { id: queueId }, select: { name: true } });
      const firstMember = await prisma.queueMember.findFirst({
        where: { queueId },
        include: { user: { select: { id: true, username: true } } },
        orderBy: { id: "asc" },
      });
      if (firstMember) {
        // Override assignedTo to the first member
        body.assignedTo = firstMember.userId;
        activityEntries.push({
          type: "assignment",
          detail: `Auto-assigned to ${firstMember.user.username} via queue ${queue?.name ?? queueId}`,
          actorId,
        });
      } else {
        activityEntries.push({
          type: "assignment",
          detail: `Assigned to queue ${queue?.name ?? queueId} (no agents available)`,
          actorId,
        });
      }
    }
  }

  // resolvedAssignedTo may have been overridden by queue auto-assign above
  const resolvedAssignedTo = body.assignedTo as string | null | undefined;

  const ticket = await prisma.serviceRequest.update({
    where: { id },
    data: {
      ...rest,
      ...(status ? { status } : {}),
      ...(resolvedAssignedTo !== undefined ? { assignedTo: resolvedAssignedTo } : {}),
      ...(queueId !== undefined ? { queueId } : {}),
      ...(activityEntries.length > 0
        ? { activityLogs: { create: activityEntries } }
        : {}),
    },
    include: {
      contact: true,
      assignedUser: { select: { id: true, username: true, email: true } },
      queue: { select: { id: true, name: true } },
      activityLogs: {
        include: { actor: { select: { username: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  // ── CSAT trigger on status → resolved ──────────────────────────────────────
  if (status === "resolved" && current.status !== "resolved") {
    const csatSettings = await prisma.csatSettings.findFirst();
    if (csatSettings?.enabled && csatSettings.trigger === "ticket_resolved") {
      try {
        // Delete any previous survey so the customer can rate again (re-resolve case)
        await prisma.csatSurvey.deleteMany({ where: { serviceRequestId: id } });

        // Always generate a fresh token on each resolve
        const csatToken = randomBytes(24).toString("hex");
        await prisma.serviceRequest.update({
          where: { id },
          data: { csatToken, csatSentAt: new Date() },
        });

        const lastAgentComment = await prisma.comment.findFirst({
          where: { serviceRequestId: id, emailMessageId: { not: null } },
          orderBy: { createdAt: "desc" },
          select: { emailMessageId: true },
        });

        await sendCsatSurveyEmail({
          to: ticket.contact.email,
          customerName: ticket.contact.customerName,
          ticketNumber: ticket.ticketNumber,
          ticketSubject: ticket.subject,
          question: csatSettings.question,
          csatToken,
          threadId: current.emailThreadId,
          lastMessageId: lastAgentComment?.emailMessageId ?? null,
        });
      } catch (_emailErr) {
        // Email failure is non-blocking — ticket update already succeeded
        console.error("[CSAT] Failed to send survey email:", _emailErr);
      }
    }
  }

  return NextResponse.json(ticket);
}
