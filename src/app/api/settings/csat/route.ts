import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

/** Get-or-create the singleton CsatSettings row. */
async function getSettings() {
  const existing = await prisma.csatSettings.findFirst();
  if (existing) return existing;
  return prisma.csatSettings.create({ data: {} });
}

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const settings = await getSettings();
  return NextResponse.json(settings);
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { enabled, question, thankYou, trigger } = body;

  const settings = await getSettings();

  const updated = await prisma.csatSettings.update({
    where: { id: settings.id },
    data: {
      ...(enabled !== undefined ? { enabled } : {}),
      ...(question !== undefined ? { question } : {}),
      ...(thankYou !== undefined ? { thankYou } : {}),
      ...(trigger !== undefined ? { trigger } : {}),
    },
  });

  return NextResponse.json(updated);
}
