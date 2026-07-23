import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const files = {
  router: await readFile("src/router/index.tsx", "utf8"),
  layout: await readFile("src/layouts/EmpresaLayout.tsx", "utf8"),
  navigation: await readFile("src/navigation/empresaRoutes.ts", "utf8"),
  form: await readFile("src/components/dashboard/EmpresaForm/EmpresaForm.tsx", "utf8"),
  pdv: await readFile("src/pages/PublicPdvPage/PublicPdvPage.tsx", "utf8"),
  guards: await readFile("src/auth/RouteGuards.tsx", "utf8"),
  auth: await readFile("src/auth/AuthContext.tsx", "utf8"),
  empresas: await readFile("src/pages/dashboard/Empresas.tsx", "utf8"),
};

for (const route of ["produtos", "categorias", "pdv", "caixa", "movimentacoes", "impressoras", "configuracoes", "canais"]) {
  assert.match(files.router, new RegExp(`path=\\"${route}\\"`), `rota ERP ausente: ${route}`);
}

assert.match(files.navigation, /Estoque \/ Movimenta/);
assert.match(files.navigation, /Caixa/);
assert.match(files.navigation, /Impressoras/);
assert.match(files.form, /escopo === "admin"/);
assert.match(files.form, /return \["informacoes", "plano", "erpPdv"\]\.includes/);
assert.match(files.router, /PublicPdvPage modo="caixa"/);
assert.match(files.pdv, /modo\?: "pdv" \| "caixa"/);
assert.match(files.pdv, /rotaOperacional/);
assert.match(files.pdv, /authProfile && !rotaOperacional/);
assert.doesNotMatch(files.pdv, /isErpEnvironment\(\) && authProfile\) \{/);
assert.doesNotMatch(files.guards, /Navigate to=\{`\/empresa\/\$\{profile\.empresaSlug\}`\}/);
assert.match(files.guards, /Acesso nao autorizado para esta empresa/);
assert.match(files.guards, /profile\.perfil === "global_admin"/);
assert.match(files.auth, /from\("platform_admin_users"\)/);
assert.match(files.auth, /empresaSlug: null/);
assert.match(files.empresas, /Primeiro acesso/);
assert.match(files.empresas, /verificarAdministradorPrimeiroAcesso/);
assert.match(files.pdv, /caixaIndependente = modo === "caixa"/);
assert.match(files.pdv, /!caixaIndependente && !ehPerfilEstoque && podeVender/);
assert.match(files.guards, /if \(!isErpEnvironment\(\)\) return <Navigate to="\/" replace \/>/);

console.log("ERP module and Caixa route checks passed");
