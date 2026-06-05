"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ClipboardList,
  ChevronDown,
  Check,
  Send,
  AlertTriangle,
  Loader2,
  Search,
  X,
  Users,
  User,
} from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import {
  SLA_HOURS,
  type Priority,
  type QueueWithMembers,
} from "@/features/service-request/types";
import { DetailShell } from "@/components/layouts/page-shell";

const CATEGORIES = [
  "Technical Support",
  "Billing",
  "Account Issue",
  "General Inquiry",
  "Complaint",
  "Feature Request",
];

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

interface ContactOption {
  id: string;
  customerName: string;
  email: string;
}

// ─── Custom Combobox ──────────────────────────────────────────────────────────

function ContactCombobox({
  contacts,
  loading,
  value,
  onSelect,
  error,
}: {
  contacts: ContactOption[];
  loading: boolean;
  value: ContactOption | null;
  onSelect: (c: ContactOption | null) => void;
  error?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const filtered = contacts.filter((c) =>
    c.customerName.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (c: ContactOption) => {
    onSelect(c);
    setQuery(c.customerName);
    setOpen(false);
  };

  const handleClear = () => {
    onSelect(null);
    setQuery("");
    setOpen(false);
  };

  const inputBorder = error
    ? "border-red-400 focus:ring-red-400/30 focus:border-red-400"
    : "border-zinc-200 dark:border-zinc-700 focus:ring-primary/30 focus:border-primary";

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400 pointer-events-none" />
        <input
          type="text"
          placeholder={loading ? "Loading contacts..." : "Search customer name..."}
          disabled={loading}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            if (!e.target.value) onSelect(null);
          }}
          onFocus={() => setOpen(true)}
          className={`w-full pl-9 pr-9 py-2 text-sm rounded-xl border bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 transition-all ${inputBorder}`}
        />
        {(query || value) && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {open && !loading && (
        <div className="absolute z-30 mt-1 w-full bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-lg overflow-hidden">
          {filtered.length === 0 ? (
            <div className="px-4 py-3 text-sm text-zinc-400 text-center">
              No contact found.{" "}
              <a href="/contact" className="text-primary underline hover:text-primary/80">
                Create contact
              </a>
            </div>
          ) : (
            <div className="max-h-52 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800">
              {filtered.map((c) => {
                const isSelected = value?.id === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelect(c)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors ${
                      isSelected ? "bg-primary/5" : ""
                    }`}
                  >
                    <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                      {c.customerName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
                        {c.customerName}
                      </p>
                      <p className="text-xs text-zinc-400 truncate">{c.email}</p>
                    </div>
                    {isSelected && <Check className="size-4 text-primary flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Status feedback */}
      {value && !error && (
        <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1">
          <Check className="size-3" /> {value.customerName} selected
        </p>
      )}
    </div>
  );
}

// ─── Queue + User Picker ──────────────────────────────────────────────────────

function QueueUserPicker({
  queues,
  loading,
  selectedQueueId,
  selectedUserId,
  onQueueChange,
  onUserChange,
}: {
  queues: QueueWithMembers[];
  loading: boolean;
  selectedQueueId: string;
  selectedUserId: string;
  onQueueChange: (id: string) => void;
  onUserChange: (id: string) => void;
}) {
  const selectedQueue = queues.find((q) => q.id === selectedQueueId);

  return (
    <div className="space-y-3">
      {/* Queue picker */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-zinc-500 flex items-center gap-1.5">
          <Users className="size-3.5" /> Queue
        </label>
        <div className="relative">
          <select
            value={selectedQueueId}
            onChange={(e) => {
              onQueueChange(e.target.value);
              onUserChange(""); // reset user when queue changes
            }}
            disabled={loading}
            className="w-full appearance-none px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all pr-8 disabled:opacity-60"
          >
            <option value="">— No Queue —</option>
            {queues.filter((q) => q.status === "active").map((q) => (
              <option key={q.id} value={q.id}>
                {q.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400 pointer-events-none" />
        </div>
      </div>

      {/* User picker — only shown when queue is selected */}
      {selectedQueue && (
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-500 flex items-center gap-1.5">
            <User className="size-3.5" /> Assign To (from queue)
          </label>
          {selectedQueue.members.length === 0 ? (
            <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5 py-2">
              <AlertTriangle className="size-3.5" /> Queue has no members yet
            </p>
          ) : (
            <div className="space-y-1.5">
              {/* Unassigned option */}
              <button
                type="button"
                onClick={() => onUserChange("")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl border text-left transition-all text-sm ${
                  !selectedUserId
                    ? "border-primary/50 bg-primary/5 text-primary"
                    : "border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-600"
                }`}
              >
                <div className="size-7 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
                  <User className="size-3.5 text-zinc-400" />
                </div>
                <span className="text-sm">Unassigned</span>
                {!selectedUserId && <Check className="size-3.5 ml-auto flex-shrink-0" />}
              </button>
              {selectedQueue.members.map((m) => {
                const isSelected = m.userId === selectedUserId;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => onUserChange(m.userId)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "border-primary/50 bg-primary/5"
                        : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                    }`}
                  >
                    <div className="size-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                      {m.user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                        {m.user.username}
                      </p>
                      <p className="text-xs text-zinc-400 truncate">{m.user.email}</p>
                    </div>
                    {isSelected && <Check className="size-3.5 text-primary flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Field wrapper ────────────────────────────────────────────────────────────

function Field({
  label,
  children,
  required,
  error,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-zinc-500">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all";
const selectCls =
  "w-full appearance-none px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all pr-8";
const inputErrCls = " border-red-400 focus:ring-red-400/30";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NewServiceRequestPage() {
  const router = useRouter();

  // Lookup data
  const [contacts, setContacts] = useState<ContactOption[]>([]);
  const [queues, setQueues] = useState<QueueWithMembers[]>([]);
  const [lookupLoading, setLookupLoading] = useState(true);

  // Form state
  const [selectedContact, setSelectedContact] = useState<ContactOption | null>(null);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [priority, setPriority] = useState<Priority>("medium");
  const [description, setDescription] = useState("");
  const [selectedQueueId, setSelectedQueueId] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");

  // Submit state
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    Promise.all([
      fetch("/api/contacts").then((r) => r.json()),
      fetch("/api/queues").then((r) => r.json()),
    ])
      .then(([contactData, queueData]) => {
        setContacts(contactData);
        setQueues(queueData);
      })
      .catch(() => {})
      .finally(() => setLookupLoading(false));
  }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!selectedContact) e.contact = "Select an existing contact";
    if (!subject.trim()) e.subject = "Subject is required";
    if (!description.trim()) e.description = "Description is required";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const dueDate = new Date(
        Date.now() + SLA_HOURS[priority] * 60 * 60 * 1000
      ).toISOString();

      const body: Record<string, unknown> = {
        subject: subject.trim(),
        description: description.trim(),
        category,
        priority,
        contactId: selectedContact!.id,
        dueDate,
      };

      if (selectedQueueId) body.queueId = selectedQueueId;
      if (selectedUserId) body.assignedTo = selectedUserId;

      const res = await fetch("/api/service-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }

      const newTicket = await res.json();
      setSaved(true);
      setTimeout(() => router.push(`/service-request/${newTicket.id}`), 600);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to create ticket");
    } finally {
      setSubmitting(false);
    }
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
          disabled={saved || submitting}
          className="cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60 flex-shrink-0"
        >
          {saved ? (
            <Check className="size-4" />
          ) : submitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
          {saved ? "Saved!" : submitting ? "Submitting..." : "Submit Request"}
        </button>
      </div>

      {submitError && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-sm text-red-600 dark:text-red-400">
          <AlertTriangle className="size-4 flex-shrink-0" />
          {submitError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main form */}
        <div className="lg:col-span-2 space-y-4">
          {/* Customer Info */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Customer Information</h2>

            <Field label="Customer Name" required error={errors.contact}>
              <ContactCombobox
                contacts={contacts}
                loading={lookupLoading}
                value={selectedContact}
                onSelect={(c) => {
                  setSelectedContact(c);
                  if (errors.contact) setErrors((e) => ({ ...e, contact: "" }));
                }}
                error={errors.contact}
              />
            </Field>

            <Field label="Customer Email">
              <input
                type="email"
                value={selectedContact?.email ?? ""}
                readOnly
                placeholder="Auto-filled from contact"
                className={inputCls + " opacity-60 cursor-not-allowed"}
              />
            </Field>
          </div>

          {/* Request Details */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Request Details</h2>

            <Field label="Subject" required error={errors.subject}>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief description of the issue..."
                className={inputCls + (errors.subject ? inputErrCls : "")}
              />
            </Field>

            <Field label="Description" required error={errors.description}>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                placeholder="Provide a detailed description of the issue..."
                className={
                  inputCls.replace("py-2", "py-2.5") +
                  " resize-none" +
                  (errors.description ? inputErrCls : "")
                }
              />
            </Field>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Properties */}
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

            {/* Queue + User Assign */}
            <QueueUserPicker
              queues={queues}
              loading={lookupLoading}
              selectedQueueId={selectedQueueId}
              selectedUserId={selectedUserId}
              onQueueChange={setSelectedQueueId}
              onUserChange={setSelectedUserId}
            />
          </div>

          {/* Auto-set values */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-2">
            <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">Auto-set Values</h2>
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">Status</span>
              <span className="font-semibold text-sky-500">New</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">Ticket No.</span>
              <span className="font-medium text-zinc-600 dark:text-zinc-400">Auto-generated</span>
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
