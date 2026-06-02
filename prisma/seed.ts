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

  // ─── Contacts ─────────────────────────────────────────────────────────────
  const contact1 = await prisma.contact.upsert({
    where: { email: "andi.pratama@nusantaratech.co.id" },
    update: {},
    create: {
      title: "Mr",
      customerName: "Andi Pratama",
      phone: "+62 811-2345-6789",
      email: "andi.pratama@nusantaratech.co.id",
      organization: "PT Nusantara Tech",
    },
  });

  const contact2 = await prisma.contact.upsert({
    where: { email: "citra.dewi@sinarharapan.co.id" },
    update: {},
    create: {
      title: "Ms",
      customerName: "Citra Dewi",
      phone: "+62 812-9876-5432",
      email: "citra.dewi@sinarharapan.co.id",
      organization: "PT Sinar Harapan",
    },
  });

  const contact3 = await prisma.contact.upsert({
    where: { email: "budi.santoso@majujaya.co.id" },
    update: {},
    create: {
      title: "Mr",
      customerName: "Budi Santoso",
      phone: "+62 813-5555-1234",
      email: "budi.santoso@majujaya.co.id",
      organization: "CV Maju Jaya",
    },
  });

  console.log(`✓ Contacts seeded: ${contact1.customerName}, ${contact2.customerName}, ${contact3.customerName}`);

  // ─── Service Requests ──────────────────────────────────────────────────────
  const sr1 = await prisma.serviceRequest.upsert({
    where: { ticketNumber: "SR0001" },
    update: {},
    create: {
      ticketNumber: "SR0001",
      subject: "Cannot access customer portal",
      description: "User is unable to log in to the customer portal since this morning. Error message: 'Invalid credentials'.",
      category: "Technical Issue",
      priority: "high",
      status: "open",
      contactId: contact1.id,
      assignedTo: agentUser.id,
      queueId: techQueue.id,
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      activityLogs: {
        create: { type: "created", detail: "Ticket created via seed", actorId: adminUser.id },
      },
    },
  });

  const sr2 = await prisma.serviceRequest.upsert({
    where: { ticketNumber: "SR0002" },
    update: {},
    create: {
      ticketNumber: "SR0002",
      subject: "Invoice discrepancy for March billing",
      description: "The March invoice shows incorrect charges. Amount billed does not match the agreed contract terms.",
      category: "Billing",
      priority: "medium",
      status: "in_progress",
      contactId: contact2.id,
      assignedTo: supervisorUser.id,
      queueId: billingQueue.id,
      dueDate: new Date(Date.now() + 48 * 60 * 60 * 1000),
      activityLogs: {
        create: { type: "created", detail: "Ticket created via seed", actorId: adminUser.id },
      },
    },
  });

  console.log(`✓ Service Requests seeded: ${sr1.ticketNumber}, ${sr2.ticketNumber}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

