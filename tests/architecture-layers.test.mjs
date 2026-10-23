import test from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const SRC_ROOT = fileURLToPath(new URL("../src", import.meta.url));

const FORBIDDEN_BY_LAYER = {
  utils: ["services", "hooks", "components", "stores", "app"],
  services: ["hooks", "components", "stores", "app"],
};

const BARE_FORBIDDEN = [/^react(\/|$)/, /^next(\/|$)/];
const LEGACY_ALIAS = ["@", "lib"].join("/");
const LEGACY_DIR = ["src", "lib"].join("/");

function layerOf(relativePath) {
  const [first] = relativePath.split(path.sep);
  return first === "utils" || first === "services" ? first : null;
}

function importSpecifiers(source) {
  return [...source.matchAll(/from\s+["']([^"']+)["']/g)].map(
    (match) => match[1],
  );
}

function resolveSpecifier(fromRelativePath, specifier) {
  if (specifier.startsWith("@/")) return path.join("src", specifier.slice(2));
  if (specifier.startsWith(".")) {
    return path.normalize(path.join(path.dirname(fromRelativePath), specifier));
  }
  return null;
}

export function findLayerViolations(files) {
  const violations = [];

  for (const { path: relativePath, source } of files) {
    const layer = layerOf(relativePath);

    for (const specifier of importSpecifiers(source)) {
      if (specifier.startsWith(`${LEGACY_ALIAS}/`) || specifier.includes(`${LEGACY_DIR}/`)) {
        violations.push({ file: relativePath, specifier, reason: "legacy lib path" });
        continue;
      }

      if (!layer) continue;

      if (BARE_FORBIDDEN.some((pattern) => pattern.test(specifier))) {
        violations.push({
          file: relativePath,
          specifier,
          reason: `${layer} importa ${specifier}`,
        });
        continue;
      }

      const resolved = resolveSpecifier(relativePath, specifier)?.replace(
        /^src[\\/]/,
        "",
      );
      if (!resolved) continue;

      for (const forbidden of FORBIDDEN_BY_LAYER[layer]) {
        const prefix = forbidden + path.sep;
        if (resolved === forbidden || resolved.startsWith(prefix)) {
          violations.push({
            file: relativePath,
            specifier,
            reason: `${layer} no puede importar ${forbidden}`,
          });
          break;
        }
      }
    }
  }

  return violations;
}

async function readSourceTree() {
  const entries = await readdir(SRC_ROOT, { recursive: true, withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (!entry.isFile() || !/\.(ts|tsx)$/.test(entry.name)) continue;

    const absolutePath = path.join(
      entry.parentPath ?? entry.path ?? SRC_ROOT,
      entry.name,
    );
    const relativePath = path.relative(SRC_ROOT, absolutePath);
    files.push({
      path: relativePath,
      source: await readFile(absolutePath, "utf8"),
    });
  }

  return files;
}

test("the source tree respects the utils/services layer boundaries", async () => {
  const violations = findLayerViolations(await readSourceTree());
  assert.deepEqual(violations, []);
});

test("the boundary check rejects imports from a lower layer", () => {
  const violations = findLayerViolations([
    { path: "utils/a.ts", source: 'import { x } from "@/services/a";' },
    { path: "services/b.ts", source: 'import { x } from "../hooks/b";' },
    { path: "components/c.tsx", source: `import { x } from "${LEGACY_ALIAS}/c";` },
    { path: "utils/ok.ts", source: 'import type { X } from "@/types/x";' },
  ]);

  assert.equal(violations.length, 3);
});
