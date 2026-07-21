type LegacyPermission = string;

export type RbacPermission =
  | "empresa.visualizar" | "empresa.configurar"
  | "usuarios.visualizar" | "usuarios.criar" | "usuarios.alterar" | "usuarios.inativar"
  | "produto.visualizar" | "produto.criar" | "produto.alterar" | "produto.inativar"
  | "estoque.visualizar" | "estoque.movimentar"
  | "venda.visualizar" | "venda.criar" | "venda.cancelar" | "pagamento.receber"
  | "caixa.abrir" | "caixa.fechar"
  | "cliente.visualizar" | "cliente.criar" | "cliente.alterar"
  | "fornecedor.visualizar" | "fornecedor.criar" | "fornecedor.alterar"
  | "compras.visualizar" | "compras.criar" | "relatorios.visualizar"
  | "financeiro.visualizar" | "crm.visualizar" | "auditoria.visualizar";

export type RbacRole =
  | "global_admin" | "administrador" | "gerente" | "caixa" | "vendedor" | "estoque"
  | "financeiro" | "atendimento";

export const RBAC_PERMISSIONS = {
  companyView: "empresa.visualizar", companyConfigure: "empresa.configurar",
  usersView: "usuarios.visualizar", usersCreate: "usuarios.criar", usersEdit: "usuarios.alterar", usersDeactivate: "usuarios.inativar",
  productView: "produto.visualizar", productCreate: "produto.criar", productEdit: "produto.alterar", productDeactivate: "produto.inativar",
  stockView: "estoque.visualizar", stockMove: "estoque.movimentar",
  saleView: "venda.visualizar", saleCreate: "venda.criar", saleCancel: "venda.cancelar", receivePayment: "pagamento.receber",
  cashOpen: "caixa.abrir", cashClose: "caixa.fechar",
  customerView: "cliente.visualizar", customerCreate: "cliente.criar", customerEdit: "cliente.alterar",
  supplierView: "fornecedor.visualizar", supplierCreate: "fornecedor.criar", supplierEdit: "fornecedor.alterar",
  purchaseView: "compras.visualizar", purchaseCreate: "compras.criar", reportsView: "relatorios.visualizar",
  financeView: "financeiro.visualizar", crmView: "crm.visualizar", auditView: "auditoria.visualizar",
} as const satisfies Record<string, RbacPermission>;

const ALL_COMPANY_PERMISSIONS = Object.values(RBAC_PERMISSIONS).filter((p) => p !== "crm.visualizar") as RbacPermission[];

const ROLE_DEFAULTS: Record<RbacRole, readonly RbacPermission[]> = {
  global_admin: ALL_COMPANY_PERMISSIONS,
  administrador: ALL_COMPANY_PERMISSIONS,
  gerente: ALL_COMPANY_PERMISSIONS,
  caixa: ["empresa.visualizar", "produto.visualizar", "estoque.visualizar", "venda.visualizar", "venda.criar", "pagamento.receber", "caixa.abrir", "caixa.fechar", "cliente.visualizar"],
  vendedor: ["empresa.visualizar", "produto.visualizar", "venda.visualizar", "venda.criar", "cliente.visualizar", "cliente.criar"],
  estoque: ["empresa.visualizar", "produto.visualizar", "produto.criar", "produto.alterar", "produto.inativar", "estoque.visualizar", "estoque.movimentar", "fornecedor.visualizar"],
  financeiro: ["empresa.visualizar", "financeiro.visualizar", "relatorios.visualizar"],
  atendimento: ["empresa.visualizar", "cliente.visualizar", "cliente.criar", "cliente.alterar", "crm.visualizar"],
};

const LEGACY_PERMISSION_MAP: Partial<Record<RbacPermission, LegacyPermission>> = {
  "produto.criar": "produto_salvar", "produto.alterar": "produto_salvar", "estoque.movimentar": "produto_salvar",
  "venda.cancelar": "venda_cancelar", "caixa.abrir": "caixa_abrir_fechar", "caixa.fechar": "caixa_abrir_fechar",
  "relatorios.visualizar": "relatorios_acessar",
};

export function normalizeRbacRole(profile: string | null | undefined): RbacRole | null {
  if (profile === "global_admin" || profile === "financeiro" || profile === "atendimento") return profile;
  if (["administrador", "gerente", "caixa", "vendedor", "estoque"].includes(profile || "")) return profile as RbacRole;
  return null;
}

export function hasRbacPermission(profile: string | null | undefined, permission: RbacPermission, legacyPermissions?: Partial<Record<LegacyPermission, boolean>>) {
  const role = normalizeRbacRole(profile);
  if (!role) return false;
  const legacy = LEGACY_PERMISSION_MAP[permission];
  if (legacy && legacyPermissions && legacy in legacyPermissions) return Boolean(legacyPermissions[legacy]);
  return ROLE_DEFAULTS[role].includes(permission);
}

const LEGACY_TO_RBAC: Partial<Record<LegacyPermission, RbacPermission>> = {
  produto_salvar: "produto.alterar",
  preco_alterar: "produto.alterar",
  caixa_abrir_fechar: "caixa.abrir",
  venda_cancelar: "venda.cancelar",
  relatorios_acessar: "relatorios.visualizar",
};

export function hasLegacyPermission(profile: string | null | undefined, permission: LegacyPermission, legacyPermissions: Partial<Record<LegacyPermission, boolean>>) {
  const mapped = LEGACY_TO_RBAC[permission];
  return mapped ? hasRbacPermission(profile, mapped, legacyPermissions) : Boolean(legacyPermissions[permission]);
}

export function getMockRole(): RbacRole | null {
  if (typeof window === "undefined") return null;
  return normalizeRbacRole(sessionStorage.getItem("mikaon:mock-login-role"));
}

export function logAccessDenied(permission: RbacPermission, route?: string) {
  if (typeof window !== "undefined") console.warn(`[RBAC] Acesso negado: ${permission}${route ? ` em ${route}` : ""}`);
}
