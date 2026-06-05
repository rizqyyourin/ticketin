import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");

  if (!fromParam || !toParam) {
    return NextResponse.json({ error: "from and to query params required" }, { status: 400 });
  }

  const from = new Date(fromParam);
  const to = new Date(toParam);

  if (isNaN(from.getTime()) || isNaN(to.getTime())) {
    return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
  }

  // Previous period for trend calculation (same duration, prior window)
  const duration = to.getTime() - from.getTime();
  const prevFrom = new Date(from.getTime() - duration);
  const prevTo = new Date(from.getTime());

  const [currentGroups, prevGroups, csatGroups, slaBreached, slaTotalCount] =
    await Promise.all([
      prisma.serviceRequest.groupBy({
        by: ["status"],
        where: { createdAt: { gte: from, lte: to } },
        _count: { status: true },
      }),
      prisma.serviceRequest.groupBy({
        by: ["status"],
        where: { createdAt: { gte: prevFrom, lte: prevTo } },
        _count: { status: true },
      }),
      prisma.csatSurvey.groupBy({
        by: ["rating"],
        where: { submittedAt: { gte: from, lte: to } },
        _count: { rating: true },
      }),
      // SLA breached = created in period, past due date, still open
      prisma.serviceRequest.count({
        where: {
          createdAt: { gte: from, lte: to },
          dueDate: { lt: new Date() },
          status: { notIn: ["resolved", "closed"] },
        },
      }),
      prisma.serviceRequest.count({
        where: { createdAt: { gte: from, lte: to } },
      }),
    ]);

  type GroupRow = { status: string; _count: { status: number } };
  const toMap = (rows: GroupRow[]) => {
    const m: Record<string, number> = {};
    for (const r of rows) m[r.status] = r._count.status;
    return m;
  };

  const curr = toMap(currentGroups as GroupRow[]);
  const prev = toMap(prevGroups as GroupRow[]);

  const sum = (m: Record<string, number>, keys: string[]) =>
    keys.reduce((acc, k) => acc + (m[k] ?? 0), 0);

  const trend = (c: number, p: number) => {
    if (p === 0) return c > 0 ? 100 : 0;
    return Math.round(((c - p) / p) * 100);
  };

  const newCount = sum(curr, ["new"]);
  const inProgressCount = sum(curr, ["open", "in_progress", "pending"]);
  const resolvedCount = sum(curr, ["resolved"]);
  const closedCount = sum(curr, ["closed"]);

  const prevNew = sum(prev, ["new"]);
  const prevInProgress = sum(prev, ["open", "in_progress", "pending"]);
  const prevResolved = sum(prev, ["resolved"]);
  const prevClosed = sum(prev, ["closed"]);

  type CsatRow = { rating: string; _count: { rating: number } };
  const csatMap: Record<string, number> = {};
  for (const r of csatGroups as CsatRow[]) csatMap[r.rating] = r._count.rating;
  const csatTotal =
    (csatMap.satisfied ?? 0) + (csatMap.neutral ?? 0) + (csatMap.dissatisfied ?? 0);

  return NextResponse.json({
    stats: {
      new: newCount,
      in_progress: inProgressCount,
      resolved: resolvedCount,
      closed: closedCount,
      newTrend: trend(newCount, prevNew),
      inProgressTrend: trend(inProgressCount, prevInProgress),
      resolvedTrend: trend(resolvedCount, prevResolved),
      closedTrend: trend(closedCount, prevClosed),
    },
    csat: {
      satisfied: csatMap.satisfied ?? 0,
      neutral: csatMap.neutral ?? 0,
      dissatisfied: csatMap.dissatisfied ?? 0,
      total: csatTotal,
    },
    sla: {
      breached: slaBreached,
      inSla: slaTotalCount - slaBreached,
      total: slaTotalCount,
    },
  });
}
