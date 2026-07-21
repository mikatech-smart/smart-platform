import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const files = {
  router: await readFile("src/router/index.tsx", "utf8"),
  layout: await readFile("src/layouts/EmpresaLayout.tsx", "utf8"),
  form: await readFile("src/components/dashboard/EmpresaForm/EmpresaForm.tsx", "utf8"),
};

for (const route of ["produtos", "categorias", "pdv", "movimentacoes", "impressoras", "configuracoes", "canais"]) {
  assert.match(files.router, new RegExp(`path=\\"${route}\\"`), `rota ERP ausente: ${route}`);
}

assert.match(files.layout, /Estoque \/ Movimenta/);
assert.match(files.layout, /Impressoras/);
assert.match(files.form, /escopo === "admin"/);
assert.match(files.form, /return \["informacoes", "plano"\]\.includes/);

console.log("ERP module route checks passed");
