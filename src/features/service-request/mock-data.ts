export type Priority = "low" | "medium" | "high";
export type Status = "open" | "in_progress" | "pending" | "resolved" | "closed";

export interface QueueAgent {
  id: string;
  name: string;
  email: string;
  role: "Agent" | "Senior Agent" | "Supervisor";
  queues: string[];
}

export const QUEUE_AGENTS: QueueAgent[] = [
  { id: "1", name: "Rizky A.", email: "rizky.a@ticketin.id", role: "Agent", queues: ["Technical Support", "Account Issue"] },
  { id: "2", name: "Dewi S.", email: "dewi.s@ticketin.id", role: "Agent", queues: ["Billing", "General Inquiry"] },
  { id: "3", name: "Bima P.", email: "bima.p@ticketin.id", role: "Agent", queues: ["Complaint", "General Inquiry"] },
  { id: "4", name: "Lestari N.", email: "lestari.n@ticketin.id", role: "Senior Agent", queues: ["Technical Support", "Feature Request"] },
  { id: "5", name: "Hendra K.", email: "hendra.k@ticketin.id", role: "Supervisor", queues: ["Technical Support", "Billing", "Account Issue", "General Inquiry", "Complaint", "Feature Request"] },
];

export interface Comment {
  id: string;
  author: string;
  role: "agent" | "customer" | "system";
  content: string;
  createdAt: Date;
}

export interface ActivityLog {
  id: string;
  type: "status_change" | "assignment" | "comment" | "created";
  actor: string;
  detail: string;
  createdAt: Date;
}

export interface ServiceRequest {
  id: string;
  ticketNumber: string;
  subject: string;
  customerName: string;
  customerEmail: string;
  category: string;
  priority: Priority;
  status: Status;
  assignedTo: string | null;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  dueDate: Date;
  comments: Comment[];
  activityLog: ActivityLog[];
}

// SLA hours per priority
export const SLA_HOURS: Record<Priority, number> = {
  low: 24,
  medium: 12,
  high: 8,
};

const MOCK_NAMES = [
  "Andi Pratama", "Budi Santoso", "Citra Dewi", "Doni Kurniawan", "Eka Wulandari",
  "Fajar Nugroho", "Gita Permata", "Hendra Wijaya", "Indah Rahayu", "Joko Susilo",
  "Kartika Sari", "Lukman Hakim", "Maya Anggraini", "Nanda Putra", "Olivia Susanti",
  "Prabowo Setiawan", "Qori Natasya", "Rizky Firmansyah", "Sinta Maharani", "Teguh Wibowo",
  "Umar Fauzi", "Vina Ramadhani", "Wahyu Nugroho", "Xenia Putri", "Yoga Aditya",
  "Zahra Amelia", "Agus Salim", "Bella Maharani", "Chandra Kusuma", "Diana Lestari",
  "Evan Prasetyo", "Fifi Yuliana", "Gilang Ramadhan", "Hani Kurniasih", "Ivan Gunawan",
  "Julia Ratnasari", "Kevin Hermawan", "Lina Marlina", "Miko Saputra", "Nina Fitriani",
  "Oscar Sihombing", "Putri Handayani", "Qusai Pratomo", "Rafi Ananda", "Shinta Permata",
  "Toni Setiabudi", "Ulfa Nurjanah", "Vito Kusuma", "Winda Ariani", "Yudi Prasetyo",
];

const CATEGORIES = [
  "Technical Support", "Billing", "Account Issue",
  "General Inquiry", "Complaint", "Feature Request",
];

const PRIORITIES: Priority[] = ["high", "medium", "low"];

const STATUSES: Status[] = ["open", "in_progress", "pending", "resolved", "closed"];

const AGENTS = [
  "Rizky A.", "Dewi S.", "Bima P.", "Lestari N.", "Hendra K.",
];

const SUBJECTS: Record<string, string[]> = {
  "Technical Support": [
    "Cannot login to application",
    "App crashes on startup",
    "API integration error",
    "Password reset not working",
  ],
  "Billing": [
    "Double charged on last invoice",
    "Refund not received",
    "Incorrect billing amount",
    "Subscription upgrade issue",
  ],
  "Account Issue": [
    "Account locked out",
    "Cannot update profile",
    "Email verification not received",
    "2FA setup problem",
  ],
  "General Inquiry": [
    "Question about pricing plans",
    "How to export data",
    "Enterprise plan inquiry",
    "SLA policy clarification",
  ],
  "Complaint": [
    "Long response time",
    "Unsatisfied with resolution",
    "Rude support agent",
    "Issue not fully resolved",
  ],
  "Feature Request": [
    "Dark mode support",
    "Bulk export feature",
    "Mobile app request",
    "API rate limit increase",
  ],
};

const DESCRIPTIONS: Record<string, string> = {
  "Cannot login to application":
    "User reports being unable to log into the application since yesterday evening. Error message shown: 'Invalid credentials' even though the password is correct. User has already tried resetting password but the reset email has not arrived.",
  "App crashes on startup":
    "The application crashes immediately after the splash screen on both Android and iOS. This started after the latest update (v2.3.1). Device: Samsung Galaxy S22, Android 13.",
  "API integration error":
    "Our integration is receiving 500 Internal Server Error responses when calling the /api/v2/tickets endpoint. This is blocking our production workflow. Attached: error logs and request payload.",
  "Double charged on last invoice":
    "Invoice #INV-2026-0541 shows a charge of Rp 2,400,000 but we should only be billed Rp 1,200,000 for the Standard plan. Please investigate and issue a credit note.",
  "Account locked out":
    "Account has been locked after 3 failed login attempts. Need immediate unlock as this is a production service account used by our automated system.",
};

