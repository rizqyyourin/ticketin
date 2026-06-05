/**
 * Seed CSAT survey data for existing service requests.
 * Creates realistic distribution: ~75% satisfied, ~15% neutral, ~10% dissatisfied.
 * Only creates surveys for tickets that don't already have one.
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// Weighted distribution: ~50% satisfied, ~33% neutral, ~17% dissatisfied
function pickRating(i: number): "satisfied" | "neutral" | "dissatisfied" {
  const mod = i % 6;
  if (mod < 3) return "satisfied";
  if (mod < 5) return "neutral";
  return "dissatisfied";
}

async function main() {
  // Fetch all SRs that don't have a CSAT survey yet
  const srs = await prisma.serviceRequest.findMany({
    where: { csatSurvey: null },
    orderBy: { createdAt: "asc" },
  });

  if (srs.length === 0) {
    console.log("All service requests already have CSAT surveys.");
    return;
  }

  let created = 0;
  for (let i = 0; i < srs.length; i++) {
    const sr = srs[i];
    const rating = pickRating(i);
    // submittedAt = some time after the ticket was created (1-48h later)
    const hoursAfter = 4 + (i % 8) * 6;
    const submittedAt = new Date(sr.createdAt.getTime() + hoursAfter * 60 * 60 * 1000);

    await prisma.csatSurvey.create({
      data: {
        serviceRequestId: sr.id,
        rating,
        comment:
          rating === "satisfied"
            ? "Great support, issue resolved quickly."
            : rating === "neutral"
            ? "Support was okay, took a bit longer than expected."
            : "Response was slow and issue not fully resolved.",
        submittedAt,
      },
    });
    created++;
    console.log(`  ✓ ${sr.ticketNumber} → ${rating} (submitted ${submittedAt.toISOString()})`);
  }

  console.log(`\nSeeded ${created} CSAT surveys.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
