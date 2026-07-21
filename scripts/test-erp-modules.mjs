import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const files = {
  router: await readFile("src/router/index.tsx", "utf8"),
  layout: await readFile("src/layouts/EmpresaLayout.tsx", "utf8"),
  form: await readFile("src/components/dashboard/EmpresaForm/EmpresaForm.tsx", "utf8"),
  pdv: await readFile("src/pages/PublicPdvPage/PublicPdvPage.tsx", "utf8"),
  guards: await readFile("src/auth/RouteGuards.tsx", "utf8"),
};

for (const route of ["produtos", "categorias", "pdv", "caixa", "movimentacoes", "impressoras", "configuracoes", "canais"]) {
  assert.match(files.router, new RegExp(`path=\\"${route}\\"`), `rota ERP ausente: ${route}`);
}

assert.match(files.layout, /Estoque \/ Movimenta/);
assert.match(files.layout, /Caixa/);
assert.match(files.layout, /Impressoras/);
assert.match(files.form, /escopo === "admin"/);
assert.match(files.form, /return \["informacoes", "plano"\]\.includes/);
assert.match(files.router, /PublicPdvPage modo="caixa"/);
assert.match(files.pdv, /modo\?: "pdv" \| "caixa"/);
assert.match(files.pdv, /caixaIndependente = modo === "caixa"/);
assert.match(files.pdv, /!caixaIndependente && !ehPerfilEstoque && podeVender/);
assert.match(files.guards, /if \(!isErpEnvironment\(\)\) return <Navigate to="\/" replace \/>/);

console.log("ERP module and Caixa route checks passed");
