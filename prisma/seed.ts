import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const MODULES = [
  "Service Request",
  "Contact",
  "User Management",
  "Queue",
  "Dashboard",
  "Settings",
];

// Module-level permissions (matches frontend UI format)
const allModules = Object.fromEntries(MODULES.map((m) => [m, true]));
const agentModules = Object.fromEntries(
  MODULES.map((m) => [m, ["Service Request", "Contact", "Queue", "Dashboard"].includes(m)])
);
const supervisorModules = Object.fromEntries(
  MODULES.map((m) => [m, m !== "Settings"])
);

async function main() {
  // ─── Roles ────────────────────────────────────────────────────────────────
  const adminRole = await prisma.role.upsert({
    where: { name: "Admin" },
    update: { permissions: allModules },
    create: { roleId: "ROLE-001", name: "Admin", permissions: allModules, status: "active" },
  });

  const agentRole = await prisma.role.upsert({
    where: { name: "Agent" },
    update: { permissions: agentModules },
    create: { roleId: "ROLE-002", name: "Agent", permissions: agentModules, status: "active" },
  });

  const supervisorRole = await prisma.role.upsert({
    where: { name: "Supervisor" },
    update: { permissions: supervisorModules },
    create: { roleId: "ROLE-003", name: "Supervisor", permissions: supervisorModules, status: "active" },
  });

  console.log(`✓ Roles seeded: ${adminRole.name}, ${agentRole.name}, ${supervisorRole.name}`);

  // ─── Users ────────────────────────────────────────────────────────────────
  const hashed = await bcrypt.hash("Ticketin123@", 12);

  const adminUser = await prisma.user.upsert({
    where: { email: "dev@ticketin.co.id" },
    update: { password: hashed, roleId: adminRole.id, status: "active" },
    create: {
      userId: "USR-001",
      username: "dev.admin",
      email: "dev@ticketin.co.id",
      password: hashed,
      phone: "+62 811-0000-0001",
      status: "active",
      roleId: adminRole.id,
    },
  });

  const agentUser = await prisma.user.upsert({
    where: { email: "rizky.a@ticketin.id" },
    update: {},
    create: {
      userId: "USR-002",
      username: "rizky.a",
      email: "rizky.a@ticketin.id",
      password: await bcrypt.hash("Agent123@", 12),
      phone: "+62 812-0000-0002",
      status: "active",
      roleId: agentRole.id,
    },
  });

  const supervisorUser = await prisma.user.upsert({
    where: { email: "hendra.k@ticketin.id" },
    update: {},
    create: {
      userId: "USR-003",
      username: "hendra.k",
      email: "hendra.k@ticketin.id",
      password: await bcrypt.hash("Supervisor123@", 12),
      phone: "+62 813-0000-0003",
      status: "active",
      roleId: supervisorRole.id,
    },
  });

  console.log(`✓ Users seeded: ${adminUser.email}, ${agentUser.email}, ${supervisorUser.email}`);

  // ─── Queues ───────────────────────────────────────────────────────────────
  const techQueue = await prisma.queue.upsert({
    where: { name: "Technical Support" },
    update: {},
    create: { queueId: "QUE-001", name: "Technical Support", status: "active" },
  });

  const billingQueue = await prisma.queue.upsert({
    where: { name: "Billing Team" },
    update: {},
    create: { queueId: "QUE-002", name: "Billing Team", status: "active" },
  });

  // Assign users to queues (upsert members)
  for (const { userId, queueId } of [
    { userId: agentUser.id, queueId: techQueue.id },
    { userId: supervisorUser.id, queueId: techQueue.id },
    { userId: agentUser.id, queueId: billingQueue.id },
  ]) {
    await prisma.queueMember.upsert({
      where: { userId_queueId: { userId, queueId } },
      update: {},
      create: { userId, queueId },
    });
  }

  console.log(`✓ Queues seeded: ${techQueue.name}, ${billingQueue.name}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

