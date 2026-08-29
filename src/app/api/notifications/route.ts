import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { searchParams } = new URL(request.url);

  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10)));
  const filter = searchParams.get("filter"); // "unread", "sla_breached", "inbound_email"

  const skip = (page - 1) * limit;

  const whereCondition: Record<string, unknown> = { userId };

  if (filter === "unread") {
    whereCondition.isRead = false;
  } else if (filter === "sla_breached") {
    whereCondition.type = "sla_breached";
  } else if (filter === "inbound_email") {
    whereCondition.type = "inbound_email";
  } else if (filter === "ticket_assigned") {
    whereCondition.type = "ticket_assigned";
  }

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: whereCondition,
      include: {
        serviceRequest: {
          select: {
            id: true,
            ticketNumber: true,
            subject: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.notification.count({ where: whereCondition }),
    prisma.notification.count({
      where: { userId, isRead: false },
    }),
  ]);

  const hasMore = skip + notifications.length < total;

  return NextResponse.json({
    notifications,
    unreadCount,
    total,
    page,
    limit,
    hasMore,
  });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const body = await request.json().catch(() => ({}));
  const { id, markAllRead } = body as { id?: string; markAllRead?: boolean };

  if (markAllRead) {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return NextResponse.json({ success: true, message: "All notifications marked as read" });
  }

  if (id) {
    await prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
    return NextResponse.json({ success: true, id });
  }

  return NextResponse.json({ error: "id or markAllRead is required" }, { status: 400 });
}
