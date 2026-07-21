import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const router = await readFile("src/router/index.tsx", "utf8");
const form = await readFile("src/components/dashboard/EmpresaForm/EmpresaForm.tsx", "utf8");
const layout = await readFile("src/layouts/EmpresaLayout.tsx", "utf8");

for (const route of ["path=\"produtos\"", "path=\"categorias\"", "path=\"movimentacoes\"", "path=\"configuracoes\"", "path=\"canais\""]) {
  assert.match(router, new RegExp(route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), route);
}

assert.match(form, /EmpresaFormEscopo = "admin" \| "erp"/);
assert.match(form, /escopo === "admin"/);
assert.match(layout, /Canais p/);
assert.match(layout, /Configura/);

console.log("ERP architecture checks passed");
