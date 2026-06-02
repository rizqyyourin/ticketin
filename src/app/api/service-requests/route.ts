import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");
  const contactId = searchParams.get("contactId");

  const tickets = await prisma.serviceRequest.findMany({
    where: {
      ...(status ? { status: status as never } : {}),
      ...(priority ? { priority: priority as never } : {}),
      ...(contactId ? { contactId } : {}),
    },
    include: {
      contact: { select: { customerName: true, email: true } },
      assignedUser: { select: { username: true } },
      queue: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(tickets);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { subject, description, category, priority, contactId, queueId, dueDate } = body;

  if (!subject || !contactId) {
    return NextResponse.json({ error: "subject and contactId are required" }, { status: 400 });
  }

  // Generate ticket number
  const count = await prisma.serviceRequest.count();
  const ticketNumber = `SR${String(count + 1).padStart(4, "0")}`;

  const ticket = await prisma.serviceRequest.create({
    data: {
      ticketNumber,
      subject,
      description: description ?? "",
      category: category ?? "General Inquiry",
      priority: priority ?? "medium",
      contactId,
      queueId: queueId ?? null,
      dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 12 * 60 * 60 * 1000),
      activityLogs: {
        create: {
          type: "created",
          detail: "Ticket created",
          actorId: session.user?.id ?? null,
        },
      },
    },
    include: {
      contact: true,
      activityLogs: true,
    },
  });

  return NextResponse.json(ticket, { status: 201 });
}
