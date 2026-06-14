import type { ReactNode } from "react";
import { Check, Mail, MessageSquare, Phone, Shield, User } from "lucide-react";

function MockupChrome({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="absolute inset-0 flex flex-col p-3 sm:p-4 md:p-5">
      <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5 dark:border-zinc-800">
        <div className="flex gap-1.5">
          <div className="size-2 rounded-full bg-zinc-200 dark:bg-zinc-700" />
          <div className="size-2 rounded-full bg-zinc-200 dark:bg-zinc-700" />
          <div className="size-2 rounded-full bg-zinc-200 dark:bg-zinc-700" />
        </div>
        <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">{label}</span>
      </div>
      <div className="mt-3 flex-1 min-h-0">{children}</div>
    </div>
  );
}

export function InboxMockup() {
  const channels = [
    { icon: Mail, label: "Email", count: 12, active: true },
    { icon: MessageSquare, label: "Chat", count: 5, active: false },
    { icon: Phone, label: "Phone", count: 2, active: false },
  ];

  const messages = [
    { name: "Sarah Chen", preview: "Invoice #4821 needs urgent review...", time: "2m", unread: true, channel: "email" },
    { name: "James Park", preview: "Thanks for the quick turnaround!", time: "8m", unread: true, channel: "chat" },
    { name: "Acme Corp", preview: "Re: SLA extension request", time: "14m", unread: false, channel: "email" },
    { name: "Lisa Wong", preview: "Can we schedule a callback?", time: "22m", unread: false, channel: "phone" },
  ];

  return (
    <MockupChrome label="Unified Inbox">
      <div className="flex h-full gap-2.5">
        <div className="flex w-[72px] shrink-0 flex-col gap-1.5">
          {channels.map((ch) => (
            <div
              key={ch.label}
              className={`relative flex flex-col items-center gap-1 rounded-xl px-1.5 py-2 text-center transition-colors ${
                ch.active
                  ? "bg-primary/10 text-primary"
                  : "bg-zinc-50 text-zinc-400 dark:bg-zinc-800/50"
              }`}
            >
              <ch.icon className="size-3.5" />
              <span className="text-[8px] font-semibold leading-none">{ch.label}</span>
              {ch.count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex size-3.5 items-center justify-center rounded-full bg-primary text-[7px] font-bold text-white">
                  {ch.count}
                </span>
              )}
            </div>
          ))}
          <div className="mt-auto flex items-center justify-center gap-1 rounded-lg bg-emerald-500/10 px-1 py-1.5">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-sync-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
            </span>
            <span className="text-[7px] font-bold text-emerald-600 dark:text-emerald-400">Live</span>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1.5 overflow-hidden">
          {messages.map((msg, i) => (
            <div
              key={msg.name}
              className={`animate-message-in flex items-start gap-2 rounded-xl border px-2.5 py-2 ${
                msg.unread
                  ? "border-primary/20 bg-primary/[0.04]"
                  : "border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-900/60"
              }`}
              style={{ animationDelay: `${i * 400}ms` }}
            >
              <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-[9px] font-bold text-zinc-500 dark:bg-zinc-800">
                {msg.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span className={`truncate text-[10px] font-semibold ${msg.unread ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-600 dark:text-zinc-400"}`}>
                    {msg.name}
                  </span>
                  <span className="shrink-0 text-[8px] text-zinc-400">{msg.time}</span>
                </div>
                <p className="truncate text-[9px] text-zinc-500 dark:text-zinc-400">{msg.preview}</p>
              </div>
              {msg.unread && <div className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />}
            </div>
          ))}

          <div className="animate-typing-dots mt-auto flex items-center gap-1.5 rounded-xl border border-dashed border-zinc-200 bg-zinc-50/80 px-2.5 py-2 dark:border-zinc-700 dark:bg-zinc-800/40">
            <div className="flex gap-0.5">
              <span className="size-1 animate-bounce rounded-full bg-zinc-400 [animation-delay:0ms]" />
              <span className="size-1 animate-bounce rounded-full bg-zinc-400 [animation-delay:150ms]" />
              <span className="size-1 animate-bounce rounded-full bg-zinc-400 [animation-delay:300ms]" />
            </div>
            <span className="text-[8px] text-zinc-400">New message incoming...</span>
          </div>
        </div>
      </div>
    </MockupChrome>
  );
}

const queueTickets = [
  { id: "TKT-1042", subject: "Payment gateway timeout", priority: "high" as const, agent: "AR" },
  { id: "TKT-1038", subject: "Account access locked", priority: "high" as const, agent: "MK" },
  { id: "TKT-1051", subject: "Billing inquiry", priority: "medium" as const, agent: "—" },
  { id: "TKT-1047", subject: "Feature request: export", priority: "low" as const, agent: "—" },
];

const priorityStyles = {
  high: "bg-red-500/10 text-red-500 border-red-500/20",
  medium: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  low: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
};

