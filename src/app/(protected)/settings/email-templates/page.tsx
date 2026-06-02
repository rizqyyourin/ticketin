"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mail, Search, ChevronUp, ChevronDown, ChevronsUpDown, FileText, FolderOpen, Clock } from "lucide-react";
import { MOCK_TEMPLATES, FOLDER_COLORS, type EmailTemplate } from "@/features/email-templates/mock-data";
import { getLocalItems } from "@/lib/local-store";
import { PageShell } from "@/components/layouts/page-shell";

type SortField = "name" | "folder" | "description" | "lastUsed";
type SortDir = "asc" | "desc";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

function SortIcon<T extends string>({ field, sortField, sortDir }: { field: T; sortField: T; sortDir: SortDir }) {
  if (field !== sortField) return <ChevronsUpDown className="size-3.5 text-zinc-400" />;
  return sortDir === "asc"
    ? <ChevronUp className="size-3.5 text-primary" />
    : <ChevronDown className="size-3.5 text-primary" />;
}

export default function EmailTemplatesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [templates, setTemplates] = useState<EmailTemplate[]>([...MOCK_TEMPLATES]);

  useEffect(() => {
    const local = getLocalItems<EmailTemplate>("templates");
    if (local.length > 0) setTemplates([...local, ...MOCK_TEMPLATES]);
  }, []);

  const handleSort = (f: SortField) => {
    if (f === sortField) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(f); setSortDir("asc"); }
  };

  const rows = templates
    .filter((t) => {
      const q = search.toLowerCase();
      return t.name.toLowerCase().includes(q) || t.folder.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      const cmp = a[sortField].localeCompare(b[sortField]);
      return sortDir === "asc" ? cmp : -cmp;
    });

  const th = "px-4 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide select-none cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors";

  return (
    <PageShell>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Mail className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Email Templates</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage outgoing email templates</p>
          </div>
        </div>
        <button onClick={() => router.push("/settings/email-templates/new")} className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors">
          <span className="text-lg leading-none">+</span>
          New Template
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
            <input type="text" placeholder="Search templates..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
          </div>
          <span className="text-xs text-zinc-400 ml-auto">{rows.length} template{rows.length !== 1 ? "s" : ""}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
              <tr>
                <th className={th} onClick={() => handleSort("name")}><div className="flex items-center gap-1.5"><Mail className="size-3.5 text-zinc-400" />Template Name <SortIcon field="name" sortField={sortField} sortDir={sortDir} /></div></th>
                <th className={th} onClick={() => handleSort("folder")}><div className="flex items-center gap-1.5"><FolderOpen className="size-3.5 text-zinc-400" />Folder <SortIcon field="folder" sortField={sortField} sortDir={sortDir} /></div></th>
                <th className={th} onClick={() => handleSort("description")}><div className="flex items-center gap-1.5"><FileText className="size-3.5 text-zinc-400" />Description <SortIcon field="description" sortField={sortField} sortDir={sortDir} /></div></th>
                <th className={th} onClick={() => handleSort("lastUsed")}><div className="flex items-center gap-1.5"><Clock className="size-3.5 text-zinc-400" />Last Used <SortIcon field="lastUsed" sortField={sortField} sortDir={sortDir} /></div></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {rows.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-12 text-center text-sm text-zinc-400">No templates found.</td></tr>
              ) : rows.map((t) => (
                <tr key={t.id} onClick={() => router.push(`/settings/email-templates/${t.id}`)} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer">
                  <td className="px-4 py-3.5">
                    <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{t.name}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold ${FOLDER_COLORS[t.folder] ?? "bg-zinc-100 text-zinc-500"}`}>
                      {t.folder}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">{t.description}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">{formatDate(t.lastUsed)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-zinc-100 dark:border-zinc-800">
          <span className="text-xs text-zinc-400">Showing {rows.length} of {templates.length} templates</span>
        </div>
      </div>
    </PageShell>
  );
}
