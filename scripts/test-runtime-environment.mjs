import assert from "node:assert/strict";
import { resolveRuntimeEnvironment } from "../src/auth/RuntimeEnvironment.ts";

const cases = [
  ["admin.mikaon.com.br", "platform"],
  ["erp.mikaon.com.br", "erp"],
  ["mikaon.com.br", "legacy"],
  ["smart.mikatech.com.br", "legacy"],
  ["localhost", "legacy"],
  ["unknown.example", "legacy"],
  [" ADMIN.MIKAON.COM.BR ", "platform"],
];

for (const [hostname, expected] of cases) {
  assert.equal(resolveRuntimeEnvironment(hostname), expected, hostname);
}

console.log(`runtime hostname tests passed: ${cases.length}`);