export function QueueMockup() {
  return (
    <MockupChrome label="Smart Queue">
      <div className="flex h-full flex-col gap-2">
        <div className="flex items-center justify-between rounded-lg bg-zinc-50 px-2.5 py-1.5 dark:bg-zinc-800/50">
          <span className="text-[9px] font-bold text-zinc-500">Priority Sort</span>
          <div className="flex items-center gap-1">
            <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[8px] font-bold text-primary">SLA</span>
            <span className="rounded bg-zinc-200 px-1.5 py-0.5 text-[8px] font-medium text-zinc-500 dark:bg-zinc-700">Load</span>
          </div>
        </div>

        <div className="relative flex-1 space-y-1.5 overflow-hidden">
          {queueTickets.map((ticket, i) => (
            <div
              key={ticket.id}
              className="animate-queue-item flex items-center gap-2 rounded-xl border border-zinc-100 bg-white px-2.5 py-2 dark:border-zinc-800 dark:bg-zinc-900/60"
              style={{ animationDelay: `${i * 600}ms` }}
            >
              <span className="w-14 shrink-0 text-[8px] font-mono font-semibold text-zinc-400">{ticket.id}</span>
              <span className="min-w-0 flex-1 truncate text-[9px] font-medium text-zinc-700 dark:text-zinc-300">
                {ticket.subject}
              </span>
              <span className={`shrink-0 rounded border px-1 py-0.5 text-[7px] font-bold uppercase ${priorityStyles[ticket.priority]}`}>
                {ticket.priority}
              </span>
              <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-[7px] font-bold text-zinc-500 dark:bg-zinc-800">
                {ticket.agent}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1.5">
          <span className="text-[8px] font-medium text-emerald-600 dark:text-emerald-400">Auto-routed to Agent MK</span>
          <Check className="size-3 text-emerald-500" strokeWidth={3} />
        </div>
      </div>
    </MockupChrome>
  );
}

const rbacUsers = [
  { name: "Admin User", role: "Super Admin", active: true },
  { name: "Agent Smith", role: "Agent", active: true },
  { name: "Viewer Only", role: "Read-only", active: false },
];

const permissions = ["Service Request", "Contact", "Dashboard", "Settings"];

export function RbacMockup() {
  return (
    <MockupChrome label="Access Control">
      <div className="flex h-full flex-col gap-2">
        <div className="space-y-1">
          {rbacUsers.map((user, i) => (
            <div
              key={user.name}
              className="animate-rbac-row flex items-center gap-2 rounded-lg border border-zinc-100 bg-white px-2 py-1.5 dark:border-zinc-800 dark:bg-zinc-900/60"
              style={{ animationDelay: `${i * 300}ms` }}
            >
              <div className="flex size-5 items-center justify-center rounded-full bg-primary/10">
                <User className="size-2.5 text-primary" />
              </div>
              <span className="min-w-0 flex-1 truncate text-[9px] font-semibold text-zinc-800 dark:text-zinc-200">
                {user.name}
              </span>
              <span className={`shrink-0 rounded border px-1.5 py-0.5 text-[7px] font-bold ${
                user.role === "Super Admin"
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800"
              }`}>
                {user.role}
              </span>
            </div>
          ))}
        </div>

        <div className="flex-1 rounded-xl border border-zinc-100 bg-zinc-50/80 p-2 dark:border-zinc-800 dark:bg-zinc-800/30">
          <div className="mb-1.5 flex items-center gap-1">
            <Shield className="size-3 text-primary" />
            <span className="text-[8px] font-bold uppercase tracking-wider text-zinc-500">Permissions</span>
          </div>
          <div className="grid grid-cols-2 gap-1">
            {permissions.map((perm, i) => {
              const enabled = i < 3;
              return (
                <div
                  key={perm}
                  className="flex items-center justify-between rounded-md bg-white px-1.5 py-1 dark:bg-zinc-900/60"
                >
                  <span className="truncate text-[7px] font-medium text-zinc-600 dark:text-zinc-400">{perm}</span>
                  <div
                    className={`relative h-3 w-5 shrink-0 rounded-full transition-colors ${
                      enabled ? "bg-primary" : "bg-zinc-200 dark:bg-zinc-700"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 size-2 rounded-full bg-white shadow-sm transition-all ${
                        enabled ? "animate-toggle-on right-0.5" : "left-0.5"
                      }`}
                      style={{ animationDelay: `${i * 500 + 800}ms` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="animate-audit-flash rounded-lg border border-zinc-100 bg-white px-2 py-1.5 dark:border-zinc-800 dark:bg-zinc-900/60">
          <p className="text-[7px] text-zinc-400">
            <span className="font-mono text-zinc-500">10:42:03</span>{" "}
            <span className="text-zinc-600 dark:text-zinc-300">Role updated</span>{" "}
            <span className="font-semibold text-primary">Agent → Admin</span>
          </p>
        </div>
      </div>
    </MockupChrome>
  );
}

export const featureMockups = {
  "Omnichannel Inbox": InboxMockup,
  "Smart Queueing": QueueMockup,
  "Advanced RBAC": RbacMockup,
} as const;