function getDescription(subject: string): string {
  return (
    DESCRIPTIONS[subject] ||
    `User submitted a ticket regarding: "${subject}". Additional details were not provided at time of submission. Agent should follow up to gather more information.`
  );
}

function generateComments(index: number, status: Status, customerName: string, assignedTo: string | null): Comment[] {
  const comments: Comment[] = [];
  if (status === "open") return comments;

  const agent = assignedTo ?? AGENTS[index % AGENTS.length];

  comments.push({
    id: `c-${index}-1`,
    author: agent,
    role: "agent",
    content: "Thank you for reaching out. I have reviewed your request and will investigate this issue. I'll update you within 2 hours.",
    createdAt: new Date(2026, 4, 20 + (index % 8), 10, 30),
  });

  if (status === "pending" || status === "resolved" || status === "closed") {
    comments.push({
      id: `c-${index}-2`,
      author: customerName,
      role: "customer",
      content: "Thank you for the quick response! Waiting for the update.",
      createdAt: new Date(2026, 4, 20 + (index % 8), 11, 0),
    });
  }

  if (status === "resolved" || status === "closed") {
    comments.push({
      id: `c-${index}-3`,
      author: agent,
      role: "agent",
      content: "I have identified the root cause and applied a fix. Please try again and let me know if the issue is resolved.",
      createdAt: new Date(2026, 4, 20 + (index % 8), 14, 15),
    });
  }

  if (status === "closed") {
    comments.push({
      id: `c-${index}-4`,
      author: customerName,
      role: "customer",
      content: "Confirmed, the issue is resolved. Thank you!",
      createdAt: new Date(2026, 4, 21 + (index % 7), 9, 0),
    });
  }

  return comments;
}

function generateActivityLog(index: number, status: Status, createdAt: Date, assignedTo: string | null): ActivityLog[] {
  const log: ActivityLog[] = [
    {
      id: `a-${index}-0`,
      type: "created",
      actor: "System",
      detail: "Ticket created and assigned to queue",
      createdAt,
    },
  ];

  if (status !== "open") {
    log.push({
      id: `a-${index}-1`,
      type: "assignment",
      actor: "System",
      detail: `Assigned to ${assignedTo ?? AGENTS[index % AGENTS.length]}`,
      createdAt: new Date(createdAt.getTime() + 15 * 60 * 1000),
    });
    log.push({
      id: `a-${index}-2`,
      type: "status_change",
      actor: assignedTo ?? AGENTS[index % AGENTS.length],
      detail: "Status changed from Open → In Progress",
      createdAt: new Date(createdAt.getTime() + 20 * 60 * 1000),
    });
  }

  if (status === "pending") {
    log.push({
      id: `a-${index}-3`,
      type: "status_change",
      actor: assignedTo ?? AGENTS[index % AGENTS.length],
      detail: "Status changed from In Progress → Pending (awaiting customer response)",
      createdAt: new Date(createdAt.getTime() + 2 * 60 * 60 * 1000),
    });
  }

  if (status === "resolved" || status === "closed") {
    log.push({
      id: `a-${index}-3`,
      type: "status_change",
      actor: assignedTo ?? AGENTS[index % AGENTS.length],
      detail: "Status changed from In Progress → Resolved",
      createdAt: new Date(createdAt.getTime() + 4 * 60 * 60 * 1000),
    });
  }

  if (status === "closed") {
    log.push({
      id: `a-${index}-4`,
      type: "status_change",
      actor: "System",
      detail: "Ticket closed after customer confirmation",
      createdAt: new Date(createdAt.getTime() + 24 * 60 * 60 * 1000),
    });
  }

  return log;
}

function generateMockData(count: number): ServiceRequest[] {
  return Array.from({ length: count }, (_, i) => {
    const priority = PRIORITIES[i % 3];
    const status = STATUSES[i % 5];
    const slaHours = SLA_HOURS[priority];
    const category = CATEGORIES[i % CATEGORIES.length];
    const createdAt = new Date(2026, 4, 20 + (i % 8), (i * 3) % 24, (i * 7) % 60);
    const dueDate = new Date(createdAt.getTime() + slaHours * 60 * 60 * 1000 - (i % 5) * 2 * 60 * 60 * 1000);
    const updatedAt = new Date(createdAt.getTime() + (i % 6) * 60 * 60 * 1000);
    const customerName = MOCK_NAMES[i % MOCK_NAMES.length];
    const subjectList = SUBJECTS[category];
    const subject = subjectList[i % subjectList.length];
    const assignedTo = status !== "open" ? AGENTS[i % AGENTS.length] : null;

    return {
      id: String(i + 1),
      ticketNumber: `SR${String(i + 1).padStart(4, "0")}`,
      subject,
      customerName,
      customerEmail: `${customerName.toLowerCase().replace(/\s+/g, ".")}@mail.com`,
      category,
      priority,
      status,
      assignedTo,
      description: getDescription(subject),
      createdAt,
      updatedAt,
      dueDate,
      comments: generateComments(i, status, customerName, assignedTo),
      activityLog: generateActivityLog(i, status, createdAt, assignedTo),
    };
  });
}

export const ALL_REQUESTS = generateMockData(60);
