"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  BookOpen, Save, Archive, Globe, FileText,
  ChevronDown, X, Check, AlertTriangle, Clock, User, Loader2,
} from "lucide-react";
import Link from "next/link";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { DetailShell } from "@/components/layouts/page-shell";
import {
  type KnowledgeArticle,
  type KnowledgeStatus,
  STATUS_STYLES,
  ARTICLE_TYPES,
  TICKET_TYPES,
} from "@/features/knowledge/types";

// ─── Confirm Modal ────────────────────────────────────────────────────────────

function ConfirmModal({
  title, message, confirmLabel, confirmClass, onClose, onConfirm,
}: {
  title: string; message: string; confirmLabel: string;
  confirmClass: string; onClose: () => void; onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 w-full max-w-sm shadow-xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-red-500/10 flex items-center justify-center">
            <AlertTriangle className="size-5 text-red-500" />
          </div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{message}</p>
        <div className="flex items-center gap-2 pt-1">
          <button onClick={onConfirm} className={`cursor-pointer flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${confirmClass}`}>
            {confirmLabel}
          </button>
          <button onClick={onClose} className="cursor-pointer flex-1 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Select Field ─────────────────────────────────────────────────────────────

function SelectField({ label, value, options, onChange }: {
  label: string; value: string; options: string[]; onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-zinc-500">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all pr-8"
        >
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400 pointer-events-none" />
      </div>
    </div>
  );
}

// ─── New Article Form ─────────────────────────────────────────────────────────

function NewArticleForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [type, setType] = useState(ARTICLE_TYPES[0]);
  const [ticketType, setTicketType] = useState(TICKET_TYPES[0]);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (publish: boolean) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/knowledge-articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim() || "Untitled",
          type,
          ticketType,
          content,
          status: publish ? "published" : "draft",
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to save");
      }
      router.push("/settings/knowledge");
    } catch (e) {
      setError((e as Error).message);
      setSaving(false);
    }
  };

  return (
    <DetailShell>
      <Breadcrumb
        items={[
          { label: "Knowledge Management", href: "/settings/knowledge" },
          { label: "New Article" },
        ]}
      />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-500/10 dark:border-red-500/20 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <BookOpen className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">New Article</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Create a new knowledge base article</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="cursor-pointer flex items-center gap-2 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-60"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Save Draft
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving || !title.trim()}
            className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-60"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Globe className="size-4" />}
            Publish
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-500">Article Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter article title..."
                className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-500">Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={18}
                placeholder="Write your article content here... Supports Markdown formatting."
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none font-mono leading-relaxed"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Article Metadata</h2>
            <SelectField label="Article Type" value={type} options={ARTICLE_TYPES} onChange={setType} />
            <SelectField label="Ticket Type" value={ticketType} options={TICKET_TYPES} onChange={setTicketType} />
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-500">Status</label>
              <div className="px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <span className="text-xs font-semibold text-amber-500">Draft</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DetailShell>
  );
}

// ─── Edit Article Form ────────────────────────────────────────────────────────

