import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// ─── GET /api/knowledge-articles ─────────────────────────────────────────────
// Query params: status, type, ticketType, search

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as "draft" | "published" | "archived" | null;
    const type = searchParams.get("type");
    const ticketType = searchParams.get("ticketType");
    const search = searchParams.get("search");

    const articles = await prisma.knowledgeArticle.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(type ? { type } : {}),
        ...(ticketType ? { ticketType } : {}),
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { articleId: { contains: search, mode: "insensitive" } },
                { type: { contains: search, mode: "insensitive" } },
                { ticketType: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: {
        author: { select: { username: true } },
      },
      orderBy: { articleId: "asc" },
    });

    return NextResponse.json(articles);
  } catch (error) {
    console.error("[GET /api/knowledge-articles]", error);
    return NextResponse.json(
      { error: "Internal server error", detail: String(error) },
      { status: 500 }
    );
  }
}

// ─── POST /api/knowledge-articles ────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { title, content, type, ticketType, status } = body;

    if (!title || !type || !ticketType) {
      return NextResponse.json(
        { error: "title, type, and ticketType are required" },
        { status: 400 }
      );
    }

    // Generate articleId: ART001, ART002, ...
    const count = await prisma.knowledgeArticle.count();
    const articleId = `ART${String(count + 1).padStart(3, "0")}`;

    const article = await prisma.knowledgeArticle.create({
      data: {
        articleId,
        title: title.trim(),
        content: content ?? "",
        type,
        ticketType,
        status: status ?? "draft",
        authorId: session.user?.id ?? null,
      },
      include: {
        author: { select: { username: true } },
      },
    });

    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    console.error("[POST /api/knowledge-articles]", error);
    return NextResponse.json(
      { error: "Internal server error", detail: String(error) },
      { status: 500 }
    );
  }
}
