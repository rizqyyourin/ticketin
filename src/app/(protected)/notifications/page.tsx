"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  AlertTriangle,
  Mail,
  UserCheck,
  Clock,
  Filter,
  Loader2,
  Inbox,
  ExternalLink,
  ChevronDown,
  FileText,
} from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { DetailShell } from "@/components/layouts/page-shell";
import { NotificationItem } from "@/components/notification-bell";

type FilterType = "all" | "unread" | "sla_breached" | "inbound_email" | "ticket_assigned";

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [selectedNotif, setSelectedNotif] = useState<NotificationItem | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreSentinelRef = useRef<HTMLDivElement | null>(null);

  const filterOptions = [
    { id: "all", label: "All Notifications", icon: <Inbox className="size-4 text-zinc-600 dark:text-zinc-400" /> },
    { id: "unread", label: "Unread Only", icon: <Bell className="size-4 text-zinc-600 dark:text-zinc-400" /> },
    { id: "sla_breached", label: "SLA Breached", icon: <AlertTriangle className="size-4 text-zinc-600 dark:text-zinc-400" /> },
    { id: "inbound_email", label: "Inbound Email", icon: <Mail className="size-4 text-zinc-600 dark:text-zinc-400" /> },
    { id: "ticket_assigned", label: "Assigned to You", icon: <UserCheck className="size-4 text-zinc-600 dark:text-zinc-400" /> },
  ];

  const currentFilterObj = filterOptions.find((f) => f.id === activeFilter) ?? filterOptions[0];

  const fetchPage = useCallback(
    async (pageNum: number, filter: FilterType, isReset = false) => {
      try {
        if (isReset) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }

        const queryParams = new URLSearchParams({
          page: pageNum.toString(),
          limit: "10",
          filter: filter,
        });

        const res = await fetch(`/api/notifications?${queryParams}`);
        if (!res.ok) return;

        const data = await res.json();
        const fetchedItems: NotificationItem[] = data.notifications ?? [];

        setNotifications((prev) => {
          const combined = isReset ? fetchedItems : [...prev, ...fetchedItems];
          if (isReset) {
            setSelectedNotif(fetchedItems.length > 0 ? fetchedItems[0] : null);
          }
          return combined;
        });

        setHasMore(data.hasMore ?? false);
        setUnreadCount(data.unreadCount ?? 0);
        setTotal(data.total ?? 0);
      } catch (err) {
        console.error("[NotificationsPage] Error fetching notifications:", err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    []
  );

  // Handle filter change
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchPage(1, activeFilter, true);
  }, [activeFilter, fetchPage]);

  // Infinite Scroll IntersectionObserver setup
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && hasMore && !loading && !loadingMore) {
        setPage((prevPage) => {
          const nextPage = prevPage + 1;
          fetchPage(nextPage, activeFilter, false);
          return nextPage;
        });
      }
    },
    [hasMore, loading, loadingMore, activeFilter, fetchPage]
  );

  useEffect(() => {
    const option = { root: null, rootMargin: "200px", threshold: 0.1 };
    observerRef.current = new IntersectionObserver(handleObserver, option);
    if (loadMoreSentinelRef.current) {
      observerRef.current.observe(loadMoreSentinelRef.current);
    }

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [handleObserver]);

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      if (selectedNotif) {
        setSelectedNotif((prev) => (prev ? { ...prev, isRead: true } : null));
      }
    } catch (err) {
      console.error("[NotificationsPage] Failed to mark all as read:", err);
    }
  };

  const handleSelectNotif = (notif: NotificationItem) => {
    setSelectedNotif(notif);

    if (!notif.isRead) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: notif.id }),
      }).catch(() => {});
    }
  };

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "sla_breached":
        return <AlertTriangle className="size-4 text-zinc-700 dark:text-zinc-300" />;
      case "inbound_email":
        return <Mail className="size-4 text-zinc-700 dark:text-zinc-300" />;
      case "ticket_assigned":
        return <UserCheck className="size-4 text-zinc-700 dark:text-zinc-300" />;
      default:
        return <Bell className="size-4 text-zinc-700 dark:text-zinc-300" />;
    }
  };

  const getBadgeStyle = (type: NotificationItem["type"]) => {
    switch (type) {
      case "sla_breached":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "inbound_email":
        return "bg-sky-500/10 text-sky-500 border-sky-500/20";
      case "ticket_assigned":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      default:
        return "bg-primary/10 text-primary border-primary/20";
    }
  };

  return (
    <DetailShell>
      {/* Header / Breadcrumb */}
      <div className="space-y-4 mb-6">
        <Breadcrumb items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Notifications" }]} />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
                Notifications
              </h1>
              {unreadCount > 0 && (
                <span className="px-2.5 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full shadow-sm">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Track all history of SLA breach alerts, customer email replies, and ticket assignments.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Filter Dropdown Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsFilterOpen((prev) => !prev)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:border-primary hover:text-primary transition-all shadow-sm focus:outline-none"
              >
                <Filter className="size-3.5 text-zinc-500 dark:text-zinc-400" />
                <span>{currentFilterObj.label}</span>
                <ChevronDown className={`size-3.5 text-zinc-400 transition-transform ${isFilterOpen ? "rotate-180" : ""}`} />
              </button>

              {isFilterOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30 bg-transparent"
                    onClick={() => setIsFilterOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 z-40 w-56 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl p-1.5 ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-150">
                    {filterOptions.map((option) => {
                      const isSelected = activeFilter === option.id;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => {
                            setActiveFilter(option.id as FilterType);
                            setIsFilterOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                            isSelected
                              ? "bg-primary/10 text-primary"
                              : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            {option.icon}
                            <span>{option.label}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:border-primary hover:text-primary transition-all shadow-sm"
              >
                <CheckCheck className="size-4 text-primary" />
                Mark All as Read
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2-Column Master-Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Short Preview List */}
        <div className="lg:col-span-5 space-y-2.5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <Loader2 className="size-6 animate-spin text-primary" />
              <p className="text-xs text-zinc-400">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-center">
              <div className="size-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-3 text-zinc-400">
                <Inbox className="size-6" />
              </div>
              <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">No notifications</p>
              <p className="text-xs text-zinc-400 mt-1 max-w-xs">
                {activeFilter === "unread"
                  ? "All notifications have been read."
                  : "No notifications found for this filter."}
              </p>
            </div>
          ) : (
            notifications.map((notif) => {
              const isSelected = selectedNotif?.id === notif.id;
              return (
                <div
                  key={notif.id}
                  onClick={() => handleSelectNotif(notif)}
                  className={`group flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? "border-primary bg-primary/5 dark:bg-primary/10 ring-1 ring-primary/30 shadow-sm"
                      : !notif.isRead
                      ? "bg-white dark:bg-zinc-900 border-primary/30 shadow-sm hover:border-primary/50"
                      : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                  }`}
                >
                  <div className="size-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shrink-0 mt-0.5">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1.5 mb-1">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${getBadgeStyle(notif.type)}`}>
                        {notif.type.replace("_", " ")}
                      </span>
                      <span className="text-[10px] text-zinc-400 shrink-0">
                        {new Date(notif.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <h3 className={`text-xs font-bold truncate ${!notif.isRead ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-700 dark:text-zinc-300"}`}>
                      {notif.title}
                    </h3>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1 leading-normal mt-0.5">
                      {notif.message}
                    </p>
                  </div>
                </div>
              );
            })
          )}

          {/* Infinite Scroll Sentinel */}
          <div ref={loadMoreSentinelRef} className="py-2 flex justify-center">
            {loadingMore && (
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <Loader2 className="size-4 animate-spin text-primary" />
                <span>Loading more...</span>
              </div>
            )}
            {!hasMore && notifications.length > 0 && (
              <span className="text-[11px] text-zinc-400 font-medium">All notifications loaded.</span>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Full Notification Detail Panel */}
        <div className="lg:col-span-7 sticky top-6">
          {selectedNotif ? (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                <div className="flex items-start gap-3">
                  <div className="size-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shrink-0 mt-0.5">
                    {getIcon(selectedNotif.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getBadgeStyle(selectedNotif.type)}`}>
                        {selectedNotif.type.replace("_", " ")}
                      </span>
                      <span className="text-xs text-zinc-400 flex items-center gap-1">
                        <Clock className="size-3" />
                        {new Date(selectedNotif.createdAt).toLocaleString("en-US", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
                      {selectedNotif.title}
                    </h2>
                  </div>
                </div>
              </div>

              {/* Message Body Content */}
              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  Notification Message
                </p>
                <div className="bg-zinc-50 dark:bg-zinc-800/60 rounded-xl p-4 border border-zinc-100 dark:border-zinc-800">
                  <p className="text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed whitespace-pre-wrap">
                    {selectedNotif.message}
                  </p>
                </div>
              </div>

              {/* Related Ticket Info & Big Primary Red CTA */}
              {selectedNotif.serviceRequest && (
                <div className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    Associated Service Request
                  </p>
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
                    <div className="min-w-0 pr-4">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-bold text-primary">
                          #{selectedNotif.serviceRequest.ticketNumber}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium uppercase">
                          {selectedNotif.serviceRequest.status}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                        {selectedNotif.serviceRequest.subject}
                      </p>
                    </div>
                  </div>

                  {/* Primary Big Red CTA Button */}
                  <button
                    type="button"
                    onClick={() => router.push(`/service-request/${selectedNotif.serviceRequestId}`)}
                    className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-all shadow-md shadow-primary/20 active:scale-[0.99]"
                  >
                    <span>Open Ticket #{selectedNotif.serviceRequest.ticketNumber}</span>
                    <ExternalLink className="size-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 px-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-center space-y-3">
              <div className="size-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                <FileText className="size-7" />
              </div>
              <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">
                Select a Notification
              </h3>
              <p className="text-xs text-zinc-400 max-w-xs leading-relaxed">
                Click any notification card from the left panel to view its full details and associated ticket options.
              </p>
            </div>
          )}
        </div>
      </div>
    </DetailShell>
  );
}
