"use client";

import { ShieldOff } from "lucide-react";
import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-6 px-4">
      <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center">
        <ShieldOff className="size-8 text-primary" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
          Access Denied
        </h1>
        <p className="text-sm text-zinc-500 max-w-sm">
          You don't have permission to access this page. Contact your administrator if you think this is a mistake.
        </p>
      </div>
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
