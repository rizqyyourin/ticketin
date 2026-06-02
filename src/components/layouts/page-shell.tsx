import { type ReactNode } from "react";

/**
 * PageShell — wrapper for index/table pages.
 * Source of truth: /service-request (p-6 space-y-6)
 */
export function PageShell({ children }: { children: ReactNode }) {
  return <div className="p-6 space-y-6">{children}</div>;
}

/**
 * DetailShell — wrapper for detail/create/form pages.
 * Inherits p-6 space-y-6 from PageShell contract.
 */
export function DetailShell({
  children,
  maxWidth = "max-w-full",
}: {
  children: ReactNode;
  maxWidth?: string;
}) {
  return <div className={`p-6 space-y-6 ${maxWidth}`}>{children}</div>;
}
