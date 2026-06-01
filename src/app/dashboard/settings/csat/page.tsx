"use client";

import { useState } from "react";
import { MessageCircleHeart, Save, Smile, Meh, Frown, Monitor, Mail, CheckCircle2 } from "lucide-react";

type Trigger = "every_reply" | "ticket_resolved";
type PreviewTab = "inbox" | "survey";
type Rating = "dissatisfied" | "neutral" | "satisfied" | null;

// ─── Inbox Email Preview ──────────────────────────────────────────────────────

function InboxEmailPreview({ question }: { question: string }) {
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
          <span className="text-[11px] font-semibold text-zinc-400 w-12 shrink-0">From</span>
          <span className="text-[12px] text-zinc-700">Ticketin Support &lt;noreply@ticketin.co.id&gt;</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-[11px] font-semibold text-zinc-400 w-12 shrink-0">To</span>
          <span className="text-[12px] text-zinc-700">customer@example.com</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-[11px] font-semibold text-zinc-400 w-12 shrink-0">Subject</span>
          <span className="text-[12px] font-semibold text-zinc-800">How did we do? Share your feedback 💬</span>
        </div>
      </div>

      {/* Email body */}
      <div className="bg-white px-5 py-5 space-y-4">
        {/* Logo */}
        <div className="flex items-center gap-1.5">
          <div className="size-6 rounded-md bg-[#e5484d] flex items-center justify-center">
            <span className="text-white text-[9px] font-black">T</span>
          </div>
          <span className="font-extrabold text-[13px] tracking-tighter text-zinc-800">
            ticketin<span className="text-[#e5484d]">.</span>
          </span>
        </div>

        <div className="border-t border-zinc-100 pt-4 space-y-3">
          <p className="text-zinc-700 text-[12px]">
            Hi <span className="font-semibold">Customer</span>,
          </p>
          <p className="text-zinc-600 text-[12px] leading-relaxed">
            Your support ticket{" "}
            <span className="font-mono font-semibold text-zinc-800">#SR0042</span> has been
            resolved. We&apos;d love to hear about your experience.
          </p>
          <p className="text-zinc-700 text-[12px] font-medium">
            {question || "How satisfied are you with our support?"}
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex gap-2 pt-1">
          <span className="cursor-pointer flex-1 flex flex-col items-center gap-1 py-2.5 rounded-lg bg-red-50 border border-red-200 hover:bg-red-100 transition-colors">
            <Frown className="size-5 text-red-500" />
            <span className="text-[10px] font-semibold text-red-500">Dissatisfied</span>
          </span>
          <span className="cursor-pointer flex-1 flex flex-col items-center gap-1 py-2.5 rounded-lg bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors">
            <Meh className="size-5 text-amber-500" />
            <span className="text-[10px] font-semibold text-amber-500">Neutral</span>
          </span>
          <span className="cursor-pointer flex-1 flex flex-col items-center gap-1 py-2.5 rounded-lg bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors">
            <Smile className="size-5 text-emerald-500" />
            <span className="text-[10px] font-semibold text-emerald-500">Satisfied</span>
          </span>
        </div>

        <p className="text-[10px] text-zinc-400 leading-relaxed">
          Clicking a rating will open a short survey page in your browser. Your response helps
          us improve our service.
        </p>

        {/* Footer */}
        <div className="border-t border-zinc-100 pt-3 space-y-1">
          <p className="text-[10px] text-zinc-400">© 2026 Ticketin. All rights reserved.</p>
          <p className="text-[10px] text-zinc-400">
            You received this email because you submitted a support ticket.{" "}
            <span className="text-[#e5484d] cursor-pointer hover:underline">Unsubscribe</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Survey Page Preview ──────────────────────────────────────────────────────

function SurveyPagePreview({ question, thankYou }: { question: string; thankYou: string }) {
  const [selected, setSelected] = useState<Rating>(null);

  const ratings: {
    value: NonNullable<Rating>;
    icon: React.ElementType;
    label: string;
    color: string;
    bg: string;
    border: string;
    ring: string;
  }[] = [
    {
      value: "dissatisfied",
      icon: Frown,
      label: "Dissatisfied",
      color: "text-red-500",
      bg: "bg-red-50",
      border: "border-red-200",
      ring: "ring-red-300",
    },
    {
      value: "neutral",
      icon: Meh,
      label: "Neutral",
      color: "text-amber-500",
      bg: "bg-amber-50",
      border: "border-amber-200",
      ring: "ring-amber-300",
    },
    {
      value: "satisfied",
      icon: Smile,
      label: "Satisfied",
      color: "text-emerald-500",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      ring: "ring-emerald-300",
    },
  ];

  return (
    <div className="bg-zinc-100 rounded-xl overflow-hidden font-sans text-[13px]">
      {/* Browser chrome */}
      <div className="bg-zinc-200 px-4 py-2.5 flex items-center gap-2 border-b border-zinc-300">
        <div className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-red-400" />
          <span className="size-2.5 rounded-full bg-amber-400" />
          <span className="size-2.5 rounded-full bg-emerald-400" />
        </div>
        <div className="flex-1 bg-white rounded-md px-3 py-1 text-[11px] text-zinc-400 text-center truncate">
          app.ticketin.co.id/survey?token=abc123&amp;ticket=SR0042
        </div>
      </div>

      {/* Page content */}
      <div className="bg-zinc-50 flex items-center justify-center p-6">
        <div className="w-full max-w-xs bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
          {/* Card header */}
          <div className="bg-[#e5484d] px-5 py-4">
            <div className="flex items-center gap-1.5 mb-3">
              <div className="size-5 rounded-md bg-white/20 flex items-center justify-center">
                <span className="text-white text-[8px] font-black">T</span>
              </div>
              <span className="font-extrabold text-[12px] tracking-tighter text-white">
                ticketin<span className="opacity-70">.</span>
              </span>
            </div>
            <p className="text-white text-[11px] opacity-80">
              Ticket <span className="font-mono font-semibold">#SR0042</span>
            </p>
          </div>

          <div className="px-5 py-5 space-y-4">
            {selected === null ? (
              <>
                <div>
                  <p className="text-[12px] font-semibold text-zinc-800 leading-snug">
                    {question || "How satisfied are you with our support?"}
                  </p>
                  <p className="text-[10px] text-zinc-400 mt-1">Select one option below</p>
                </div>
                <div className="space-y-2">
                  {ratings.map(({ value, icon: Icon, label, color, bg, border, ring }) => (
                    <button
                      key={value}
                      onClick={() => setSelected(value)}
                      className={`cursor-pointer w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border ${bg} ${border} hover:ring-2 ${ring} transition-all`}
                    >
                      <Icon className={`size-5 ${color}`} />
                      <span className={`text-[12px] font-semibold ${color}`}>{label}</span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-4 space-y-3">
                <div className="size-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="size-6 text-emerald-500" />
                </div>
                <p className="text-[12px] font-semibold text-zinc-800 leading-snug">
                  {thankYou || "Thank you for your feedback!"}
                </p>
                <button
                  onClick={() => setSelected(null)}
                  className="cursor-pointer text-[10px] text-zinc-400 hover:text-zinc-600 underline"
                >
                  Change response
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CSATSurveyPage() {
  const [enabled, setEnabled] = useState(true);
  const [question, setQuestion] = useState("How satisfied are you with our support?");
  const [thankYou, setThankYou] = useState("Thank you for your feedback! It helps us improve.");
  const [trigger, setTrigger] = useState<Trigger>("ticket_resolved");
  const [saved, setSaved] = useState(false);
  const [previewTab, setPreviewTab] = useState<PreviewTab>("inbox");

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <MessageCircleHeart className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">CSAT Survey</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Configure customer satisfaction survey settings
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
            saved ? "bg-emerald-500 text-white" : "bg-primary text-white hover:bg-primary/90"
          }`}
        >
          <Save className="size-4" />
          {saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        {/* ── Left: Settings form ── */}
        <div className="space-y-4">
          {/* Enable / Disable */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  Enable CSAT Survey
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Send satisfaction survey to customers automatically
                </p>
              </div>
              <button
                onClick={() => setEnabled((v) => !v)}
                className={`cursor-pointer relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  enabled ? "bg-primary" : "bg-zinc-200 dark:bg-zinc-700"
                }`}
              >
                <span
                  className={`inline-block size-4 rounded-full bg-white shadow-sm transition-transform ${
                    enabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Survey Question */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-2">
            <label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              Survey Question
            </label>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Shown to customers when the survey is triggered
            </p>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={2}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
            />
          </div>

          {/* Thank You Message */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-2">
            <label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              Thank You Message
            </label>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Shown after the customer submits their rating
            </p>
            <textarea
              value={thankYou}
              onChange={(e) => setThankYou(e.target.value)}
              rows={2}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
            />
          </div>

          {/* Trigger */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-3">
            <div>
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Survey Trigger</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                When should the survey be sent to the customer?
              </p>
            </div>
            <div className="space-y-2">
              {(
                [
                  { value: "every_reply", label: "Every Reply", desc: "Send after every agent reply" },
                  {
                    value: "ticket_resolved",
                    label: "Ticket Resolved",
                    desc: "Send once when the ticket is marked resolved",
                  },
                ] as { value: Trigger; label: string; desc: string }[]
              ).map((opt) => (
                <label
                  key={opt.value}
                  className="cursor-pointer flex items-center gap-3 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-primary/50 transition-colors"
                >
                  <input
                    type="radio"
                    name="trigger"
                    value={opt.value}
                    checked={trigger === opt.value}
                    onChange={() => setTrigger(opt.value)}
                    className="accent-primary size-4"
                  />
                  <div>
                    <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{opt.label}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Rating Scale */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-3">
            <div>
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Rating Scale</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">3-point scale shown to customers</p>
            </div>
            <div className="flex gap-3">
              <div className="flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/5">
                <Frown className="size-7 text-red-500" />
                <span className="text-xs font-semibold text-red-500">Dissatisfied</span>
                <span className="text-[10px] text-zinc-400 uppercase tracking-wide">Negative</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/5">
                <Meh className="size-7 text-amber-500" />
                <span className="text-xs font-semibold text-amber-500">Neutral</span>
                <span className="text-[10px] text-zinc-400 uppercase tracking-wide">Neutral</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/5">
                <Smile className="size-7 text-emerald-500" />
                <span className="text-xs font-semibold text-emerald-500">Satisfied</span>
                <span className="text-[10px] text-zinc-400 uppercase tracking-wide">Positive</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: Live Preview ── */}
        <div className="xl:sticky xl:top-6 space-y-3">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            {/* Preview tab bar */}
            <div className="px-4 pt-3 flex items-center gap-1 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-xs font-semibold text-zinc-400 mr-2 py-2">Preview</span>
              <button
                onClick={() => setPreviewTab("inbox")}
                className={`cursor-pointer flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-lg border-b-2 -mb-px transition-all ${
                  previewTab === "inbox"
                    ? "border-primary text-primary bg-primary/5"
                    : "border-transparent text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
                }`}
              >
                <Mail className="size-3.5" />
                Inbox Email
              </button>
              <button
                onClick={() => setPreviewTab("survey")}
                className={`cursor-pointer flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-lg border-b-2 -mb-px transition-all ${
                  previewTab === "survey"
                    ? "border-primary text-primary bg-primary/5"
                    : "border-transparent text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
                }`}
              >
                <Monitor className="size-3.5" />
                Survey Page
              </button>
            </div>

            <div className="p-4">
              {previewTab === "inbox" ? (
                <InboxEmailPreview question={question} />
              ) : (
                <SurveyPagePreview question={question} thankYou={thankYou} />
              )}
            </div>
          </div>

          <p className="text-[11px] text-zinc-400 text-center">
            Preview updates live as you type · Survey Page is interactive
          </p>
        </div>
      </div>
    </div>
  );
}
