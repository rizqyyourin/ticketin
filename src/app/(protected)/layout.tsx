"use client";

import { 
  BarChart3, 
  Clock, 
  LayoutDashboard, 
  LogOut, 
  MessageSquare, 
  Moon, 
  Settings, 
  Sun, 
  Ticket, 
  User,
  Users,
  UserCog,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  TrendingUp,
  Smile,
  Meh,
  Frown,
  ClipboardList,
  ChevronDown,
  MessageCircleHeart,
  BookOpen,
  Mail,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { QuickActionPalette } from "@/components/quick-action-palette";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/notification-bell";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", module: null },
  { icon: ClipboardList, label: "Service Request", href: "/service-request", module: "Service Request" },
  { icon: UserCog, label: "User Management", href: "/user-management", module: "User Management" },
  { icon: Users, label: "Contact", href: "/contact", module: "Contact" },
];

const ROUTE_MODULE_MAP = [
  { prefix: "/service-request", module: "Service Request" },
  { prefix: "/user-management", module: "User Management" },
  { prefix: "/contact", module: "Contact" },
  { prefix: "/settings", module: "Settings" },
];

const settingsItems = [
  { icon: MessageCircleHeart, label: "CSAT Survey", href: "/settings/csat" },
  { icon: BookOpen,           label: "Knowledge Management", href: "/settings/knowledge" },
  { icon: Mail,               label: "Email Templates", href: "/settings/email-templates" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [permissions, setPermissions] = useState<Record<string, boolean> | null>(null);

  useEffect(() => {
    if (pathname.startsWith("/settings")) setIsSettingsOpen(true);
  }, [pathname]);

  const fetchPermissions = useCallback(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((data) => {
        const perms = (data.role?.permissions as Record<string, boolean>) ?? {};
        setPermissions(perms);
        for (const { prefix, module } of ROUTE_MODULE_MAP) {
          if (pathname.startsWith(prefix) && perms[module] === false) {
            router.replace("/forbidden");
            return;
          }
        }
      })
      .catch(() => setPermissions({}));
  }, [pathname, router]);

  useEffect(() => { fetchPermissions(); }, [fetchPermissions]);

  useEffect(() => {
    window.addEventListener("permissions-updated", fetchPermissions);
    return () => window.removeEventListener("permissions-updated", fetchPermissions);
  }, [fetchPermissions]);

  useEffect(() => {
    // Check initial preference from document class
    if (document.documentElement.classList.contains("dark")) {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  }, []);

  const toggleDarkMode = () => {
    // Force immediate class update
    if (document.documentElement.classList.contains("dark")) {
      document.documentElement.classList.remove("dark");
      setTheme("light");
    } else {
      document.documentElement.classList.add("dark");
      setTheme("dark");
    }
  };

  const handleLogout = () => {
    setIsAccountOpen(false);
    router.replace("/");
  };

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 font-sans transition-colors duration-200">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-16'} shrink-0 transition-all duration-300 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col relative z-20`}>
        {/* Toggle button — always sits on the border line */}
        <button
          onClick={() => setIsSidebarOpen((o) => !o)}
          title={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          className="absolute right-0 top-8 -translate-y-1/2 translate-x-1/2 z-30 size-5 flex items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-400 hover:border-primary hover:text-primary transition-colors shadow-sm"
        >
          {isSidebarOpen ? <PanelLeftClose className="size-3" /> : <PanelLeftOpen className="size-3" />}
        </button>

        <div className={`flex items-center ${isSidebarOpen ? 'px-6' : 'justify-center px-3'} h-16 shrink-0`}>
          <Link href="/dashboard" className="flex items-center gap-2 group overflow-hidden">
            <div className="size-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <Ticket className="size-5 text-white" />
            </div>
            {isSidebarOpen && (
              <span className="font-extrabold text-xl tracking-tighter text-zinc-900 dark:text-zinc-100 whitespace-nowrap">ticketin<span className="text-primary">.</span></span>
            )}
          </Link>
        </div>

        <nav className={`flex-1 py-4 space-y-1 ${isSidebarOpen ? 'px-4' : 'px-2'}`}>
          {sidebarItems.filter((item) => !item.module || permissions === null || permissions[item.module] !== false).map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={!isSidebarOpen ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all group ${
                  isSidebarOpen ? '' : 'justify-center'
                } ${
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                <item.icon className={`size-4 shrink-0 ${isActive ? "text-primary" : "text-zinc-400 group-hover:text-primary"}`} />
                {isSidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}

          {/* Settings accordion */}
          {(permissions === null || permissions["Settings"] !== false) && <div>
            {isSidebarOpen ? (
              <>
                <button
                  onClick={() => setIsSettingsOpen((o) => !o)}
                  className={`cursor-pointer w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all group ${
                    pathname.startsWith("/settings")
                      ? "bg-primary/10 text-primary"
                      : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
                  }`}
                >
                  <Settings className={`size-4 ${
                    pathname.startsWith("/settings") ? "text-primary" : "text-zinc-400 group-hover:text-primary"
                  }`} />
                  <span className="flex-1 text-left">Settings</span>
                  <ChevronDown className={`size-3.5 transition-transform duration-200 ${
                    isSettingsOpen ? "rotate-180" : ""
                  } ${
                    pathname.startsWith("/settings") ? "text-primary" : "text-zinc-400"
                  }`} />
                </button>
                {isSettingsOpen && (
                  <div className="mt-1 ml-3 pl-3 border-l border-zinc-200 dark:border-zinc-700 space-y-0.5">
                    {settingsItems.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all group ${
                            isActive
                              ? "bg-primary/10 text-primary"
                              : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
                          }`}
                        >
                          <item.icon className={`size-3.5 ${
                            isActive ? "text-primary" : "text-zinc-400 group-hover:text-primary"
                          }`} />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <Link
                href="/settings/csat"
                title="Settings"
                className={`flex items-center justify-center px-3 py-2 rounded-xl text-sm font-medium transition-all group ${
                  pathname.startsWith("/settings")
                    ? "bg-primary/10 text-primary"
                    : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                <Settings className={`size-4 ${
                  pathname.startsWith("/settings") ? "text-primary" : "text-zinc-400 group-hover:text-primary"
                }`} />
              </Link>
            )}
          </div>}
        </nav>

        <div className={`p-4 border-t border-zinc-100 dark:border-zinc-800 ${!isSidebarOpen ? 'flex justify-center' : ''}`}>
          <button
            onClick={handleLogout}
            title={!isSidebarOpen ? 'Logout' : undefined}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-zinc-500 hover:bg-primary/5 hover:text-primary transition-all group ${
              isSidebarOpen ? 'w-full' : ''
            }`}
          >
            <LogOut className="size-4 text-zinc-400 group-hover:text-primary" />
            {isSidebarOpen && 'Logout'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Navbar */}
        <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-8 flex items-center justify-between relative z-30">
          <QuickActionPalette
            theme={theme}
            onToggleTheme={toggleDarkMode}
            onLogout={handleLogout}
          />
          <div className="flex items-center gap-4">
            <NotificationBell />

            <button
              onClick={toggleDarkMode}
              className="size-9 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all focus:outline-none focus:ring-2 focus:ring-primary/20"
              title="Toggle theme"
            >
              {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>
            
            <div className="flex items-center gap-3 pl-4 border-l border-zinc-200 dark:border-zinc-800 relative">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{session?.user?.name ?? "..."}</p>
                <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest">{(session?.user as { role?: string })?.role ?? "..."}</p>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAccountOpen(!isAccountOpen);
                }}
                className="size-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center overflow-hidden hover:border-primary transition-colors focus:ring-2 focus:ring-primary/20"
              >
                <User className="size-6 text-zinc-500" />
              </button>

              {/* Dropdown Menu */}
              {isAccountOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40 bg-transparent" 
                    onClick={() => setIsAccountOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl z-50 p-2 overflow-hidden ring-1 ring-black/5 dark:ring-white/5">
                    <button 
                      onClick={() => {
                          setIsAccountOpen(false);
                          router.push("/account");
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-zinc-700 dark:text-zinc-300"
                    >
                        <User className="size-3" />
                        My Account
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/5 transition-colors"
                    >
                        <LogOut className="size-3" />
                        Log out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8 bg-zinc-50 dark:bg-zinc-950 transition-colors duration-200 relative z-10">
          {children}
        </main>
      </div>
    </div>
  );
}
