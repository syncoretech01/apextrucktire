import "server-only";

export const isProd = process.env.NODE_ENV === "production";

const warned = new Set<string>();

/** One-time development warning for a missing integration. Silent in production. */
export function devWarn(key: string, msg: string) {
  if (isProd || warned.has(key)) return;
  warned.add(key);
  console.warn(`[apex] ${msg}`);
}
