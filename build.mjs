/*
Build step for the runtime-loaded section components.

Each file in src/sections is a standalone module that the registration form
fetches with a dynamic import() at runtime, so each one is built as its own
entry point rather than into a shared chunk. Two settings carry the contract
described at the top of every section file:

  format: 'esm'   — the form imports the module, it is not a script tag.
  jsx: 'transform' — classic transform, so `React.createElement` binds to the
                     factory parameter instead of a global. `jsxSideEffects`
                     and automatic runtime would both emit an import, which is
                     exactly what these modules may not have.

Output is committed. dist/<VERSION> is what the form points at, so a rebuild
that is not committed means the form keeps serving the previous build.
*/

import { build } from 'esbuild';
import { readdir, writeFile, rm, mkdir } from 'node:fs/promises';
import { join, basename, extname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const VERSION = 'v3';
const SRC_DIR = resolve('src/sections');
const OUT_DIR = resolve('dist', VERSION);

const sourceFiles = (await readdir(SRC_DIR))
  .filter((f) => extname(f) === '.jsx')
  .sort();

if (sourceFiles.length === 0) {
  throw new Error(`No .jsx sections found in ${SRC_DIR}`);
}

await rm(OUT_DIR, { recursive: true, force: true });
await mkdir(OUT_DIR, { recursive: true });

await build({
  entryPoints: sourceFiles.map((f) => join(SRC_DIR, f)),
  outdir: OUT_DIR,
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: 'es2020',
  jsx: 'transform',
  legalComments: 'none',
  logLevel: 'warning',
});

/*
Load every built file before declaring the build good. A section that fails to
evaluate, or that drops one of its two exports, fails here rather than in the
browser after the form has already committed to mounting it.
*/
const sections = [];
for (const file of sourceFiles) {
  const name = basename(file, '.jsx');
  const outFile = join(OUT_DIR, `${name}.js`);
  const mod = await import(pathToFileURL(outFile).href);

  if (typeof mod.default !== 'function') {
    throw new Error(`${name}: default export must be a create(React) factory`);
  }
  if (!Array.isArray(mod.fields) || mod.fields.length === 0) {
    throw new Error(`${name}: must export a non-empty \`fields\` array`);
  }

  sections.push({ name, file: `${name}.js`, fields: mod.fields });
}

// No timestamp: the manifest should only change when a section changes, so a
// rebuild with no source edits leaves the working tree clean.
await writeFile(
  join(OUT_DIR, 'manifest.json'),
  JSON.stringify({ version: VERSION, sections }, null, 2) + '\n',
);

console.log(`built ${sections.length} section(s) -> dist/${VERSION}`);
for (const s of sections) {
  console.log(`  ${s.file}  (${s.fields.length} fields)`);
}
