import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const templates = await prisma.emailTemplate.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, subject: true, body: true, isDefault: true },
  });

  return NextResponse.json(templates);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { name, subject, body: templateBody, isDefault } = body;

  if (!name || !subject || !templateBody) {
    return NextResponse.json({ error: "name, subject, and body are required" }, { status: 400 });
  }

  const template = await prisma.emailTemplate.create({
    data: { name, subject, body: templateBody, isDefault: isDefault ?? false },
  });

  return NextResponse.json(template, { status: 201 });
}
