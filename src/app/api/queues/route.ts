import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const queues = await prisma.queue.findMany({
    include: {
      members: {
        include: { user: { select: { id: true, username: true, email: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(queues);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { name } = body;

  if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });

  const count = await prisma.queue.count();
  const queueId = `QUE-${String(count + 1).padStart(3, "0")}`;

  const queue = await prisma.queue.create({
    data: { queueId, name },
  });

  return NextResponse.json(queue, { status: 201 });
}
