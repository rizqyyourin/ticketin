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

  // ─── Service Requests (SR0001 - SR0009) ────────────────────────────────────
  const srData = [
    { ticketNumber: "SR0001", subject: "Cannot access customer portal", category: "Technical Issue", priority: "high" as const, status: "open" as const, contactId: contact1.id, assignedTo: adminUser.id, queueId: techQueue.id, dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000) },
    { ticketNumber: "SR0002", subject: "Invoice discrepancy for March billing", category: "Billing", priority: "medium" as const, status: "in_progress" as const, contactId: contact2.id, assignedTo: adminUser.id, queueId: billingQueue.id, dueDate: new Date(Date.now() + 48 * 60 * 60 * 1000) },
    { ticketNumber: "SR0003", subject: "Database connection timeout error", category: "Technical Issue", priority: "high" as const, status: "open" as const, contactId: contact3.id, assignedTo: adminUser.id, queueId: techQueue.id, dueDate: new Date(Date.now() - 2 * 60 * 60 * 1000) },
    { ticketNumber: "SR0004", subject: "API rate limit exceeded during peak hours", category: "Technical Support", priority: "high" as const, status: "in_progress" as const, contactId: contact1.id, assignedTo: adminUser.id, queueId: techQueue.id, dueDate: new Date(Date.now() - 5 * 60 * 60 * 1000) },
    { ticketNumber: "SR0005", subject: "Payment gateway transaction failed", category: "Billing", priority: "high" as const, status: "pending" as const, contactId: contact2.id, assignedTo: adminUser.id, queueId: billingQueue.id, dueDate: new Date(Date.now() - 12 * 60 * 60 * 1000) },
    { ticketNumber: "SR0006", subject: "License renewal inquiry for Q3", category: "General Inquiry", priority: "low" as const, status: "open" as const, contactId: contact3.id, assignedTo: adminUser.id, queueId: techQueue.id, dueDate: new Date(Date.now() + 72 * 60 * 60 * 1000) },
    { ticketNumber: "SR0007", subject: "SSL Certificate expiration warning", category: "Technical Support", priority: "medium" as const, status: "new" as const, contactId: contact1.id, assignedTo: adminUser.id, queueId: techQueue.id, dueDate: new Date(Date.now() + 36 * 60 * 60 * 1000) },
    { ticketNumber: "SR0008", subject: "Export report CSV file corrupted", category: "Technical Support", priority: "medium" as const, status: "new" as const, contactId: contact2.id, assignedTo: adminUser.id, queueId: techQueue.id, dueDate: new Date(Date.now() + 18 * 60 * 60 * 1000) },
    { ticketNumber: "SR0009", subject: "User permission role configuration request", category: "Account Issue", priority: "low" as const, status: "open" as const, contactId: contact3.id, assignedTo: adminUser.id, queueId: techQueue.id, dueDate: new Date(Date.now() + 48 * 60 * 60 * 1000) },
  ];

  const serviceRequests: Record<string, { id: string; ticketNumber: string }> = {};
  for (const item of srData) {
    const sr = await prisma.serviceRequest.upsert({
      where: { ticketNumber: item.ticketNumber },
      update: {
        subject: item.subject,
        description: `Detailed description for ticket ${item.ticketNumber}: ${item.subject}. Please investigate and resolve.`,
        category: item.category,
        priority: item.priority,
        status: item.status,
        dueDate: item.dueDate,
        assignedTo: adminUser.id,
      },
      create: {
        ...item,
        description: `Detailed description for ticket ${item.ticketNumber}: ${item.subject}. Please investigate and resolve.`,
        activityLogs: {
          create: { type: "created", detail: "Ticket created via seed", actorId: adminUser.id },
        },
      },
    });
    serviceRequests[item.ticketNumber] = { id: sr.id, ticketNumber: sr.ticketNumber };
  }

  console.log(`✓ Service Requests seeded: ${Object.keys(serviceRequests).length} tickets (SR0001 to SR0009)`);

  // ─── Notifications (3 of each type = 9 total) ─────────────────────────────
  await prisma.notification.deleteMany({ where: { userId: adminUser.id } });

  const notificationsData = [
    // ── SLA Breached (3)
    {
      userId: adminUser.id,
      type: "sla_breached" as const,
      title: "SLA Breached: Ticket #SR0003",
      message: 'Ticket "Database connection timeout error" has breached its SLA response deadline (Due 2h ago). Immediate resolution required.',
      isRead: false,
      serviceRequestId: serviceRequests["SR0003"].id,
      createdAt: new Date(Date.now() - 10 * 60 * 1000),
    },
    {
      userId: adminUser.id,
      type: "sla_breached" as const,
      title: "SLA Breached: Ticket #SR0004",
      message: 'Ticket "API rate limit exceeded during peak hours" has exceeded SLA handling time limit (Due 5h ago). Please update ticket status.',
      isRead: false,
      serviceRequestId: serviceRequests["SR0004"].id,
      createdAt: new Date(Date.now() - 35 * 60 * 1000),
    },
    {
      userId: adminUser.id,
      type: "sla_breached" as const,
      title: "SLA Breached: Ticket #SR0005",
      message: 'Ticket "Payment gateway transaction failed" has passed its target SLA resolution time.',
      isRead: true,
      serviceRequestId: serviceRequests["SR0005"].id,
      createdAt: new Date(Date.now() - 120 * 60 * 1000),
    },

    // ── Inbound Email (3)
    {
      userId: adminUser.id,
      type: "inbound_email" as const,
      title: "New Message: Ticket #SR0001",
      message: 'Andi Pratama replied: "Hi support team, I tried clearing cache but the login page still returns HTTP 500 error. Please help!"',
      isRead: false,
      serviceRequestId: serviceRequests["SR0001"].id,
      createdAt: new Date(Date.now() - 15 * 60 * 1000),
    },
    {
      userId: adminUser.id,
      type: "inbound_email" as const,
      title: "New Message: Ticket #SR0002",
      message: 'Citra Dewi replied: "Thank you for the update. Here is the attached PDF receipt for your billing verification."',
      isRead: false,
      serviceRequestId: serviceRequests["SR0002"].id,
      createdAt: new Date(Date.now() - 45 * 60 * 1000),
    },
    {
      userId: adminUser.id,
      type: "inbound_email" as const,
      title: "New Message: Ticket #SR0006",
      message: 'Budi Santoso replied: "Could you please send over the official quotation for 25 additional user licenses?"',
      isRead: true,
      serviceRequestId: serviceRequests["SR0006"].id,
      createdAt: new Date(Date.now() - 180 * 60 * 1000),
    },

    // ── Ticket Assigned (3)
    {
      userId: adminUser.id,
      type: "ticket_assigned" as const,
      title: "Ticket Assigned: Ticket #SR0007",
      message: 'You have been assigned to handle ticket #SR0007 ("SSL Certificate expiration warning").',
      isRead: false,
      serviceRequestId: serviceRequests["SR0007"].id,
      createdAt: new Date(Date.now() - 5 * 60 * 1000),
    },
    {
      userId: adminUser.id,
      type: "ticket_assigned" as const,
      title: "Ticket Assigned: Ticket #SR0008",
      message: 'You have been assigned to handle ticket #SR0008 ("Export report CSV file corrupted").',
      isRead: true,
      serviceRequestId: serviceRequests["SR0008"].id,
      createdAt: new Date(Date.now() - 60 * 60 * 1000),
    },
    {
      userId: adminUser.id,
      type: "ticket_assigned" as const,
      title: "Ticket Assigned: Ticket #SR0009",
      message: 'You have been assigned to handle ticket #SR0009 ("User permission role configuration request").',
      isRead: true,
      serviceRequestId: serviceRequests["SR0009"].id,
      createdAt: new Date(Date.now() - 240 * 60 * 1000),
    },
  ];

  await prisma.notification.createMany({ data: notificationsData });
  console.log(`✓ Notifications seeded: ${notificationsData.length} notifications (3 SLA Breached, 3 Inbound Email, 3 Ticket Assigned)`);

  // ─── Knowledge Articles ────────────────────────────────────────────────────
  const knowledgeArticles = [
    {
      articleId: "ART001",
      title: "How to Reset Account Password",
      type: "How-To Guide",
      ticketType: "Account Issue",
      status: "published" as const,
      authorId: adminUser.id,
      content: `## How to Reset Account Password

If you forgot your password or want to change it for security reasons, follow these steps.

### Steps

1. Go to the login page and click **Forgot Password**.
2. Enter the email address registered to your account.
3. Check your email inbox for a password reset link from noreply@ticketin.co.id.
4. Click the reset link — the link will expire in **30 minutes**.
5. Enter a new password and confirm it.
6. Click **Save** to save the changes.

### Troubleshooting

- If you don't receive the email within 5 minutes, check your spam folder.
- Ensure the email entered matches the one registered.
- If the link has expired, request a new link from the login page.`,
    },
    {
      articleId: "ART002",
      title: "Understanding Your Monthly Invoice",
      type: "FAQ",
      ticketType: "Billing",
      status: "published" as const,
      authorId: adminUser.id,
      content: `## Understanding Your Monthly Invoice

This article explains the main parts of your monthly invoice and how the billing is calculated.

### Invoice Sections

**Header** — Invoice number, issue date, and due date.

**Billing Period** — The period covered by this invoice, usually one calendar month.

**Service Details** — Breakdown of services used, including the number of seats and package tier.

**Subtotal & Tax** — Net amount before 11% VAT, then VAT is added.

**Total Amount** — The final amount to be paid.

### Payment Methods

- Bank Transfer (BCA, Mandiri, BNI)
- Virtual Account
- Credit Card (Visa, Mastercard)

Payment must be made within **14 days** of the invoice date to avoid service interruption.`,
    },
    {
      articleId: "ART003",
      title: "Network Connection Troubleshooting",
      type: "Troubleshooting",
      ticketType: "Technical Support",
      status: "published" as const,
      authorId: agentUser.id,
      content: `## Network Connection Troubleshooting

This guide helps diagnose and fix common network connection issues.

### Diagnostic Steps

1. **Check internet connection** — Ensure your device is connected to the internet by opening another website.
2. **Clear browser cache** — Press Ctrl+Shift+Delete (Windows) or Cmd+Shift+Delete (Mac), then clear cache and cookies.
3. **Try another browser** — Use Chrome, Firefox, or Edge to ensure the issue is not browser-related.
4. **Restart router** — Turn off your router for 30 seconds, then turn it back on.
5. **Check firewall/antivirus** — Ensure your firewall or antivirus is not blocking access to the platform.

### If the Issue Persists

- Note any error messages that appear.
- Take a screenshot of the error page.
- Submit a ticket to our Technical Support team and include the information above.`,
    },
    {
      articleId: "ART004",
      title: "Getting Started: How to Submit a Service Request",
      type: "How-To Guide",
      ticketType: "Service Request",
      status: "published" as const,
      authorId: adminUser.id,
      content: `## Getting Started: How to Submit a Service Request

Follow these steps to create a new service request on the Ticketin platform.

### Steps

1. Log in to your Ticketin account.
2. Click **Service Request** in the left navigation sidebar.
3. Click the **+ New Request** button in the top right corner.
4. Fill out the following form:
   - **Customer** — Select a customer from the existing contact list.
   - **Subject** — Write a brief summary of the issue.
   - **Category** — Choose the appropriate category.
   - **Priority** — Set the priority (Low/Medium/High).
   - **Description** — Explain the issue in full detail.
5. Click **Create Request** to save.

### Tips

- The more detailed the description, the faster our team can assist.
- If the customer is not yet registered, add them first via the **Contact** menu.`,
    },
    {
      articleId: "ART005",
      title: "How to Submit a Complaint and Escalate a Ticket",
      type: "How-To Guide",
      ticketType: "Complaint",
      status: "published" as const,
      authorId: supervisorUser.id,
      content: `## How to Submit a Complaint and Escalate a Ticket

If you feel your issue has not been handled properly, follow this guide.

### Submitting a Complaint

1. Open the relevant ticket on the **Service Request** page.
2. Scroll to the **Comments** section.
3. Type your complaint or additional information in the comment box.
4. Click **Send** to deliver it to the agent.

### Requesting Escalation

If the ticket is not followed up within the promised time (according to SLA), you can:

1. Reply to the ticket notification email and include the word "Escalation" in the subject.
2. Or contact our supervisor directly at supervisor@ticketin.co.id.

### SLA Response Time

| Priority  | Response Time |
|-----------|--------------|
| High      | 4 hours      |
| Medium    | 8 hours      |
| Low       | 24 hours     |`,
    },
    {
      articleId: "ART006",
      title: "Frequently Asked Questions about the Platform",
      type: "FAQ",
      ticketType: "General Inquiry",
      status: "published" as const,
      authorId: adminUser.id,
      content: `## Frequently Asked Questions about the Platform

Answers to the most frequently asked questions about Ticketin.

### Account & Login

**Q: How many users can I add?**
A: It depends on your subscription plan. Check the details on the Settings > Subscription page.

**Q: Can I log in from multiple devices?**
A: Yes, your Ticketin account can be accessed from any device with an internet connection.

### Tickets & Support

**Q: What is the response time for my ticket?**
A: Response time depends on the ticket priority. High: 4 hours, Medium: 8 hours, Low: 24 hours.

**Q: Will I get notified when my ticket is updated?**
A: Yes, email notifications are sent every time there is an update on your ticket.

### Payment

**Q: Is there a free trial?**
A: Yes, we provide a 14-day free trial with no credit card required.

**Q: How do I upgrade my plan?**
A: Contact our sales team at sales@ticketin.co.id or via a "Feature Request" ticket.`,
    },
    {
      articleId: "ART007",
      title: "How to Submit a New Feature Request",
      type: "How-To Guide",
      ticketType: "Feature Request",
      status: "published" as const,
      authorId: supervisorUser.id,
      content: `## How to Submit a New Feature Request

We are always open to feedback for platform development. Here's how to submit your feature idea.

### How to Submit a Feature Request

1. Click **Service Request** in the sidebar.
2. Click **+ New Request**.
3. Select **Category: Feature Request**.
4. In **Subject**, write the name of the feature you want briefly.
5. In **Description**, explain:
   - **Problem to be solved** — What obstacles are you currently facing?
   - **Expected solution** — How should this feature work?
   - **Business impact** — Why is this feature important for your team?

### Evaluation Process

After the request is received, our product team will:
1. Evaluate the feasibility and impact of the feature.
2. Provide a response within **5 working days**.
3. If approved, the feature will be added to the development roadmap.

We appreciate all feedback from our users!`,
    },
  ];

  for (const article of knowledgeArticles) {
    await prisma.knowledgeArticle.upsert({
      where: { articleId: article.articleId },
      update: { title: article.title, content: article.content, status: article.status },
      create: article,
    });
  }

  console.log(`✓ Knowledge Articles seeded: ${knowledgeArticles.length} articles (${knowledgeArticles.map(a => a.articleId).join(", ")})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

