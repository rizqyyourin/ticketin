"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  AlertTriangle,
  Mail,
  UserCheck,
  ChevronRight,
  Loader2,
  Clock,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

export interface NotificationItem {
  id: string;
  userId: string;
  type: "sla_breached" | "inbound_email" | "ticket_assigned";
  title: string;
  message: string;
  isRead: boolean;
  serviceRequestId: string | null;
  createdAt: string;
  serviceRequest?: {
    id: string;
    ticketNumber: string;
    subject: string;
    status: string;
  } | null;
}

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay}d ago`;
}

export function NotificationBell() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const previousUnreadCount = useRef<number | null>(null);

  const fetchNotifications = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      const res = await fetch("/api/notifications?limit=5");
      if (!res.ok) return;

      const data = await res.json();
      const newItems: NotificationItem[] = data.notifications ?? [];
      const count: number = data.unreadCount ?? 0;

      setNotifications(newItems);
      setUnreadCount(count);
      setTotalCount(data.total ?? 0);

      // Trigger toast for new unread notifications (skip initial load)
      if (previousUnreadCount.current !== null && count > previousUnreadCount.current) {
        const newest = newItems[0];
        if (newest && !newest.isRead) {
          toast(newest.title, {
            description: newest.message,
            action: newest.serviceRequestId
              ? {
                  label: "View Ticket",
                  onClick: () => router.push(`/service-request/${newest.serviceRequestId}`),
                }
              : undefined,
          });
        }
      }

      previousUnreadCount.current = count;
    } catch (err) {
      console.error("[NotificationBell] Error fetching notifications:", err);
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchNotifications(true);
    const interval = setInterval(() => {
      fetchNotifications(false);
    }, 15000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("[NotificationBell] Failed to mark all as read:", err);
    }
  };

  const handleCardClick = (notif: NotificationItem) => {
    setIsOpen(false);
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
    router.push("/notifications");
  };

  const handleTicketClick = (e: React.MouseEvent, notif: NotificationItem) => {
    e.stopPropagation();
    setIsOpen(false);
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
    if (notif.serviceRequestId) {
      router.push(`/service-request/${notif.serviceRequestId}`);
    }
  };

  const topNotifications = notifications.slice(0, 3);
  const remainingCount = Math.max(0, totalCount - topNotifications.length);

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

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative size-9 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all focus:outline-none focus:ring-2 focus:ring-primary/20"
        title="Notifications"
      >
        <Bell className="size-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 z-40 bg-transparent"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Popover */}
          <div className="absolute right-0 top-full mt-2 z-50 w-80 sm:w-96 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden ring-1 ring-black/5 dark:ring-white/5 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Notifications</span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-red-500/10 text-red-500 rounded-full border border-red-500/20">
                    {unreadCount} new
                  </span>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline transition-colors"
                >
                  <CheckCheck className="size-3.5" />
                  Mark all read
                </button>
              )}
            </div>

            {/* List Preview (Top 3 items) */}
            <div className="max-h-[360px] overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {loading ? (
                <div className="flex items-center justify-center py-8 gap-2 text-zinc-400 text-xs">
                  <Loader2 className="size-4 animate-spin text-primary" />
                  <span>Loading notifications...</span>
                </div>
              ) : topNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                  <div className="size-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-2 text-zinc-400">
                    <Bell className="size-5" />
                  </div>
                  <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">No new notifications</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">You&apos;re all caught up.</p>
                </div>
              ) : (
                topNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => handleCardClick(notif)}
                    className={`flex items-start gap-3 p-3.5 cursor-pointer transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/60 ${
                      !notif.isRead ? "bg-primary/5 dark:bg-primary/10" : ""
                    }`}
                  >
                    <div className="size-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shrink-0 mt-0.5">
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <p className={`text-xs font-bold truncate ${!notif.isRead ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-700 dark:text-zinc-300"}`}>
                          {notif.title}
                        </p>
                        <span className="text-[10px] text-zinc-400 shrink-0 flex items-center gap-1">
                          <Clock className="size-2.5" />
                          {timeAgo(notif.createdAt)}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>
                      {notif.serviceRequest && (
                        <button
                          type="button"
                          onClick={(e) => handleTicketClick(e, notif)}
                          className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:underline"
                        >
                          <span>View Ticket #{notif.serviceRequest.ticketNumber}</span>
                          <ExternalLink className="size-3 text-red-500 dark:text-red-400" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer — See More / See All Notifications */}
            <div className="p-2 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
              <Link
                href="/notifications"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold text-primary hover:bg-primary/10 transition-colors"
              >
                <span>
                  {remainingCount > 0 ? `View all notifications (+${remainingCount} more)` : "View all notifications"}
                </span>
                <ChevronRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
