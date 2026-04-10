import fs from "node:fs";
import { parse } from "yaml";

const path = new URL("../openapi.yaml", import.meta.url);
const raw = fs.readFileSync(path, "utf8");
const doc = parse(raw);

if (!doc.openapi || !doc.paths) {
  console.error("OpenAPI validation failed: missing openapi version or paths.");
  process.exit(1);
}

const requiredPaths = [
  "/api/v1/auth/register",
  "/api/v1/auth/login",
  "/api/v1/orders",
  "/api/v1/portfolio"
];

for (const p of requiredPaths) {
  if (!doc.paths[p]) {
    console.error(`OpenAPI validation failed: missing path ${p}`);
    process.exit(1);
  }
}

console.log("OpenAPI check passed.");
