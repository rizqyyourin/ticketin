/**
 * Tiny localStorage utility.
 * Keys are namespaced automatically with "ticketin_".
 */

export function getLocalItems<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(`ticketin_${key}`);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

export function addLocalItem<T>(key: string, item: T): void {
  const existing = getLocalItems<T>(key);
  localStorage.setItem(`ticketin_${key}`, JSON.stringify([item, ...existing]));
}
