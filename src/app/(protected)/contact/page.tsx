"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Search,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  BadgeCheck,
  User,
  Phone,
  Mail,
  Building2,
} from "lucide-react";
import { ALL_CONTACTS, TITLE_STYLES, type Title, type Contact } from "@/features/contact/mock-data";
import { getLocalItems } from "@/lib/local-store";
import { PageShell } from "@/components/layouts/page-shell";

type SortField = "title" | "customerName" | "phone" | "email" | "organization";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 15;

function SortIcon({ field, sortField, sortDir }: { field: SortField; sortField: SortField; sortDir: SortDir }) {
  if (field !== sortField) return <ChevronsUpDown className="size-3.5 text-zinc-400" />;
  return sortDir === "asc"
    ? <ChevronUp className="size-3.5 text-primary" />
    : <ChevronDown className="size-3.5 text-primary" />;
}

export default function ContactPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("customerName");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [contacts, setContacts] = useState<Contact[]>([...ALL_CONTACTS]);

  useEffect(() => {
    const local = getLocalItems<Contact>("contacts");
    if (local.length > 0) setContacts([...local, ...ALL_CONTACTS]);
  }, []);
  const loaderRef = useRef<HTMLDivElement>(null);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
    setVisibleCount(PAGE_SIZE);
  };

  const filtered = contacts
    .filter((c) => {
      const q = search.toLowerCase();
      return (
        c.customerName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.organization.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "title": cmp = a.title.localeCompare(b.title); break;
        case "customerName": cmp = a.customerName.localeCompare(b.customerName); break;
        case "phone": cmp = a.phone.localeCompare(b.phone); break;
        case "email": cmp = a.email.localeCompare(b.email); break;
        case "organization": cmp = a.organization.localeCompare(b.organization); break;
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
            <Users className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Contact</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage customer contacts and information</p>
          </div>
        </div>
        <button onClick={() => router.push("/contact/new")} className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors">
          <span className="text-lg leading-none">+</span>
          Add Contact
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
              placeholder="Search contacts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>
          <span className="text-xs text-zinc-400 ml-auto">
            {filtered.length} contact{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
              <tr>
                <th className={thClass} onClick={() => handleSort("title")}>
                  <div className="flex items-center gap-1.5"><BadgeCheck className="size-3.5 text-zinc-400" />Title <SortIcon field="title" sortField={sortField} sortDir={sortDir} /></div>
                </th>
                <th className={thClass} onClick={() => handleSort("customerName")}>
                  <div className="flex items-center gap-1.5"><User className="size-3.5 text-zinc-400" />Customer Name <SortIcon field="customerName" sortField={sortField} sortDir={sortDir} /></div>
                </th>
                <th className={thClass} onClick={() => handleSort("phone")}>
                  <div className="flex items-center gap-1.5"><Phone className="size-3.5 text-zinc-400" />Phone Number <SortIcon field="phone" sortField={sortField} sortDir={sortDir} /></div>
                </th>
                <th className={thClass} onClick={() => handleSort("email")}>
                  <div className="flex items-center gap-1.5"><Mail className="size-3.5 text-zinc-400" />Email Address <SortIcon field="email" sortField={sortField} sortDir={sortDir} /></div>
                </th>
                <th className={thClass} onClick={() => handleSort("organization")}>
                  <div className="flex items-center gap-1.5"><Building2 className="size-3.5 text-zinc-400" />Organization <SortIcon field="organization" sortField={sortField} sortDir={sortDir} /></div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-zinc-400">
                    No contacts found.
                  </td>
                </tr>
              ) : (
                visible.map((contact) => (
                  <tr key={contact.id} onClick={() => router.push(`/contact/${contact.id}`)} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer">
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold ${TITLE_STYLES[contact.title]}`}>
                        {contact.title}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{contact.customerName}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm text-zinc-600 dark:text-zinc-400 font-mono">{contact.phone}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">{contact.email}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">{contact.organization}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Infinite scroll sentinel + footer */}
        <div ref={loaderRef} className="px-4 py-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <span className="text-xs text-zinc-400">
            Showing {visible.length} of {filtered.length} contacts
          </span>
          {hasMore && (
            <span className="text-xs text-zinc-400 animate-pulse">Loading more...</span>
          )}
        </div>
      </div>
    </PageShell>
  );
}
