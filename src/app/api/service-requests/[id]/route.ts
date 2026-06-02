import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const ticket = await prisma.serviceRequest.findUnique({
    where: { id },
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

  if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(ticket);
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const { status, assignedTo, ...rest } = body;

  const current = await prisma.serviceRequest.findUnique({ where: { id } });
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
    const label = assignedTo === null ? "Unassigned" : `Assigned to user ${assignedTo}`;
    activityEntries.push({
      type: "assignment",
      detail: label,
      actorId,
    });
  }

  const ticket = await prisma.serviceRequest.update({
    where: { id },
    data: {
      ...rest,
      ...(status ? { status } : {}),
      ...(assignedTo !== undefined ? { assignedTo } : {}),
      ...(activityEntries.length > 0
        ? { activityLogs: { create: activityEntries } }
        : {}),
    },
    include: {
      contact: true,
      assignedUser: { select: { id: true, username: true } },
    },
  });

  return NextResponse.json(ticket);
}
