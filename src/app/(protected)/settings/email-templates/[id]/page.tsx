"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Mail,
  Save,
  ChevronDown,
  Check,
  X,
  Eye,
  Pencil,
  Frown,
  Meh,
  Smile,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import {
  MOCK_TEMPLATES,
  FOLDER_COLORS,
  FOLDERS,
  type EmailTemplate,
} from "@/features/email-templates/mock-data";
import { addLocalItem, getLocalItems } from "@/lib/local-store";
import { DetailShell } from "@/components/layouts/page-shell";

// ─── Email Preview ────────────────────────────────────────────────────────────

function EmailPreview({ name, subject, body }: { name: string; subject: string; body: string }) {
  const isCsat = name.toLowerCase().includes("csat");

  return (
    <div className="bg-zinc-100 rounded-xl overflow-hidden text-[13px] font-sans select-none">
      {/* Email client chrome */}
      <div className="bg-zinc-200 px-4 py-2.5 flex items-center gap-2 border-b border-zinc-300">
        <div className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-red-400" />
          <span className="size-2.5 rounded-full bg-amber-400" />
          <span className="size-2.5 rounded-full bg-emerald-400" />
        </div>
        <div className="flex-1 bg-white rounded-md px-3 py-1 text-[11px] text-zinc-400 text-center truncate">
          support@ticketin.co.id
        </div>
      </div>

      {/* Email meta */}
      <div className="bg-white px-5 py-3 border-b border-zinc-100 space-y-1">
        <div className="flex items-baseline gap-2">
          <span className="text-[11px] font-semibold text-zinc-400 w-14 shrink-0">From</span>
          <span className="text-[12px] text-zinc-700">Ticketin Support &lt;noreply@ticketin.co.id&gt;</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-[11px] font-semibold text-zinc-400 w-14 shrink-0">To</span>
          <span className="text-[12px] text-zinc-700">{"{{customer_email}}"}</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-[11px] font-semibold text-zinc-400 w-14 shrink-0">Subject</span>
          <span className="text-[12px] font-semibold text-zinc-800 truncate">{subject || "(no subject)"}</span>
        </div>
      </div>

      {/* Email body */}
      <div className="bg-white px-5 py-5 space-y-4 max-h-72 overflow-y-auto">
        {/* Logo */}
        <div className="flex items-center gap-1.5">
          <div className="size-6 rounded-md bg-[#e5484d] flex items-center justify-center">
            <span className="text-white text-[9px] font-black">T</span>
          </div>
          <span className="font-extrabold text-[13px] tracking-tighter text-zinc-800">
            ticketin<span className="text-[#e5484d]">.</span>
          </span>
        </div>

        <div className="border-t border-zinc-100 pt-3">
          <pre className="text-[11px] text-zinc-600 whitespace-pre-wrap leading-relaxed font-sans">
            {body || "(no content)"}
          </pre>
        </div>

        {/* CSAT buttons preview */}
        {isCsat && (
          <div className="flex gap-2 pt-1">
            <span className="flex-1 flex flex-col items-center gap-1 py-2 rounded-lg bg-red-50 border border-red-200">
              <Frown className="size-4 text-red-500" />
              <span className="text-[10px] font-semibold text-red-500">Dissatisfied</span>
            </span>
            <span className="flex-1 flex flex-col items-center gap-1 py-2 rounded-lg bg-amber-50 border border-amber-200">
              <Meh className="size-4 text-amber-500" />
              <span className="text-[10px] font-semibold text-amber-500">Neutral</span>
            </span>
            <span className="flex-1 flex flex-col items-center gap-1 py-2 rounded-lg bg-emerald-50 border border-emerald-200">
              <Smile className="size-4 text-emerald-500" />
              <span className="text-[10px] font-semibold text-emerald-500">Satisfied</span>
            </span>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-zinc-100 pt-3 space-y-1">
          <p className="text-[10px] text-zinc-400">© 2026 Ticketin. All rights reserved.</p>
          <p className="text-[10px] text-zinc-400">
            <span className="text-[#e5484d] cursor-pointer hover:underline">Unsubscribe</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── New Template Form ────────────────────────────────────────────────────────

function NewTemplateForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [folder, setFolder] = useState(FOLDERS[0]);
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [saved, setSaved] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const handleSave = () => {
    addLocalItem<EmailTemplate>("templates", {
      id: `new-${Date.now()}`,
      name: name.trim() || "Untitled Template",
      folder,
      description: description.trim(),
      subject: subject.trim(),
      body,
      lastUsed: new Date().toISOString().split("T")[0],
    });
    setSaved(true);
    setTimeout(() => router.push("/settings/email-templates"), 800);
  };

  return (
    <DetailShell >
      <Breadcrumb
        items={[
          { label: "Email Templates", href: "/settings/email-templates" },
          { label: "New Template" },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Mail className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">New Template</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Create a new email template</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPreviewMode((v) => !v)}
            className={`cursor-pointer flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-colors ${
              previewMode
                ? "border-primary bg-primary/5 text-primary"
                : "border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
            }`}
          >
            <Eye className="size-4" />
            Preview
          </button>
          <button
            onClick={handleSave}
            disabled={saved || !name.trim()}
            className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            {saved ? <Check className="size-4" /> : <Save className="size-4" />}
            {saved ? "Saved!" : "Save Template"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Template Details</h2>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-500">Template Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Welcome Email"
                className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-500">Folder</label>
              <div className="relative">
                <select value={folder} onChange={(e) => setFolder(e.target.value)}
                  className="w-full appearance-none px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all pr-8">
                  {FOLDERS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400 pointer-events-none" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-500">Description</label>
              <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description..."
                className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-500">Email Subject</label>
              <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Enter email subject..."
                className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-500">Body</label>
              <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={12}
                placeholder={"Hi {{customer_name}},\n\nWrite your email body here...\n\nUse {{variable_name}} for dynamic values."}
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none font-mono leading-relaxed" />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
              <Eye className="size-4 text-zinc-400" />
              Live Preview
            </h2>
            <EmailPreview name={name} subject={subject} body={body} />
          </div>
        </div>
      </div>
    </DetailShell>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EmailTemplatePage() {
  const params = useParams();
  const rawId = params?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  if (id === "new") return <NewTemplateForm />;

  const allTemplates = [...getLocalItems<EmailTemplate>("templates"), ...MOCK_TEMPLATES];
  const initialTemplate = allTemplates.find((t) => t.id === id);
  const [template, setTemplate] = useState<EmailTemplate | undefined>(initialTemplate);
  const [isSaved, setIsSaved] = useState(false);

  if (!template) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Mail className="size-12 text-zinc-300" />
        <p className="text-zinc-500 text-sm">Template not found.</p>
        <Link href="/settings/email-templates" className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors">
          Back to Email Templates
        </Link>
      </div>
    );
  }

  const folderColor = FOLDER_COLORS[template.folder] ?? "bg-zinc-100 text-zinc-500";

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <DetailShell >
      <Breadcrumb
        items={[
          { label: "Email Templates", href: "/settings/email-templates" },
          { label: template.name },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Mail className="size-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{template.name}</h1>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold ${folderColor}`}>
                {template.folder}
              </span>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{template.description}</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors flex-shrink-0"
        >
          {isSaved ? <Check className="size-4" /> : <Save className="size-4" />}
          {isSaved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Editor */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
              <Pencil className="size-4 text-zinc-400" />
              Edit Template
            </h2>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-500">Template Name</label>
              <input
                value={template.name}
                onChange={(e) => setTemplate((prev) => prev ? { ...prev, name: e.target.value } : prev)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-500">Folder</label>
              <div className="relative">
                <select
                  value={template.folder}
                  onChange={(e) => setTemplate((prev) => prev ? { ...prev, folder: e.target.value } : prev)}
                  className="w-full appearance-none px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all pr-8"
                >
                  {FOLDERS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-500">Description</label>
              <input
                value={template.description}
                onChange={(e) => setTemplate((prev) => prev ? { ...prev, description: e.target.value } : prev)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-500">Email Subject</label>
              <input
                value={template.subject}
                onChange={(e) => setTemplate((prev) => prev ? { ...prev, subject: e.target.value } : prev)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-500">Body</label>
              <textarea
                value={template.body}
                onChange={(e) => setTemplate((prev) => prev ? { ...prev, body: e.target.value } : prev)}
                rows={14}
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none font-mono leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Preview + Meta */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
              <Eye className="size-4 text-zinc-400" />
              Live Preview
            </h2>
            <EmailPreview name={template.name} subject={template.subject} body={template.body} />
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-3">
            <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Details</h2>
            <div className="flex items-center gap-2.5">
              <Clock className="size-4 text-zinc-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-zinc-400">Last Used</p>
                <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  {new Date(template.lastUsed).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DetailShell>
  );
}
