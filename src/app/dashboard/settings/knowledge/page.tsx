"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Search, ChevronUp, ChevronDown, ChevronsUpDown, MoreVertical, Archive, Pencil, Trash2 } from "lucide-react";
import {
  MOCK_ARTICLES,
  STATUS_STYLES,
  type Article,
  type ArticleStatus,
} from "@/features/knowledge/mock-data";
import { getLocalItems } from "@/lib/local-store";

type SortField = "articleId" | "title" | "type" | "ticketType" | "status";
type SortDir = "asc" | "desc";

function SortIcon<T extends string>({ field, sortField, sortDir }: { field: T; sortField: T; sortDir: SortDir }) {
  if (field !== sortField) return <ChevronsUpDown className="size-3.5 text-zinc-400" />;
  return sortDir === "asc"
    ? <ChevronUp className="size-3.5 text-primary" />
    : <ChevronDown className="size-3.5 text-primary" />;
}

function ActionMenu({ onArchive, onEdit, onDelete }: { onArchive: () => void; onEdit: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="cursor-pointer size-8 flex items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
      >
        <MoreVertical className="size-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-lg z-20 p-1 overflow-hidden">
          <button onClick={() => { onEdit(); setOpen(false); }}
            className="cursor-pointer flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg transition-colors">
            <Pencil className="size-3.5" /> Edit
          </button>
          <button onClick={() => { onArchive(); setOpen(false); }}
            className="cursor-pointer flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg transition-colors">
            <Archive className="size-3.5" /> Archive
          </button>
          <button onClick={() => { onDelete(); setOpen(false); }}
            className="cursor-pointer flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
            <Trash2 className="size-3.5" /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default function KnowledgeManagementPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("articleId");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [articles, setArticles] = useState<Article[]>(MOCK_ARTICLES);

  useEffect(() => {
    const local = getLocalItems<Article>("articles");
    if (local.length > 0) setArticles([...local, ...MOCK_ARTICLES]);
  }, []);

  const handleSort = (f: SortField) => {
    if (f === sortField) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(f); setSortDir("asc"); }
  };

  const handleArchive = (id: string) => {
    setArticles((prev) => prev.map((a) => a.id === id ? { ...a, status: "archived" as ArticleStatus } : a));
  };

  const handleDelete = (id: string) => {
    setArticles((prev) => prev.filter((a) => a.id !== id));
  };

  const rows = articles
    .filter((a) => {
      const q = search.toLowerCase();
      return a.articleId.toLowerCase().includes(q) || a.title.toLowerCase().includes(q) ||
        a.type.toLowerCase().includes(q) || a.ticketType.toLowerCase().includes(q) || a.status.includes(q);
    })
    .sort((a, b) => {
      const cmp = a[sortField].localeCompare(b[sortField]);
      return sortDir === "asc" ? cmp : -cmp;
    });

  const th = "px-4 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide select-none cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors";

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <BookOpen className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Knowledge Management</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage help articles and documentation</p>
          </div>
        </div>
        <button onClick={() => router.push("/dashboard/settings/knowledge/new")} className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors">
          <span className="text-lg leading-none">+</span>
          New Article
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
            <input type="text" placeholder="Search articles..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
          </div>
          <span className="text-xs text-zinc-400 ml-auto">{rows.length} article{rows.length !== 1 ? "s" : ""}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
              <tr>
                <th className={th} onClick={() => handleSort("articleId")}><div className="flex items-center gap-1.5">Article ID <SortIcon field="articleId" sortField={sortField} sortDir={sortDir} /></div></th>
                <th className={th} onClick={() => handleSort("title")}><div className="flex items-center gap-1.5">Title <SortIcon field="title" sortField={sortField} sortDir={sortDir} /></div></th>
                <th className={th} onClick={() => handleSort("type")}><div className="flex items-center gap-1.5">Type <SortIcon field="type" sortField={sortField} sortDir={sortDir} /></div></th>
                <th className={th} onClick={() => handleSort("ticketType")}><div className="flex items-center gap-1.5">Ticket Type <SortIcon field="ticketType" sortField={sortField} sortDir={sortDir} /></div></th>
                <th className={th} onClick={() => handleSort("status")}><div className="flex items-center gap-1.5">Status <SortIcon field="status" sortField={sortField} sortDir={sortDir} /></div></th>
                <th className="px-4 py-3 w-12" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {rows.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-zinc-400">No articles found.</td></tr>
              ) : rows.map((a) => (
                <tr key={a.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-4 py-3.5"><span className="font-mono text-sm font-semibold text-primary">{a.articleId}</span></td>
                  <td className="px-4 py-3.5"><span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{a.title}</span></td>
                  <td className="px-4 py-3.5"><span className="text-sm text-zinc-600 dark:text-zinc-400">{a.type}</span></td>
                  <td className="px-4 py-3.5"><span className="text-sm text-zinc-600 dark:text-zinc-400">{a.ticketType}</span></td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold capitalize ${STATUS_STYLES[a.status]}`}>{a.status}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <ActionMenu
                      onEdit={() => router.push(`/dashboard/settings/knowledge/${a.id}`)}
                      onArchive={() => handleArchive(a.id)}
                      onDelete={() => handleDelete(a.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-zinc-100 dark:border-zinc-800">
          <span className="text-xs text-zinc-400">Showing {rows.length} of {articles.length} articles</span>
        </div>
      </div>
    </div>
  );
}
