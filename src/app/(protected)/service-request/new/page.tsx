"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ClipboardList,
  ChevronDown,
  Check,
  Send,
  User,
} from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import {
  QUEUE_AGENTS,
  SLA_HOURS,
  type Priority,
  type ServiceRequest,
  type Comment,
  type ActivityLog,
} from "@/features/service-request/mock-data";
import { ALL_CONTACTS } from "@/features/contact/mock-data";
import { addLocalItem } from "@/lib/local-store";
import { DetailShell } from "@/components/layouts/page-shell";

const CATEGORIES = [
  "Technical Support",
  "Billing",
  "Account Issue",
  "General Inquiry",
  "Complaint",
  "Feature Request",
];

const PRIORITY_OPTIONS: { value: Priority; label: string; color: string }[] = [
  { value: "low", label: "Low", color: "text-emerald-500" },
  { value: "medium", label: "Medium", color: "text-amber-500" },
  { value: "high", label: "High", color: "text-red-500" },
];

function Field({
  label,
  children,
  required,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-zinc-500">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all";

const selectCls =
  "w-full appearance-none px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all pr-8";

export default function NewServiceRequestPage() {
  const router = useRouter();

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [priority, setPriority] = useState<Priority>("medium");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState<string>("");
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-fill email when customer name matches a contact
  const handleCustomerNameChange = (name: string) => {
    setCustomerName(name);
    const match = ALL_CONTACTS.find(
      (c) => c.customerName.toLowerCase() === name.toLowerCase()
    );
    if (match) setCustomerEmail(match.email);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!customerName.trim()) e.customerName = "Customer name is required";
    if (!customerEmail.trim()) e.customerEmail = "Customer email is required";
    if (!subject.trim()) e.subject = "Subject is required";
    if (!description.trim()) e.description = "Description is required";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }

    const now = new Date();
    const dueDate = new Date(now.getTime() + SLA_HOURS[priority] * 60 * 60 * 1000);
    const id = `new-${Date.now()}`;
    const num = Math.floor(10000 + Math.random() * 90000);
    const ticketNumber = `TKT-${num}`;

    const activityLog: ActivityLog[] = [
      {
        id: "1",
        type: "created",
        actor: "Admin",
        detail: "Ticket created",
        createdAt: now,
      },
    ];

    const newReq: ServiceRequest = {
      id,
      ticketNumber,
      subject: subject.trim(),
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      category,
      priority,
      status: "open",
      assignedTo: assignedTo || null,
      description: description.trim(),
      createdAt: now,
      updatedAt: now,
      dueDate,
      comments: [],
      activityLog,
    };

    // Serialize with dates as ISO strings
    addLocalItem("sr", {
      ...newReq,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      dueDate: dueDate.toISOString(),
      activityLog: activityLog.map((a) => ({
        ...a,
        createdAt: a.createdAt.toISOString(),
      })),
    });

    setSaved(true);
    setTimeout(() => router.push("/service-request"), 800);
  };

  return (
    <DetailShell>
      <Breadcrumb
        items={[
          { label: "Service Request", href: "/service-request" },
          { label: "New Request" },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <ClipboardList className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">New Service Request</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Fill in the details to create a new ticket</p>
          </div>
        </div>
        <button
          onClick={handleSubmit}
          disabled={saved}
          className="cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60 flex-shrink-0"
        >
          {saved ? <Check className="size-4" /> : <Send className="size-4" />}
          {saved ? "Saved!" : "Submit Request"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main form */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Customer Information</h2>

            <Field label="Customer Name" required>
              <div className="relative">
                <input
                  list="contact-names"
                  value={customerName}
                  onChange={(e) => handleCustomerNameChange(e.target.value)}
                  placeholder="Enter or select customer name..."
                  className={inputCls + (errors.customerName ? " border-red-400 focus:ring-red-400/30" : "")}
                />
                <datalist id="contact-names">
                  {ALL_CONTACTS.map((c) => (
                    <option key={c.id} value={c.customerName} />
                  ))}
                </datalist>
              </div>
              {errors.customerName && <p className="text-xs text-red-500 mt-1">{errors.customerName}</p>}
            </Field>

            <Field label="Customer Email" required>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="customer@example.com"
                className={inputCls + (errors.customerEmail ? " border-red-400 focus:ring-red-400/30" : "")}
              />
              {errors.customerEmail && <p className="text-xs text-red-500 mt-1">{errors.customerEmail}</p>}
            </Field>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Request Details</h2>

            <Field label="Subject" required>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief description of the issue..."
                className={inputCls + (errors.subject ? " border-red-400 focus:ring-red-400/30" : "")}
              />
              {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject}</p>}
            </Field>

            <Field label="Description" required>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                placeholder="Provide a detailed description of the issue..."
                className={inputCls.replace("py-2", "py-2.5") + " resize-none" + (errors.description ? " border-red-400 focus:ring-red-400/30" : "")}
              />
              {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
            </Field>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Properties</h2>

            <Field label="Category">
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={selectCls}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400 pointer-events-none" />
              </div>
            </Field>

            <Field label="Priority">
              <div className="relative">
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className={selectCls}
                >
                  {PRIORITY_OPTIONS.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400 pointer-events-none" />
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                SLA: {SLA_HOURS[priority]}h response time
              </p>
            </Field>

            <Field label="Assign To">
              <div className="relative">
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className={selectCls}
                >
                  <option value="">— Unassigned —</option>
                  {QUEUE_AGENTS.map((a) => (
                    <option key={a.id} value={a.name}>
                      {a.name} ({a.role})
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400 pointer-events-none" />
              </div>
            </Field>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-2">
            <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">Auto-set Values</h2>
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">Status</span>
              <span className="font-semibold text-blue-500">Open</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">Created by</span>
              <span className="font-medium text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
                <User className="size-3" /> Admin
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">SLA Due</span>
              <span className="font-medium text-zinc-600 dark:text-zinc-400">
                {SLA_HOURS[priority]}h from now
              </span>
            </div>
          </div>
        </div>
      </div>
    </DetailShell>
  );
}
