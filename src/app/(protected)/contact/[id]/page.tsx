"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Users,
  Phone,
  Mail,
  Building2,
  User,
  Pencil,
  Trash2,
  ClipboardList,
  Check,
  X,
  AlertTriangle,
  Clock,
  UserPlus,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { DetailShell } from "@/components/layouts/page-shell";
import { PhoneInput } from "@/components/ui/phone-input";

// ─── Types ────────────────────────────────────────────────────────────────────

type Title = "Mr" | "Ms";
type Priority = "high" | "medium" | "low";
type Status = "new" | "open" | "in_progress" | "pending" | "resolved" | "closed";

interface Contact {
  id: string;
  title: Title;
  customerName: string;
  phone: string | null;
  email: string;
  organization: string | null;
}

interface ServiceRequest {
  id: string;
  ticketNumber: string;
  subject: string;
  priority: Priority;
  status: Status;
  createdAt: string;
}

// ─── Style maps ───────────────────────────────────────────────────────────────

const TITLE_STYLES: Record<Title, string> = {
  Mr: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  Ms: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
};

const PRIORITY_STYLES: Record<Priority, { badge: string; label: string }> = {
  high: { badge: "bg-red-500/10 text-red-500 border border-red-500/20", label: "High" },
  medium: { badge: "bg-amber-500/10 text-amber-500 border border-amber-500/20", label: "Medium" },
  low: { badge: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20", label: "Low" },
};

const STATUS_STYLES: Record<Status, { badge: string; label: string; dot: string }> = {
  new: { badge: "bg-sky-500/10 text-sky-500 border border-sky-500/20", label: "New", dot: "bg-sky-500" },
  open: { badge: "bg-blue-500/10 text-blue-500 border border-blue-500/20", label: "Open", dot: "bg-blue-500" },
  in_progress: { badge: "bg-violet-500/10 text-violet-500 border border-violet-500/20", label: "In Progress", dot: "bg-violet-500" },
  pending: { badge: "bg-amber-500/10 text-amber-600 border border-amber-500/20", label: "Pending", dot: "bg-amber-500" },
  resolved: { badge: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20", label: "Resolved", dot: "bg-emerald-500" },
  closed: { badge: "bg-zinc-500/10 text-zinc-500 border border-zinc-500/20", label: "Closed", dot: "bg-zinc-400" },
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 size-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-zinc-400 mb-0.5">{label}</p>
        <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{value}</div>
      </div>
    </div>
  );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────

function EditModal({
  contact,
  onClose,
  onSave,
}: {
  contact: Contact;
  onClose: () => void;
  onSave: (updated: Contact) => void;
}) {
  const [customerName, setCustomerName] = useState(contact.customerName);
  const [phone, setPhone] = useState<string | null>(contact.phone ?? null);
  const [email, setEmail] = useState(contact.email);
  const [organization, setOrganization] = useState(contact.organization ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!customerName.trim() || !email.trim()) {
      setError("Name and email are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/contacts/${contact.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerName.trim(),
          phone: phone || null,
          email: email.trim(),
          organization: organization.trim() || null,
        }),
      });
      if (!res.ok) throw new Error("Failed to update contact");
      const updated: Contact = await res.json();
      onSave(updated);
    } catch {
      setError("Failed to save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Edit Contact</h3>
          <button onClick={onClose} className="cursor-pointer size-7 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors">
            <X className="size-4 text-zinc-400" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-500">Full Name <span className="text-red-500">*</span></label>
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-500">Phone Number</label>
            <PhoneInput value={phone} onChange={setPhone} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-500">Email Address <span className="text-red-500">*</span></label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-500">Organization</label>
            <input
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>
        </div>
        <div className="flex items-center gap-2 px-5 pb-5">
          <button
            onClick={handleSave}
            disabled={saving}
            className="cursor-pointer flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            <Check className="size-4" />
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button
            onClick={onClose}
            className="cursor-pointer px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

function DeleteModal({
  id,
  name,
  onClose,
}: {
  id: string;
  name: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await fetch(`/api/contacts/${id}`, { method: "DELETE" });
      router.push("/contact");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 w-full max-w-sm shadow-xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-red-500/10 flex items-center justify-center">
            <AlertTriangle className="size-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Delete Contact</h3>
            <p className="text-xs text-zinc-400 mt-0.5">This action cannot be undone.</p>
          </div>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Are you sure you want to delete <span className="font-semibold text-zinc-800 dark:text-zinc-200">{name}</span>? All related data will be removed.
        </p>
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleConfirm}
            disabled={deleting}
            className="cursor-pointer flex-1 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-60"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
          <button
            onClick={onClose}
            className="cursor-pointer flex-1 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── New Contact Form ─────────────────────────────────────────────────────────

function NewContactForm() {
  const router = useRouter();
  const [title, setTitle] = useState<Title>("Mr");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");

  const inputCls =
    "w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all";

  const validate = () => {
    const e: Record<string, string> = {};
    if (!customerName.trim()) e.customerName = "Full name is required";
    if (!email.trim()) e.email = "Email address is required";
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    setSaving(true);
    setServerError("");
    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          customerName: customerName.trim(),
          phone: phone || null,
          email: email.trim(),
          organization: organization.trim() || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setServerError(data.error ?? "Failed to create contact");
        return;
      }
      setSaved(true);
      setTimeout(() => router.push("/contact"), 800);
    } catch {
      setServerError("Network error. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DetailShell>
      <Breadcrumb items={[
        { label: "Contact", href: "/contact" },
        { label: "New Contact" },
      ]} />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Users className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">New Contact</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Add a new customer contact</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || saved}
          className="cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
        >
          {saved ? <Check className="size-4" /> : <UserPlus className="size-4" />}
          {saved ? "Saved!" : saving ? "Saving..." : "Save Contact"}
        </button>
      </div>

      {serverError && (
        <div className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-sm text-red-600 dark:text-red-400">
          {serverError}
        </div>
      )}

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-5">
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-500">Title</label>
            <div className="relative">
              <select
                value={title}
                onChange={(e) => setTitle(e.target.value as Title)}
                className="w-full appearance-none px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all pr-8"
              >
                <option value="Mr">Mr</option>
                <option value="Ms">Ms</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400 pointer-events-none" />
            </div>
          </div>
          <div className="col-span-2 space-y-1.5">
            <label className="text-xs font-medium text-zinc-500">Full Name <span className="text-red-500">*</span></label>
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Customer full name"
              className={inputCls + (errors.customerName ? " border-red-400" : "")}
            />
            {errors.customerName && <p className="text-xs text-red-500">{errors.customerName}</p>}
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-500">Phone Number</label>
          <PhoneInput value={phone} onChange={setPhone} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-500">Email Address <span className="text-red-500">*</span></label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="contact@example.com"
            className={inputCls + (errors.email ? " border-red-400" : "")}
          />
          {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-500">Organization</label>
          <input
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            placeholder="PT / CV / UD ..."
            className={inputCls}
          />
        </div>
      </div>
    </DetailShell>
  );
}

// ─── Detail Page ──────────────────────────────────────────────────────────────

function ContactDetail({ id }: { id: string }) {
  const router = useRouter();
  const [contact, setContact] = useState<Contact | null>(null);
  const [relatedRequests, setRelatedRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/contacts/${id}`).then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/service-requests?contactId=${id}`).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([c, sr]) => {
        setContact(c);
        setRelatedRequests(sr);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <DetailShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <span className="text-sm text-zinc-400">Loading...</span>
        </div>
      </DetailShell>
    );
  }

  if (!contact) {
    return (
      <DetailShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Users className="size-12 text-zinc-300" />
          <p className="text-zinc-500 text-sm">Contact not found.</p>
          <Link
            href="/contact"
            className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            Back to Contacts
          </Link>
        </div>
      </DetailShell>
    );
  }

  const titleStyle = TITLE_STYLES[contact.title];

  return (
    <>
      <DetailShell>
        <Breadcrumb items={[
          { label: "Contact", href: "/contact" },
          { label: contact.customerName },
        ]} />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <User className="size-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold ${titleStyle}`}>
                  {contact.title}
                </span>
                <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{contact.customerName}</h1>
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{contact.organization}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setShowEdit(true)}
              className="cursor-pointer flex items-center gap-2 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <Pencil className="size-4" />
              Edit
            </button>
            <button
              onClick={() => setShowDelete(true)}
              className="cursor-pointer flex items-center gap-2 px-3 py-2 rounded-xl border border-red-200 dark:border-red-800/40 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="size-4" />
              Delete
            </button>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Contact Info */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-4">
              <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                <Users className="size-4 text-zinc-400" />
                Contact Info
              </h2>
              <InfoRow icon={<User className="size-4 text-zinc-400" />} label="Full Name" value={contact.customerName} />
              <InfoRow
                icon={<Phone className="size-4 text-zinc-400" />}
                label="Phone Number"
                value={<span className="font-mono">{contact.phone ?? "—"}</span>}
              />
              <InfoRow
                icon={<Mail className="size-4 text-zinc-400" />}
                label="Email Address"
                value={
                  <a href={`mailto:${contact.email}`} className="text-primary hover:underline">
                    {contact.email}
                  </a>
                }
              />
              <InfoRow icon={<Building2 className="size-4 text-zinc-400" />} label="Organization" value={contact.organization ?? "—"} />
            </div>

            {/* Ticket Summary */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-3">
              <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Ticket Summary</h2>
              <div className="grid grid-cols-2 gap-3">
                {(["new", "open", "in_progress", "pending", "resolved", "closed"] as Status[]).map((s) => {
                  const count = relatedRequests.filter((r) => r.status === s).length;
                  const st = STATUS_STYLES[s];
                  const textColor = st.badge.split(" ").find((c) => c.startsWith("text-")) ?? "text-zinc-500";
                  return (
                    <div key={s} className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 p-3 space-y-1">
                      <p className={`text-xs font-semibold ${textColor}`}>{st.label}</p>
                      <p className="text-2xl font-bold text-zinc-800 dark:text-zinc-200">{count}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Service Requests */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
                <ClipboardList className="size-4 text-zinc-400" />
                <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  Service Requests
                  {relatedRequests.length > 0 && (
                    <span className="ml-2 text-xs font-normal text-zinc-400">({relatedRequests.length})</span>
                  )}
                </h2>
              </div>

              {relatedRequests.length === 0 ? (
                <div className="p-8 text-center">
                  <ClipboardList className="size-8 text-zinc-300 mx-auto mb-2" />
                  <p className="text-sm text-zinc-400">No service requests found for this contact.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Ticket</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Subject</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Priority</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {relatedRequests.map((r) => {
                        const p = PRIORITY_STYLES[r.priority];
                        const s = STATUS_STYLES[r.status];
                        return (
                          <tr
                            key={r.id}
                            className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
                            onClick={() => router.push(`/service-request/${r.id}`)}
                          >
                            <td className="px-4 py-3.5">
                              <span className="font-mono text-sm font-semibold text-primary">{r.ticketNumber}</span>
                            </td>
                            <td className="px-4 py-3.5 max-w-[200px]">
                              <span className="text-sm text-zinc-800 dark:text-zinc-200 truncate block">{r.subject}</span>
                            </td>
                            <td className="px-4 py-3.5">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold ${p.badge}`}>{p.label}</span>
                            </td>
                            <td className="px-4 py-3.5">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold ${s.badge}`}>
                                <span className={`size-1.5 rounded-full ${s.dot}`} />
                                {s.label}
                              </span>
                            </td>
                            <td className="px-4 py-3.5">
                              <span className="text-sm text-zinc-500 dark:text-zinc-400 whitespace-nowrap flex items-center gap-1.5">
                                <Clock className="size-3.5 text-zinc-400" />
                                {formatDate(r.createdAt)}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </DetailShell>

      {showEdit && (
        <EditModal
          contact={contact}
          onClose={() => setShowEdit(false)}
          onSave={(updated) => {
            setContact(updated);
            setShowEdit(false);
          }}
        />
      )}
      {showDelete && (
        <DeleteModal
          id={contact.id}
          name={contact.customerName}
          onClose={() => setShowDelete(false)}
        />
      )}
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ContactDetailPage() {
  const params = useParams();
  const rawId = params?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  if (id === "new") return <NewContactForm />;
  if (!id) return null;

  return <ContactDetail id={id} />;
}
