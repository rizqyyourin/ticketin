"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

// ─── Country data ─────────────────────────────────────────────────────────────

export interface Country {
  code: string;   // ISO 3166-1 alpha-2, e.g. "ID"
  name: string;
  dial: string;   // without "+", e.g. "62"
  flag: string;   // emoji
}

export const COUNTRIES: Country[] = [
  { code: "ID", name: "Indonesia",     dial: "62",  flag: "🇮🇩" },
  { code: "SG", name: "Singapore",     dial: "65",  flag: "🇸🇬" },
  { code: "MY", name: "Malaysia",      dial: "60",  flag: "🇲🇾" },
  { code: "PH", name: "Philippines",   dial: "63",  flag: "🇵🇭" },
  { code: "TH", name: "Thailand",      dial: "66",  flag: "🇹🇭" },
  { code: "VN", name: "Vietnam",       dial: "84",  flag: "🇻🇳" },
  { code: "AU", name: "Australia",     dial: "61",  flag: "🇦🇺" },
  { code: "JP", name: "Japan",         dial: "81",  flag: "🇯🇵" },
  { code: "KR", name: "South Korea",   dial: "82",  flag: "🇰🇷" },
  { code: "CN", name: "China",         dial: "86",  flag: "🇨🇳" },
  { code: "IN", name: "India",         dial: "91",  flag: "🇮🇳" },
  { code: "US", name: "United States", dial: "1",   flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom",dial: "44",  flag: "🇬🇧" },
  { code: "DE", name: "Germany",       dial: "49",  flag: "🇩🇪" },
  { code: "NL", name: "Netherlands",   dial: "31",  flag: "🇳🇱" },
];

const DEFAULT_COUNTRY = COUNTRIES[0]; // Indonesia

// ─── Parse stored value into (country, localNumber) ──────────────────────────

function parsePhone(value: string | null): { country: Country; local: string } {
  if (!value) return { country: DEFAULT_COUNTRY, local: "" };

  const v = value.startsWith("+") ? value.slice(1) : value;

  // Match longest dial code first to avoid ambiguity
  const sorted = [...COUNTRIES].sort((a, b) => b.dial.length - a.dial.length);
  for (const c of sorted) {
    if (v.startsWith(c.dial)) {
      return { country: c, local: v.slice(c.dial.length).trimStart() };
    }
  }

  return { country: DEFAULT_COUNTRY, local: value };
}

// ─── Component ────────────────────────────────────────────────────────────────

interface PhoneInputProps {
  value: string | null;
  onChange: (value: string | null) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  hasError?: boolean;
}

export function PhoneInput({
  value,
  onChange,
  className = "",
  placeholder = "8xx-xxxx-xxxx",
  disabled = false,
  hasError = false,
}: PhoneInputProps) {
  const { country: initCountry, local: initLocal } = parsePhone(value);
  const [country, setCountry] = useState<Country>(initCountry);
  const [local, setLocal] = useState(initLocal);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync if external value changes (e.g. on edit modal open)
  useEffect(() => {
    const { country: c, local: l } = parsePhone(value);
    setCountry(c);
    setLocal(l);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLocalChange = (v: string) => {
    setLocal(v);
    if (!v.trim()) {
      onChange(null);
    } else {
      onChange(`+${country.dial}${v.trim()}`);
    }
  };

  const handleCountryChange = (c: Country) => {
    setCountry(c);
    setOpen(false);
    if (!local.trim()) {
      onChange(null);
    } else {
      onChange(`+${c.dial}${local.trim()}`);
    }
  };

  const baseCls =
    "flex h-[38px] w-full text-sm rounded-xl border bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition-all overflow-hidden";
  const borderCls = hasError
    ? "border-red-400"
    : "border-zinc-200 dark:border-zinc-700";

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className={`${baseCls} ${borderCls}`}>
        {/* Country selector trigger */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1 px-3 border-r border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-700/50 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors shrink-0 h-full"
        >
          <span className="text-base leading-none">{country.flag}</span>
          <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
            +{country.dial}
          </span>
          <ChevronDown
            className={`size-3 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>

        {/* Local number input */}
        <input
          type="tel"
          value={local}
          onChange={(e) => handleLocalChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 px-3 bg-transparent text-sm placeholder:text-zinc-400 focus:outline-none disabled:opacity-50"
        />
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 top-full left-0 mt-1 w-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-lg overflow-hidden">
          <div className="max-h-56 overflow-y-auto">
            {COUNTRIES.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => handleCountryChange(c)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors ${
                  c.code === country.code ? "bg-primary/5 text-primary font-semibold" : "text-zinc-700 dark:text-zinc-300"
                }`}
              >
                <span className="text-base">{c.flag}</span>
                <span className="flex-1 truncate">{c.name}</span>
                <span className="text-xs text-zinc-400 font-mono shrink-0">+{c.dial}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
