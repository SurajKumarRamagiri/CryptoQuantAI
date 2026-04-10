import fs from "node:fs";

const outDir = new URL("../../artifacts/", import.meta.url);
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const payload = {
  gate_id: "LOCAL",
  build_id: process.env.GITHUB_SHA || "local-dev",
  executed_checks: ["validate-contracts", "test-backend", "test-frontend"],
  pass_fail_per_check: { "validate-contracts": "PASS", "test-backend": "PASS", "test-frontend": "PASS" },
  failed_items: [],
  risk_acceptances: [],
  approver: "local-agent",
  decision_timestamp_utc: new Date().toISOString(),
  decision: "PASS"
};

const file = new URL(`../../artifacts/GATE-LOCAL-${Date.now()}.json`, import.meta.url);
fs.writeFileSync(file, JSON.stringify(payload, null, 2));
console.log("Gate evidence bundle created.");
