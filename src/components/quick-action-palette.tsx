"use client";

import {
  LayoutDashboard,
  ClipboardList,
  UserCog,
  Users,
  Settings,
  MessageCircleHeart,
  BookOpen,
  Mail,
  User,
  LogOut,
  Sun,
  Moon,
  Plus,
  Search,
  ArrowRight,
  Command,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";

type Action = {
  id: string;
  label: string;
  description?: string;
  icon: React.ElementType;
  group: string;
  shortcut?: string;
  onSelect: () => void;
};

type Props = {
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onLogout: () => void;
};

export function QuickActionPalette({ theme, onToggleTheme, onLogout }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const navigate = useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router]
  );

  const actions: Action[] = [
    {
      id: "nav-overview",
      label: "Overview",
      description: "Go to dashboard overview",
      icon: LayoutDashboard,
      group: "Navigate",
      onSelect: () => navigate("/dashboard"),
    },
    {
      id: "nav-service-request",
      label: "Service Request",
      description: "Manage service requests",
      icon: ClipboardList,
      group: "Navigate",
      onSelect: () => navigate("/dashboard/service-request"),
    },
    {
      id: "nav-user-management",
      label: "User Management",
      description: "Manage system users",
      icon: UserCog,
      group: "Navigate",
      onSelect: () => navigate("/dashboard/user-management"),
    },
    {
      id: "nav-contact",
      label: "Contact",
      description: "View and manage contacts",
      icon: Users,
      group: "Navigate",
      onSelect: () => navigate("/dashboard/contact"),
    },
    {
      id: "nav-csat",
      label: "CSAT Survey",
      description: "Customer satisfaction settings",
      icon: MessageCircleHeart,
      group: "Settings",
      onSelect: () => navigate("/dashboard/settings/csat"),
    },
    {
      id: "nav-knowledge",
      label: "Knowledge Management",
      description: "Manage knowledge base articles",
      icon: BookOpen,
      group: "Settings",
      onSelect: () => navigate("/dashboard/settings/knowledge"),
    },
    {
      id: "nav-email-templates",
      label: "Email Templates",
      description: "Configure outgoing email templates",
      icon: Mail,
      group: "Settings",
      onSelect: () => navigate("/dashboard/settings/email-templates"),
    },
    {
      id: "action-new-ticket",
      label: "New Service Request",
      description: "Create a new service request ticket",
      icon: Plus,
      group: "Actions",
      onSelect: () => navigate("/dashboard/service-request"),
    },
    {
      id: "action-account",
      label: "My Account",
      description: "View your account settings",
      icon: User,
      group: "Actions",
      onSelect: () => navigate("/dashboard/account"),
    },
    {
      id: "action-theme",
      label: theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode",
      description: "Toggle the color theme",
      icon: theme === "dark" ? Sun : Moon,
      group: "Actions",
      onSelect: () => {
        setOpen(false);
        onToggleTheme();
      },
    },
    {
      id: "action-logout",
      label: "Log Out",
      description: "Sign out of your account",
      icon: LogOut,
      group: "Actions",
      onSelect: () => {
        setOpen(false);
        onLogout();
      },
    },
  ];

  const filtered = query.trim()
    ? actions.filter(
        (a) =>
          a.label.toLowerCase().includes(query.toLowerCase()) ||
          a.description?.toLowerCase().includes(query.toLowerCase()) ||
          a.group.toLowerCase().includes(query.toLowerCase())
      )
    : actions;

  // Group filtered results
  const groups = filtered.reduce<Record<string, Action[]>>((acc, action) => {
    if (!acc[action.group]) acc[action.group] = [];
    acc[action.group].push(action);
    return acc;
  }, {});

  const flatFiltered = Object.values(groups).flat();

  // Open with ⌘K
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  // Keyboard navigation inside palette
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, flatFiltered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        flatFiltered[selectedIndex]?.onSelect();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, flatFiltered, selectedIndex]);

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Scroll selected item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  let flatIndex = 0;

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="group relative flex items-center gap-3 w-80 h-10 pl-4 pr-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-white dark:hover:bg-zinc-900 transition-all cursor-pointer"
      >
        <Search className="size-4 shrink-0" />
        <span className="flex-1 text-left text-zinc-400 text-sm">Quick actions...</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-[10px] font-medium text-zinc-400">
          <Command className="size-2.5" />K
        </kbd>
      </button>

      {/* Backdrop + Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 dark:bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Palette */}
          <div className="relative w-full max-w-lg mx-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl shadow-black/10 dark:shadow-black/40 overflow-hidden">
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 border-b border-zinc-100 dark:border-zinc-800">
              <Search className="size-4 text-zinc-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type an action or page name..."
                className="flex-1 h-12 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 outline-none"
              />
              <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-[10px] font-medium text-zinc-400">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div ref={listRef} className="max-h-80 overflow-y-auto py-2">
              {flatFiltered.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-zinc-400">
                  No actions found for &ldquo;{query}&rdquo;
                </p>
              ) : (
                Object.entries(groups).map(([group, items]) => (
                  <div key={group} className="mb-1">
                    <p className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                      {group}
                    </p>
                    {items.map((action) => {
                      const currentIndex = flatIndex++;
                      const isSelected = currentIndex === selectedIndex;
                      return (
                        <button
                          key={action.id}
                          data-index={currentIndex}
                          onClick={action.onSelect}
                          onMouseEnter={() => setSelectedIndex(currentIndex)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                            isSelected
                              ? "bg-primary/10 text-primary"
                              : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                          }`}
                        >
                          <span
                            className={`flex size-7 shrink-0 items-center justify-center rounded-lg ${
                              isSelected
                                ? "bg-primary/15 text-primary"
                                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                            }`}
                          >
                            <action.icon className="size-3.5" />
                          </span>
                          <span className="flex-1 text-left">
                            <span className="font-medium">{action.label}</span>
                            {action.description && (
                              <span
                                className={`block text-xs mt-0.5 ${
                                  isSelected ? "text-primary/70" : "text-zinc-400"
                                }`}
                              >
                                {action.description}
                              </span>
                            )}
                          </span>
                          {isSelected && (
                            <ArrowRight className="size-3.5 text-primary shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Footer hint */}
            <div className="px-4 py-2.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-3 text-[10px] text-zinc-400">
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 font-medium">↑↓</kbd>
                navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 font-medium">↵</kbd>
                select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 font-medium">ESC</kbd>
                close
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
