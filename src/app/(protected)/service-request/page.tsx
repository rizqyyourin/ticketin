"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ClipboardList,
  Search,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  AlertTriangle,
  Hash,
  User,
  Tag,
  Flame,
  Activity,
  Calendar,
} from "lucide-react";
import {
  type Priority,
  type Status,
  type ServiceRequestListItem,
} from "@/features/service-request/types";
import { PageShell } from "@/components/layouts/page-shell";

type SortField = "ticketNumber" | "customerName" | "category" | "priority" | "status" | "dueDate";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 15;

function isBreached(dueDate: string): boolean {
  return new Date() > new Date(dueDate);
}

function formatDueDate(dateStr: string) {
  return new Date(dateStr).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

const PRIORITY_STYLES: Record<Priority, { badge: string; label: string }> = {
  high: {
    badge: "bg-red-500/10 text-red-500 border border-red-500/20",
    label: "High",
  },
  medium: {
    badge: "bg-amber-500/10 text-amber-500 border border-amber-500/20",
    label: "Medium",
  },
  low: {
    badge: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
    label: "Low",
  },
};

const STATUS_STYLES: Record<Status, { badge: string; label: string }> = {
  new: {
    badge: "bg-sky-500/10 text-sky-500 border border-sky-500/20",
    label: "New",
  },
  open: {
    badge: "bg-blue-500/10 text-blue-500 border border-blue-500/20",
    label: "Open",
  },
  in_progress: {
    badge: "bg-violet-500/10 text-violet-500 border border-violet-500/20",
    label: "In Progress",
  },
  pending: {
    badge: "bg-amber-500/10 text-amber-600 border border-amber-500/20",
    label: "Pending",
  },
  resolved: {
    badge: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20",
    label: "Resolved",
  },
  closed: {
    badge: "bg-zinc-500/10 text-zinc-500 border border-zinc-500/20",
    label: "Closed",
  },
};

function SortIcon({ field, sortField, sortDir }: { field: SortField; sortField: SortField; sortDir: SortDir }) {
  if (field !== sortField) return <ChevronsUpDown className="size-3.5 text-zinc-400" />;
  return sortDir === "asc"
    ? <ChevronUp className="size-3.5 text-primary" />
    : <ChevronDown className="size-3.5 text-primary" />;
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <td key={i} className="px-4 py-3.5">
          <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded-lg w-24" />
        </td>
      ))}
    </tr>
  );
}

