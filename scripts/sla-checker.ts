/**
 * SLA Checker Daemon — runs alongside Next.js or via background process.
 * Periodically checks for active tickets where dueDate < NOW and slaBreachedNotifiedAt is null.
 * Generates SLA Breach notifications for assigned agents or queue members.
 *
 * Usage:
 *   npx ts-node -r tsconfig-paths/register scripts/sla-checker.ts
 */

import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env" });
loadEnv({ path: ".env.local", override: true });

import { prisma } from "@/lib/prisma";

const CHECK_INTERVAL_MS = Number(process.env.SLA_CHECK_INTERVAL_MS ?? 30_000);

async function checkSlaBreaches() {
  const now = new Date();
  try {
    const breachedTickets = await prisma.serviceRequest.findMany({
      where: {
        status: { in: ["new", "open", "in_progress", "pending"] },
        dueDate: { lt: now },
        slaBreachedNotifiedAt: null,
      },
      include: {
        queue: {
          include: {
            members: { select: { userId: true } },
          },
        },
      },
    });

    if (breachedTickets.length === 0) return;

    console.log(`[SLA Checker] Found ${breachedTickets.length} new breached ticket(s)`);

    for (const sr of breachedTickets) {
      const recipients = new Set<string>();
      if (sr.assignedTo) {
        recipients.add(sr.assignedTo);
      } else if (sr.queue?.members?.length) {
        sr.queue.members.forEach((m) => recipients.add(m.userId));
      } else {
        const activeUsers = await prisma.user.findMany({
          where: { status: "active" },
          select: { id: true },
        });
        activeUsers.forEach((u) => recipients.add(u.id));
      }

      const notifData = Array.from(recipients).map((userId) => ({
        userId,
        type: "sla_breached" as const,
        title: `SLA Breached: Ticket #${sr.ticketNumber}`,
        message: `Ticket "${sr.subject}" has breached SLA deadline (${sr.dueDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}). Please take action immediately!`,
        serviceRequestId: sr.id,
      }));

      await prisma.$transaction([
        prisma.notification.createMany({ data: notifData }),
        prisma.serviceRequest.update({
          where: { id: sr.id },
          data: { slaBreachedNotifiedAt: now },
        }),
      ]);

      console.log(
        `[SLA Checker] Sent SLA breach notification for #${sr.ticketNumber} to ${recipients.size} user(s)`
      );
    }
  } catch (err) {
    console.error("[SLA Checker] Error checking SLA breaches:", err);
  }
}

async function main() {
  console.log(`[SLA Checker] Running SLA breach monitoring every ${CHECK_INTERVAL_MS / 1000}s`);
  const run = () => checkSlaBreaches().catch((err) => console.error("[SLA Checker] Loop error:", err));
  await run();
  setInterval(run, CHECK_INTERVAL_MS);
}

main();
