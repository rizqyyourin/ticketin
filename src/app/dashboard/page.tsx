"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Plus, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Smile, 
  Meh, 
  Frown,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Inbox,
  ArrowRight,
  CalendarDays
} from "lucide-react";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { Button } from "@/components/ui/button";

const periodData = {
  Today: {
    dateRange: "May 26, 2026 - May 26, 2026",
    stats: [
      { label: "New Tickets", value: "24", icon: Inbox, trend: "+12%", up: true, color: "text-blue-500", bg: "bg-blue-500/10" },
      { label: "In Progress", value: "18", icon: Clock, trend: "+5%", up: true, color: "text-amber-500", bg: "bg-amber-500/10" },
      { label: "Resolved", value: "142", icon: CheckCircle2, trend: "+24%", up: true, color: "text-emerald-500", bg: "bg-emerald-500/10" },
      { label: "Closed", value: "320", icon: XCircle, trend: "-2%", up: false, color: "text-zinc-500", bg: "bg-zinc-500/10" },
    ],
    csat: [
      { icon: Smile, label: "Positive", value: "85%", color: "text-emerald-500", bg: "bg-emerald-500/10", barColor: "bg-emerald-500" },
      { icon: Meh, label: "Neutral", value: "12%", color: "text-amber-500", bg: "bg-amber-500/10", barColor: "bg-amber-500" },
      { icon: Frown, label: "Negative", value: "3%", color: "text-primary", bg: "bg-primary/10", barColor: "bg-primary" },
    ],
    sla: 12,
    inSla: 88,
  },
  "Last Week": {
    dateRange: "May 19, 2026 - May 25, 2026",
    stats: [
      { label: "New Tickets", value: "156", icon: Inbox, trend: "+8%", up: true, color: "text-blue-500", bg: "bg-blue-500/10" },
      { label: "In Progress", value: "62", icon: Clock, trend: "+3%", up: true, color: "text-amber-500", bg: "bg-amber-500/10" },
      { label: "Resolved", value: "438", icon: CheckCircle2, trend: "+17%", up: true, color: "text-emerald-500", bg: "bg-emerald-500/10" },
      { label: "Closed", value: "711", icon: XCircle, trend: "-1%", up: false, color: "text-zinc-500", bg: "bg-zinc-500/10" },
    ],
    csat: [
      { icon: Smile, label: "Positive", value: "82%", color: "text-emerald-500", bg: "bg-emerald-500/10", barColor: "bg-emerald-500" },
      { icon: Meh, label: "Neutral", value: "14%", color: "text-amber-500", bg: "bg-amber-500/10", barColor: "bg-amber-500" },
      { icon: Frown, label: "Negative", value: "4%", color: "text-primary", bg: "bg-primary/10", barColor: "bg-primary" },
    ],
    sla: 18,
    inSla: 82,
  },
  "This Month": {
    dateRange: "May 1, 2026 - May 26, 2026",
    stats: [
      { label: "New Tickets", value: "612", icon: Inbox, trend: "+21%", up: true, color: "text-blue-500", bg: "bg-blue-500/10" },
      { label: "In Progress", value: "238", icon: Clock, trend: "+11%", up: true, color: "text-amber-500", bg: "bg-amber-500/10" },
      { label: "Resolved", value: "1,984", icon: CheckCircle2, trend: "+29%", up: true, color: "text-emerald-500", bg: "bg-emerald-500/10" },
      { label: "Closed", value: "3,214", icon: XCircle, trend: "+4%", up: true, color: "text-zinc-500", bg: "bg-zinc-500/10" },
    ],
    csat: [
      { icon: Smile, label: "Positive", value: "88%", color: "text-emerald-500", bg: "bg-emerald-500/10", barColor: "bg-emerald-500" },
      { icon: Meh, label: "Neutral", value: "9%", color: "text-amber-500", bg: "bg-amber-500/10", barColor: "bg-amber-500" },
      { icon: Frown, label: "Negative", value: "3%", color: "text-primary", bg: "bg-primary/10", barColor: "bg-primary" },
    ],
    sla: 9,
    inSla: 91,
  },
  Custom: {
    dateRange: "Custom range selected",
    stats: [
      { label: "New Tickets", value: "48", icon: Inbox, trend: "+2%", up: true, color: "text-blue-500", bg: "bg-blue-500/10" },
      { label: "In Progress", value: "21", icon: Clock, trend: "+1%", up: true, color: "text-amber-500", bg: "bg-amber-500/10" },
      { label: "Resolved", value: "96", icon: CheckCircle2, trend: "+7%", up: true, color: "text-emerald-500", bg: "bg-emerald-500/10" },
      { label: "Closed", value: "144", icon: XCircle, trend: "0%", up: true, color: "text-zinc-500", bg: "bg-zinc-500/10" },
    ],
    csat: [
      { icon: Smile, label: "Positive", value: "79%", color: "text-emerald-500", bg: "bg-emerald-500/10", barColor: "bg-emerald-500" },
      { icon: Meh, label: "Neutral", value: "16%", color: "text-amber-500", bg: "bg-amber-500/10", barColor: "bg-amber-500" },
      { icon: Frown, label: "Negative", value: "5%", color: "text-primary", bg: "bg-primary/10", barColor: "bg-primary" },
    ],
    sla: 14,
    inSla: 86,
  },
} as const;

