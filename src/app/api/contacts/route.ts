import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const contacts = await prisma.contact.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(contacts);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { title, customerName, phone, email, organization } = body;

  if (!customerName || !email) {
    return NextResponse.json({ error: "customerName and email are required" }, { status: 400 });
  }

  const contact = await prisma.contact.create({
    data: { title, customerName, phone, email, organization },
  });

  return NextResponse.json(contact, { status: 201 });
}
