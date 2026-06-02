import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      username: true,
      email: true,
      phone: true,
      status: true,
      role: { select: { id: true, name: true } },
      queueMemberships: { include: { queue: { select: { id: true, name: true } } } },
    },
  });

  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(user);
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const { password, ...rest } = body;

  const user = await prisma.user.update({
    where: { id },
    data: rest,
    select: {
      id: true,
      userId: true,
      username: true,
      email: true,
      phone: true,
      status: true,
    },
  });

  return NextResponse.json(user);
}
