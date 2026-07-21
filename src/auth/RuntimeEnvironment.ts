export type RuntimeEnvironment = "platform" | "erp" | "legacy";

export function resolveRuntimeEnvironment(hostname: string): RuntimeEnvironment {
  const normalizedHostname = hostname.trim().toLocaleLowerCase();
  if (normalizedHostname === "admin.mikaon.com.br") return "platform";
  if (normalizedHostname === "erp.mikaon.com.br") return "erp";
  return "legacy";
}

export function getRuntimeEnvironment(): RuntimeEnvironment {
  return resolveRuntimeEnvironment(window.location.hostname);
}

export function isPlatformEnvironment() {
  return getRuntimeEnvironment() === "platform";
}

export function isErpEnvironment() {
  return getRuntimeEnvironment() === "erp";
}
