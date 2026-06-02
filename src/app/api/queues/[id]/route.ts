import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const queue = await prisma.queue.findUnique({
    where: { id },
    include: {
      members: {
        include: {
          user: { select: { id: true, userId: true, username: true, email: true, status: true } },
        },
      },
    },
  });

  if (!queue) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(queue);
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const { memberIds, ...rest } = body;

  const queue = await prisma.queue.update({
    where: { id },
    data: {
      ...rest,
      ...(memberIds !== undefined
        ? {
            members: {
              deleteMany: {},
              createMany: {
                data: (memberIds as string[]).map((userId) => ({ userId })),
                skipDuplicates: true,
              },
            },
          }
        : {}),
    },
    include: {
      members: {
        include: {
          user: { select: { id: true, userId: true, username: true, email: true, status: true } },
        },
      },
    },
  });

  return NextResponse.json(queue);
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.queue.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