function EditArticleForm({ id }: { id: string }) {
  const router = useRouter();
  const [article, setArticle] = useState<KnowledgeArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"archive" | "delete" | null>(null);

  // ── Fetch article ──────────────────────────────────────────────────────────

  const fetchArticle = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch(`/api/knowledge-articles/${id}`);
      if (!res.ok) throw new Error("Article not found");
      setArticle(await res.json());
    } catch (e) {
      setFetchError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchArticle(); }, [fetchArticle]);

  // ── Actions ────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!article) return;
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch(`/api/knowledge-articles/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: article.title,
          content: article.content,
          type: article.type,
          ticketType: article.ticketType,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (e) {
      setSaveError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (status: KnowledgeStatus) => {
    if (!article) return;
    try {
      const res = await fetch(`/api/knowledge-articles/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      const updated = await res.json();
      setArticle(updated);
    } catch (e) {
      setSaveError((e as Error).message);
    }
  };

  const handleArchive = async () => {
    setConfirmAction(null);
    await handleStatusChange("archived");
  };

  const handlePublish = async () => {
    await handleStatusChange("published");
  };

  const handleDelete = async () => {
    setConfirmAction(null);
    try {
      const res = await fetch(`/api/knowledge-articles/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      router.push("/settings/knowledge");
    } catch (e) {
      setSaveError((e as Error).message);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <DetailShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="size-8 text-zinc-300 animate-spin" />
        </div>
      </DetailShell>
    );
  }

  if (fetchError || !article) {
    return (
      <DetailShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <BookOpen className="size-12 text-zinc-300" />
          <p className="text-zinc-500 text-sm">{fetchError ?? "Article not found."}</p>
          <Link href="/settings/knowledge" className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors">
            Back to Knowledge Management
          </Link>
        </div>
      </DetailShell>
    );
  }

  const statusStyle = STATUS_STYLES[article.status];

  return (
    <>
      <DetailShell>
        <Breadcrumb
          items={[
            { label: "Knowledge Management", href: "/settings/knowledge" },
            { label: article.articleId },
          ]}
        />

        {saveError && (
          <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-500/10 dark:border-red-500/20 px-4 py-3 text-sm text-red-600 dark:text-red-400">
            {saveError}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-4 justify-between">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <BookOpen className="size-5 text-primary" />
            </div>
            <div>
              <span className="font-mono text-xs font-bold text-primary">{article.articleId}</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold capitalize ${statusStyle}`}>
                  {article.status}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
            {article.status !== "published" && (
              <button
                onClick={handlePublish}
                className="cursor-pointer flex items-center gap-2 px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800/40 text-sm font-medium text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors"
              >
                <Globe className="size-4" /> Publish
              </button>
            )}
            {article.status !== "archived" && (
              <button
                onClick={() => setConfirmAction("archive")}
                className="cursor-pointer flex items-center gap-2 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                <Archive className="size-4" /> Archive
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : isSaved ? <Check className="size-4" /> : <Save className="size-4" />}
              {saving ? "Saving..." : isSaved ? "Saved!" : "Save"}
            </button>
            <button
              onClick={() => setConfirmAction("delete")}
              className="cursor-pointer flex items-center gap-2 px-3 py-2 rounded-xl border border-red-200 dark:border-red-800/40 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            >
              <X className="size-4" /> Delete
            </button>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Editor */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-500">Article Title</label>
                <input
                  value={article.title}
                  onChange={(e) => setArticle((prev) => prev ? { ...prev, title: e.target.value } : prev)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all font-semibold"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-500">Content</label>
                <textarea
                  value={article.content}
                  onChange={(e) => setArticle((prev) => prev ? { ...prev, content: e.target.value } : prev)}
                  rows={20}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none font-mono leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Metadata sidebar */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-4">
              <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Metadata</h2>

              <SelectField
                label="Article Type"
                value={article.type}
                options={ARTICLE_TYPES}
                onChange={(v) => setArticle((prev) => prev ? { ...prev, type: v } : prev)}
              />

              <SelectField
                label="Ticket Type"
                value={article.ticketType}
                options={TICKET_TYPES}
                onChange={(v) => setArticle((prev) => prev ? { ...prev, ticketType: v } : prev)}
              />

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-500">Status</label>
                <div className={`px-3 py-2 rounded-xl border ${statusStyle}`}>
                  <span className="text-xs font-semibold capitalize">{article.status}</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-3">
              <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Details</h2>
              <div className="flex items-start gap-2.5">
                <User className="size-4 text-zinc-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-zinc-400">Author</p>
                  <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                    {article.author?.username ?? "—"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock className="size-4 text-zinc-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-zinc-400">Created</p>
                  <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                    {new Date(article.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <FileText className="size-4 text-zinc-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-zinc-400">Last Updated</p>
                  <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                    {new Date(article.updatedAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DetailShell>

      {confirmAction === "archive" && (
        <ConfirmModal
          title="Archive Article"
          message={`Are you sure you want to archive "${article.title}"? It will no longer be visible to customers.`}
          confirmLabel="Archive"
          confirmClass="bg-zinc-700 text-white hover:bg-zinc-800"
          onClose={() => setConfirmAction(null)}
          onConfirm={handleArchive}
        />
      )}
      {confirmAction === "delete" && (
        <ConfirmModal
          title="Delete Article"
          message={`Are you sure you want to delete "${article.title}"? This action cannot be undone.`}
          confirmLabel="Delete"
          confirmClass="bg-red-500 text-white hover:bg-red-600"
          onClose={() => setConfirmAction(null)}
          onConfirm={handleDelete}
        />
      )}
    </>
  );
}

// ─── Page Entry ───────────────────────────────────────────────────────────────

export default function KnowledgeArticlePage() {
  const params = useParams();
  const rawId = params?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId ?? "";

  if (id === "new") return <NewArticleForm />;
  return <EditArticleForm id={id} />;
}
