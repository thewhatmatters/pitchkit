import { cpSync, existsSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const dest = path.join(process.cwd(), "node_modules/@whatmatters/wmds/dist/files");

if (!existsSync(path.dirname(dest))) {
  process.exit(0);
}

mkdirSync(dest, { recursive: true });

for (const pkg of ["@fontsource-variable/geist", "@fontsource-variable/geist-mono"]) {
  const pkgDir = path.dirname(require.resolve(`${pkg}/package.json`));
  cpSync(path.join(pkgDir, "files"), dest, { recursive: true });
}
