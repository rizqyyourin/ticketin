import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const users = await prisma.user.findMany({
    select: {
      id: true,
      userId: true,
      username: true,
      email: true,
      phone: true,
      status: true,
      role: { select: { name: true } },
      queueMemberships: { include: { queue: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { username, email, phone, password, roleId } = body;

  if (!username || !email || !password) {
    return NextResponse.json(
      { error: "username, email, and password are required" },
      { status: 400 }
    );
  }

  const count = await prisma.user.count();
  const userId = `USR-${String(count + 1).padStart(3, "0")}`;
  const hashed = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { userId, username, email, phone, password: hashed, roleId: roleId ?? null },
    select: {
      id: true,
      userId: true,
      username: true,
      email: true,
      phone: true,
      status: true,
    },
  });

  return NextResponse.json(user, { status: 201 });
}
