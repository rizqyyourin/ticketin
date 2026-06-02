import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const roles = await prisma.role.findMany({
    include: { users: { select: { id: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(roles);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { name, permissions } = body;

  if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });

  const count = await prisma.role.count();
  const roleId = `ROLE-${String(count + 1).padStart(3, "0")}`;

  const role = await prisma.role.create({
    data: { roleId, name, permissions: permissions ?? {} },
  });

  return NextResponse.json(role, { status: 201 });
}
