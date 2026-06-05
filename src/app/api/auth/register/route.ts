import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  const body = await request.json();
  const { username, email, password } = body;

  if (!username || !email || !password) {
    return NextResponse.json(
      { error: "username, email, and password are required" },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
    select: { id: true, email: true, username: true },
  });

  if (existing) {
    const field = existing.email === email ? "email" : "username";
    return NextResponse.json(
      { error: `${field} already in use` },
      { status: 409 }
    );
  }

  const count = await prisma.user.count();
  const userId = `USR-${String(count + 1).padStart(3, "0")}`;
  const hashed = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { userId, username, email, password: hashed },
    select: { id: true, userId: true, username: true, email: true },
  });

  return NextResponse.json(user, { status: 201 });
}
