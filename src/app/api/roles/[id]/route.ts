import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const role = await prisma.role.findUnique({
    where: { id },
    include: { users: { select: { id: true } } },
  });

  if (!role) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(role);
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  const role = await prisma.role.update({
    where: { id },
    data: body,
  });

  return NextResponse.json(role);
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.role.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