export default function ServiceRequestPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("ticketNumber");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [requests, setRequests] = useState<ServiceRequestListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch("/api/service-requests")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: ServiceRequestListItem[]) => {
        setRequests(data);
      })
      .catch((err) => {
        setError(err.message ?? "Failed to load service requests");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
    setVisibleCount(PAGE_SIZE);
  };

  const PRIORITY_ORDER: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
  const STATUS_ORDER: Record<Status, number> = { new: 0, open: 1, in_progress: 2, pending: 3, resolved: 4, closed: 5 };

  const filtered = requests
    .filter((r) => {
      const q = search.toLowerCase();
      return (
        r.ticketNumber.toLowerCase().includes(q) ||
        r.contact.customerName.toLowerCase().includes(q) ||
        r.subject.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.priority.toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "ticketNumber":
          cmp = a.ticketNumber.localeCompare(b.ticketNumber);
          break;
        case "customerName":
          cmp = a.contact.customerName.localeCompare(b.contact.customerName);
          break;
        case "category":
          cmp = a.category.localeCompare(b.category);
          break;
        case "priority":
          cmp = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
          break;
        case "status":
          cmp = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
          break;
        case "dueDate":
          cmp = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const loadMore = useCallback(() => {
    setVisibleCount((c) => Math.min(c + PAGE_SIZE, filtered.length));
  }, [filtered.length]);

  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [search]);

  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting && hasMore) loadMore(); },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  const thClass =
    "px-4 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide select-none cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors";

  return (
    <PageShell>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ClipboardList className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Service Request</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage and monitor incoming service requests</p>
          </div>
        </div>
        <button onClick={() => router.push("/service-request/new")} className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors">
          <span className="text-lg leading-none">+</span>
          Create New
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {/* Toolbar */}
        <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search requests..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>
          <span className="text-xs text-zinc-400 ml-auto">
            {loading ? "Loading..." : `${filtered.length} result${filtered.length !== 1 ? "s" : ""}`}
          </span>
        </div>

        {/* Error */}
        {error && (
          <div className="px-4 py-3 bg-red-50 dark:bg-red-500/10 border-b border-red-100 dark:border-red-500/20 text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertTriangle className="size-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
              <tr>
                <th className={thClass} onClick={() => handleSort("ticketNumber")}>
                  <div className="flex items-center gap-1.5">
                    <Hash className="size-3.5 text-zinc-400" />
                    Ticket No.
                    <SortIcon field="ticketNumber" sortField={sortField} sortDir={sortDir} />
                  </div>
                </th>
                <th className={thClass} onClick={() => handleSort("customerName")}>
                  <div className="flex items-center gap-1.5">
                    <User className="size-3.5 text-zinc-400" />
                    Customer Name
                    <SortIcon field="customerName" sortField={sortField} sortDir={sortDir} />
                  </div>
                </th>
                <th className={thClass} onClick={() => handleSort("category")}>
                  <div className="flex items-center gap-1.5">
                    <Tag className="size-3.5 text-zinc-400" />
                    Category
                    <SortIcon field="category" sortField={sortField} sortDir={sortDir} />
                  </div>
                </th>
                <th className={thClass} onClick={() => handleSort("priority")}>
                  <div className="flex items-center gap-1.5">
                    <Flame className="size-3.5 text-zinc-400" />
                    Priority
                    <SortIcon field="priority" sortField={sortField} sortDir={sortDir} />
                  </div>
                </th>
                <th className={thClass} onClick={() => handleSort("status")}>
                  <div className="flex items-center gap-1.5">
                    <Activity className="size-3.5 text-zinc-400" />
                    Status
                    <SortIcon field="status" sortField={sortField} sortDir={sortDir} />
                  </div>
                </th>
                <th className={thClass} onClick={() => handleSort("dueDate")}>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="size-3.5 text-zinc-400" />
                    Due Date
                    <SortIcon field="dueDate" sortField={sortField} sortDir={sortDir} />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-zinc-400">
                    {error ? "Failed to load data." : "No service requests found."}
                  </td>
                </tr>
              ) : (
                visible.map((req) => {
                  const breached = isBreached(req.dueDate);
                  const p = PRIORITY_STYLES[req.priority];
                  const s = STATUS_STYLES[req.status];
                  return (
                    <tr
                      key={req.id}
                      onClick={() => router.push(`/service-request/${req.id}`)}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
                    >
                      {/* Ticket Number */}
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-sm font-semibold text-primary">
                          {req.ticketNumber}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="px-4 py-3.5">
                        <div>
                          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                            {req.contact.customerName}
                          </p>
                          <p className="text-xs text-zinc-400 truncate max-w-[180px]">{req.subject}</p>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3.5">
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">
                          {req.category}
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold ${p.badge}`}>
                          {p.label}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold ${s.badge}`}>
                          {s.label}
                        </span>
                      </td>

                      {/* Due Date */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm ${breached ? "text-red-500 font-medium" : "text-zinc-600 dark:text-zinc-400"}`}>
                            {formatDueDate(req.dueDate)}
                          </span>
                          {breached && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold">
                              <AlertTriangle className="size-3" />
                              Breached
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Infinite scroll sentinel + footer */}
        <div ref={loaderRef} className="px-4 py-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <span className="text-xs text-zinc-400">
            {loading ? "Loading..." : `Showing ${visible.length} of ${filtered.length} requests`}
          </span>
          {hasMore && (
            <span className="text-xs text-zinc-400 animate-pulse">Loading more...</span>
          )}
        </div>
      </div>
    </PageShell>
  );
}
