const fs = require("node:fs");
const path = require("node:path");

const adapterFile = path.join(
  __dirname,
  "..",
  "node_modules",
  "@opennextjs",
  "cloudflare",
  "dist",
  "cli",
  "build",
  "patches",
  "plugins",
  "load-manifest.js",
);
const missingPattern = "**/{*-manifest,required-server-files,prefetch-hints}.json";
const fixedPattern = "**/{*-manifest,required-server-files,prefetch-hints,preview-props}.json";

if (!fs.existsSync(adapterFile)) {
  throw new Error(`OpenNext manifest patch target not found: ${adapterFile}`);
}

const source = fs.readFileSync(adapterFile, "utf8");
if (source.includes(fixedPattern)) {
  process.exit(0);
}
if (!source.includes(missingPattern)) {
  throw new Error("OpenNext manifest glob changed; review the preview-props compatibility patch.");
}

fs.writeFileSync(adapterFile, source.replace(missingPattern, fixedPattern));
