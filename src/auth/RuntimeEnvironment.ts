export type RuntimeEnvironment = "platform" | "erp" | "legacy";

export function getRuntimeEnvironment(): RuntimeEnvironment {
  const hostname = window.location.hostname.toLocaleLowerCase();
  if (hostname === "admin.mikaon.com.br") return "platform";
  if (hostname === "erp.mikaon.com.br") return "erp";
  return "legacy";
}

export function isPlatformEnvironment() {
  return getRuntimeEnvironment() === "platform";
}

export function isErpEnvironment() {
  return getRuntimeEnvironment() === "erp";
}
