export type HandoffTraceFields = {
  attemptId?: string;
  handoffFingerprint?: string;
  companySlug?: string;
  tabId?: string;
  [key: string]: unknown;
};

export function getHandoffTabId() {
  const key = "mikaon:handoff-tab-id";
  const current = sessionStorage.getItem(key);
  if (current) return current;

  const value = crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  sessionStorage.setItem(key, value);
  return value;
}

export function createHandoffAttemptId() {
  return crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export async function getHandoffFingerprint(token: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 12);
}

export function traceHandoff(event: string, fields: HandoffTraceFields = {}) {
  console.info("[MIKAON HANDOFF TRACE]", event, {
    ...fields,
    timestamp: new Date().toISOString(),
  });
}