const filterTabs = ["Today", "Last Week", "This Month", "Custom"] as const;

export default function DashboardPage() {
  const [filter, setFilter] = useState<keyof typeof periodData>("Today");
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(new Date(2026, 4, 1));
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(new Date(2026, 4, 26));
  const [selectionStep, setSelectionStep] = useState<"start" | "end">("start");
  const [startPickerMonth, setStartPickerMonth] = useState<Date>(new Date(2026, 4, 1));
  const [endPickerMonth, setEndPickerMonth] = useState<Date>(new Date(2026, 4, 26));
  const pickerContainerRef = useRef<HTMLDivElement>(null);
  const currentPeriod = periodData[filter];
  const isCustom = filter === "Custom";

  useEffect(() => {
    if (!showCustomPicker) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerContainerRef.current && !pickerContainerRef.current.contains(e.target as Node)) {
        setShowCustomPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showCustomPicker]);

  const customRangeLabel = customStartDate && customEndDate
    ? `${format(customStartDate, "MMM d, yyyy")} - ${format(customEndDate, "MMM d, yyyy")}`
    : "Select a date range";

  const displayedDateRange = isCustom ? customRangeLabel : currentPeriod.dateRange;

  const applyCustomRange = () => {
    if (customStartDate && customEndDate) {
      setFilter("Custom");
      setShowCustomPicker(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 italic">Overview</h1>
          <p className="text-sm text-zinc-500 mt-1">Real-time performance and ticket metrics.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative" ref={pickerContainerRef}>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center p-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shrink-0">
                {filterTabs.map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      if (t === "Custom") {
                        setFilter("Custom");
                        setShowCustomPicker((v) => {
                          if (!v) {
                            setStartPickerMonth(customStartDate ?? new Date());
                            setEndPickerMonth(customEndDate ?? new Date());
                            setSelectionStep("start");
                          }
                          return !v;
                        });
                      } else {
                        setFilter(t);
                        setShowCustomPicker(false);
                      }
                    }}
                    className={`cursor-pointer px-4 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all ${
                      filter === t 
                        ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" 
                        : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-400 whitespace-nowrap select-none">
                <CalendarDays className="size-3.5 text-primary" />
                {displayedDateRange}
              </div>
            </div>

{showCustomPicker && (() => {
                const dayPickerStyle = {
                  "--rdp-day-height": "32px",
                  "--rdp-day-width": "32px",
                  "--rdp-day_button-height": "30px",
                  "--rdp-day_button-width": "30px",
                  "--rdp-nav_button-height": "1.75rem",
                  "--rdp-nav_button-width": "1.75rem",
                  "--rdp-accent-color": "var(--primary)",
                  "--rdp-range_middle-background-color": "oklch(var(--primary) / 0.1)",
                  "--rdp-range_middle-color": "inherit",
                } as React.CSSProperties;

                const handleDateSelect = (date: Date) => {
                  if (selectionStep === "start") {
                    setCustomStartDate(date);
                    setCustomEndDate(undefined);
                    setSelectionStep("end");
                    // Sync the other picker's month to keep them aligned if desired, but we can leave it
                  } else {
                    if (customStartDate && date < customStartDate) {
                      setCustomEndDate(customStartDate);
                      setCustomStartDate(date);
                    } else {
                      setCustomEndDate(date);
                    }
                    setSelectionStep("start");
                  }
                };

                return (
                  <div className="absolute top-full right-0 mt-2 z-50 w-[560px] max-w-[calc(100vw-2rem)] rounded-[1.5rem] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl p-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[1.25rem] border border-zinc-200 dark:border-zinc-800 p-3 bg-zinc-50 dark:bg-zinc-950">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-0.5">Start Date</p>
                        <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 mb-2">{customStartDate ? format(customStartDate, "PPP") : "Pick a start date"}</p>
                        <div className="[[&_.rdp-day_button]:cursor-pointer [&_.rdp-day.rdp-day_selected]:!bg-primary [&_.rdp-day.rdp-day_selected]:!border-primary [&_.rdp-day.rdp-day_selected]:!text-primary-foreground [&_.rdp-day.rdp-range_middle]:!bg-primary/10 [&_.rdp-day.rdp-range_middle]:!border-transparent [&_.rdp-day.rdp-range_middle]:!text-zinc-900 dark:[&_.rdp-day.rdp-range_middle]:!text-zinc-100 [&_.rdp-day.rdp-range_middle]:!rounded-none_.rdp-day_button]:cursor-pointer [[&_.rdp-day_button]:cursor-pointer [&_.rdp-day.rdp-day_selected]:!bg-primary [&_.rdp-day.rdp-day_selected]:!border-primary [&_.rdp-day.rdp-day_selected]:!text-primary-foreground [&_.rdp-day.rdp-range_middle]:!bg-primary/10 [&_.rdp-day.rdp-range_middle]:!border-transparent [&_.rdp-day.rdp-range_middle]:!text-zinc-900 dark:[&_.rdp-day.rdp-range_middle]:!text-zinc-100 [&_.rdp-day.rdp-range_middle]:!rounded-none_.rdp-day_range_middle_.rdp-day_button]:!bg-transparent [[&_.rdp-day_button]:cursor-pointer [&_.rdp-day.rdp-day_selected]:!bg-primary [&_.rdp-day.rdp-day_selected]:!border-primary [&_.rdp-day.rdp-day_selected]:!text-primary-foreground [&_.rdp-day.rdp-range_middle]:!bg-primary/10 [&_.rdp-day.rdp-range_middle]:!border-transparent [&_.rdp-day.rdp-range_middle]:!text-zinc-900 dark:[&_.rdp-day.rdp-range_middle]:!text-zinc-100 [&_.rdp-day.rdp-range_middle]:!rounded-none_.rdp-day_range_middle_.rdp-day_button]:!border-transparent [[&_.rdp-day_button]:cursor-pointer [&_.rdp-day.rdp-day_selected]:!bg-primary [&_.rdp-day.rdp-day_selected]:!border-primary [&_.rdp-day.rdp-day_selected]:!text-primary-foreground [&_.rdp-day.rdp-range_middle]:!bg-primary/10 [&_.rdp-day.rdp-range_middle]:!border-transparent [&_.rdp-day.rdp-range_middle]:!text-zinc-900 dark:[&_.rdp-day.rdp-range_middle]:!text-zinc-100 [&_.rdp-day.rdp-range_middle]:!rounded-none_.rdp-day_range_middle]:!bg-primary/10">
                          <DayPicker
                            mode="range"
                            selected={{ from: customStartDate, to: customEndDate }}
                            month={startPickerMonth}
                            onMonthChange={setStartPickerMonth}
                            onSelect={(_, date) => {
                              if (!date) return;
                              handleDateSelect(date);
                              setStartPickerMonth(date);
                            }}
                            captionLayout="label"
                            showOutsideDays
                            style={dayPickerStyle}
                          />
                        </div>
                      </div>

                      <div className="rounded-[1.25rem] border border-zinc-200 dark:border-zinc-800 p-3 bg-zinc-50 dark:bg-zinc-950">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-0.5">End Date</p>
                        <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 mb-2">{customEndDate ? format(customEndDate, "PPP") : "Pick an end date"}</p>
                        <div className="[[&_.rdp-day_button]:cursor-pointer [&_.rdp-day.rdp-day_selected]:!bg-primary [&_.rdp-day.rdp-day_selected]:!border-primary [&_.rdp-day.rdp-day_selected]:!text-primary-foreground [&_.rdp-day.rdp-range_middle]:!bg-primary/10 [&_.rdp-day.rdp-range_middle]:!border-transparent [&_.rdp-day.rdp-range_middle]:!text-zinc-900 dark:[&_.rdp-day.rdp-range_middle]:!text-zinc-100 [&_.rdp-day.rdp-range_middle]:!rounded-none_.rdp-day_button]:cursor-pointer [[&_.rdp-day_button]:cursor-pointer [&_.rdp-day.rdp-day_selected]:!bg-primary [&_.rdp-day.rdp-day_selected]:!border-primary [&_.rdp-day.rdp-day_selected]:!text-primary-foreground [&_.rdp-day.rdp-range_middle]:!bg-primary/10 [&_.rdp-day.rdp-range_middle]:!border-transparent [&_.rdp-day.rdp-range_middle]:!text-zinc-900 dark:[&_.rdp-day.rdp-range_middle]:!text-zinc-100 [&_.rdp-day.rdp-range_middle]:!rounded-none_.rdp-day_range_middle_.rdp-day_button]:!bg-transparent [[&_.rdp-day_button]:cursor-pointer [&_.rdp-day.rdp-day_selected]:!bg-primary [&_.rdp-day.rdp-day_selected]:!border-primary [&_.rdp-day.rdp-day_selected]:!text-primary-foreground [&_.rdp-day.rdp-range_middle]:!bg-primary/10 [&_.rdp-day.rdp-range_middle]:!border-transparent [&_.rdp-day.rdp-range_middle]:!text-zinc-900 dark:[&_.rdp-day.rdp-range_middle]:!text-zinc-100 [&_.rdp-day.rdp-range_middle]:!rounded-none_.rdp-day_range_middle_.rdp-day_button]:!border-transparent [[&_.rdp-day_button]:cursor-pointer [&_.rdp-day.rdp-day_selected]:!bg-primary [&_.rdp-day.rdp-day_selected]:!border-primary [&_.rdp-day.rdp-day_selected]:!text-primary-foreground [&_.rdp-day.rdp-range_middle]:!bg-primary/10 [&_.rdp-day.rdp-range_middle]:!border-transparent [&_.rdp-day.rdp-range_middle]:!text-zinc-900 dark:[&_.rdp-day.rdp-range_middle]:!text-zinc-100 [&_.rdp-day.rdp-range_middle]:!rounded-none_.rdp-day_range_middle]:!bg-primary/10">
                          <DayPicker
                            mode="range"
                            selected={{ from: customStartDate, to: customEndDate }}
                            month={endPickerMonth}
                            onMonthChange={setEndPickerMonth}
                            onSelect={(_, date) => {
                              if (!date) return;
                              handleDateSelect(date);
                              setEndPickerMonth(date);
                            }}
                            captionLayout="label"
                            showOutsideDays
                            style={dayPickerStyle}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="text-xs font-medium text-zinc-500">
                        Selected range: <span className="font-bold text-zinc-900 dark:text-zinc-100">{customRangeLabel}</span>
                      </div>
                      <div className="flex items-center justify-end gap-3">
                        <Button variant="outline" className="rounded-xl h-8 text-xs" onClick={() => setShowCustomPicker(false)}>Cancel</Button>
                        <Button
                          type="button"
                          className="rounded-xl h-8 text-xs"
                          onClick={(e) => {
                            e.preventDefault();
                            applyCustomRange();
                          }}
                          disabled={!customStartDate || !customEndDate}
                        >Apply range</Button>
                      </div>
                    </div>
                  </div>
                );
              })()}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {currentPeriod.stats.map((stat, i) => (
          <div 
            key={stat.label} 
            className="p-6 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-all group animate-rise"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex items-center gap-4">
              <div className={`size-12 rounded-2xl ${stat.bg} flex items-center justify-center transition-transform group-hover:rotate-6`}>
                <stat.icon className={`size-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none mb-2">{stat.label}</p>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">{stat.value}</h3>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 ${stat.up ? 'bg-emerald-500/10 text-emerald-600' : 'bg-primary/10 text-primary'}`}>
                    {stat.up ? <TrendingUp className="size-2.5" /> : <TrendingDown className="size-2.5" />}
                    {stat.trend}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Customer Satisfaction */}
        <div className="lg:col-span-2 p-8 rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 animate-rise" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center gap-2 mb-8">
            <div className="size-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Smile className="size-4 text-emerald-500" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 italic tracking-tight">Customer Satisfaction</h2>
          </div>
          
          <div className="space-y-8">
            {currentPeriod.csat.map((item) => (
              <div key={item.label} className="space-y-3 group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`size-10 rounded-xl ${item.bg} flex items-center justify-center transition-transform group-hover:rotate-12`}>
                      <item.icon className={`size-5 ${item.color}`} />
                    </div>
                    <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{item.label}</span>
                  </div>
                  <span className={`text-lg font-black tracking-tighter ${item.color}`}>{item.value}</span>
                </div>
                <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div className={`h-full ${item.barColor} transition-all duration-1000 ease-out`} style={{ width: item.value }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SLA Status */}
        <div className="p-8 rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center text-center animate-rise" style={{ animationDelay: '500ms' }}>
          <div className="flex items-center gap-2 mb-8 self-start">
            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <AlertCircle className="size-4 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 italic tracking-tight">SLA Performance</h2>
          </div>

          <div className="relative size-48">
            <svg className="size-full" viewBox="0 0 100 100">
              <circle 
                className="text-zinc-100 dark:text-zinc-800 stroke-current" 
                strokeWidth="10" 
                fill="transparent" 
                r="40" 
                cx="50" 
                cy="50" 
              />
              <circle 
                className="text-primary stroke-current" 
                strokeWidth="10" 
                strokeLinecap="round" 
                fill="transparent" 
                r="40" 
                cx="50" 
                cy="50" 
                style={{
                  strokeDasharray: "251.2",
                  strokeDashoffset: (251.2 * (1 - currentPeriod.sla / 100)).toString()
                }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black tracking-tighter text-primary leading-none">{currentPeriod.sla}%</span>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Breached</span>
            </div>
          </div>

          <div className="mt-8 space-y-4 w-full">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800">
               <div className="flex items-center gap-2">
                 <div className="size-3 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                 <span className="text-xs font-bold text-zinc-500">In SLA</span>
               </div>
                 <span className="text-sm font-black text-zinc-900 dark:text-zinc-100">{currentPeriod.inSla}%</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
