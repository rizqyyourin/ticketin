"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Frown, Meh, Smile, Loader2 } from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";

type Rating = "dissatisfied" | "neutral" | "satisfied";
type Phase = "loading" | "rating" | "submitted" | "already_submitted" | "error";

interface SurveyData {
  ticketNumber: string;
  question: string;
  thankYou: string;
  alreadySubmitted: boolean;
}

const RATINGS: { value: Rating; icon: React.ElementType; label: string; color: string; bg: string; border: string; ring: string }[] = [
  { value: "dissatisfied", icon: Frown, label: "Dissatisfied", color: "text-red-500", bg: "bg-red-50 dark:bg-red-500/10", border: "border-red-200 dark:border-red-500/30", ring: "ring-red-300" },
  { value: "neutral", icon: Meh, label: "Neutral", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10", border: "border-amber-200 dark:border-amber-500/30", ring: "ring-amber-300" },
  { value: "satisfied", icon: Smile, label: "Satisfied", color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-200 dark:border-emerald-500/30", ring: "ring-emerald-300" },
];

export default function SurveyPage() {
  const { token } = useParams<{ token: string }>();
  const searchParams = useSearchParams();
  const prefilledRating = searchParams.get("rating") as Rating | null;

  const [phase, setPhase] = useState<Phase>("loading");
  const [data, setData] = useState<SurveyData | null>(null);
  const [selected, setSelected] = useState<Rating | null>(prefilledRating ?? null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/survey/${token}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { setPhase("error"); return; }
        setData(d);
        setPhase(d.alreadySubmitted ? "already_submitted" : "rating");
      })
      .catch(() => setPhase("error"));
  }, [token]);

  const handleSubmit = async () => {
    if (!selected) return;
    setSubmitting(true);
    const res = await fetch(`/api/survey/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating: selected }),
    });
    setSubmitting(false);
    if (res.ok || res.status === 409) setPhase("submitted");
  };

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        {/* Card header */}
        <div className="bg-[#e5484d] px-6 py-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="size-6 rounded-md bg-white/20 flex items-center justify-center">
              <span className="text-white text-[9px] font-black">T</span>
            </div>
            <span className="font-extrabold text-[14px] tracking-tighter text-white">ticketin.</span>
          </div>
          {data && (
            <p className="text-white/80 text-[12px]">
              Ticket <span className="font-mono font-semibold">{data.ticketNumber}</span>
            </p>
          )}
        </div>

        <div className="px-6 py-6">
          {phase === "loading" && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-6 text-zinc-400 animate-spin" />
            </div>
          )}

          {phase === "error" && (
            <div className="text-center py-4">
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Invalid survey link</p>
              <p className="text-xs text-zinc-500 mt-1">This link may have expired or is invalid.</p>
            </div>
          )}

          {phase === "already_submitted" && (
            <div className="text-center py-4 space-y-3">
              <div className="size-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto">
                <CheckCircle2 className="size-6 text-zinc-400" />
              </div>
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Already submitted</p>
              <p className="text-xs text-zinc-500">You&apos;ve already rated this ticket. Thank you!</p>
            </div>
          )}

          {phase === "rating" && data && (
            <div className="space-y-5">
              <div>
                <p className="text-[13px] font-semibold text-zinc-800 dark:text-zinc-200 leading-snug">{data.question}</p>
                <p className="text-[11px] text-zinc-400 mt-1">Select one option below</p>
              </div>

              <div className="space-y-2">
                {RATINGS.map(({ value, icon: Icon, label, color, bg, border, ring }) => (
                  <button
                    key={value}
                    onClick={() => setSelected(value)}
                    className={`cursor-pointer w-full flex items-center gap-3 px-3 py-3 rounded-xl border ${bg} ${border} transition-all ${selected === value ? `ring-2 ${ring}` : "hover:ring-1"}`}
                  >
                    <Icon className={`size-5 ${color}`} />
                    <span className={`text-[13px] font-semibold ${color}`}>{label}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={handleSubmit}
                disabled={!selected || submitting}
                className="cursor-pointer w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#e5484d] text-white text-sm font-semibold disabled:opacity-50 transition-opacity"
              >
                {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
                {submitting ? "Submitting..." : "Submit Feedback"}
              </button>
            </div>
          )}

          {phase === "submitted" && data && (
            <div className="text-center py-4 space-y-3">
              <div className="size-12 rounded-full bg-emerald-100 dark:bg-emerald-500/15 flex items-center justify-center mx-auto">
                <CheckCircle2 className="size-6 text-emerald-500" />
              </div>
              <p className="text-[13px] font-semibold text-zinc-800 dark:text-zinc-200 leading-snug">{data.thankYou}</p>
              <p className="text-[11px] text-zinc-400">You can close this page.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
