import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const { content, role } = body;

  if (!content) {
    return NextResponse.json({ error: "content is required" }, { status: 400 });
  }

  const comment = await prisma.comment.create({
    data: {
      content,
      role: role ?? "agent",
      authorId: session.user?.id ?? null,
      serviceRequestId: id,
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

  return NextResponse.json(comment, { status: 201 });
}
