import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

// ─── GET /api/knowledge-articles/[id] ────────────────────────────────────────

export async function GET(_req: Request, { params }: Params) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const article = await prisma.knowledgeArticle.findUnique({
      where: { id },
      include: { author: { select: { username: true } } },
    });

    if (!article) return NextResponse.json({ error: "Article not found" }, { status: 404 });

    return NextResponse.json(article);
  } catch (error) {
    console.error("[GET /api/knowledge-articles/[id]]", error);
    return NextResponse.json(
      { error: "Internal server error", detail: String(error) },
      { status: 500 }
    );
  }
}

// ─── PATCH /api/knowledge-articles/[id] ──────────────────────────────────────

export async function PATCH(request: Request, { params }: Params) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();

    // Whitelist patchable fields
    const { title, content, type, ticketType, status } = body;

    const existing = await prisma.knowledgeArticle.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Article not found" }, { status: 404 });

    const updated = await prisma.knowledgeArticle.update({
      where: { id },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(content !== undefined ? { content } : {}),
        ...(type !== undefined ? { type } : {}),
        ...(ticketType !== undefined ? { ticketType } : {}),
        ...(status !== undefined ? { status } : {}),
      },
      include: { author: { select: { username: true } } },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PATCH /api/knowledge-articles/[id]]", error);
    return NextResponse.json(
      { error: "Internal server error", detail: String(error) },
      { status: 500 }
    );
  }
}

// ─── DELETE /api/knowledge-articles/[id] ─────────────────────────────────────

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const existing = await prisma.knowledgeArticle.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Article not found" }, { status: 404 });

    await prisma.knowledgeArticle.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/knowledge-articles/[id]]", error);
    return NextResponse.json(
      { error: "Internal server error", detail: String(error) },
      { status: 500 }
    );
  }
}
