import fs from 'fs';
import path from 'path';

const files = [
  'dist/index.cjs',
  'dist/node/index.cjs',
  'dist/node/index.mjs',
  'dist/index.mjs',
  'dist/web/index.mjs',
  'dist/vertex_internal/index.cjs',
  'dist/vertex_internal/index.js',
];

for (const rel of files) {
  const fullPath = path.resolve('node_modules/@google/genai', rel);
  if (!fs.existsSync(fullPath)) continue;
  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    const target = "throw new Error('Incomplete JSON segment at the end');";
    if (content.includes(target)) {
      content = content.replace(
        target,
        "console.warn('[GoogleGenAI] Trailing buffer segment ignored at stream end');"
      );
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log('[patch-genai] Patched:', rel);
    }
  } catch (err) {
    console.warn('[patch-genai] Could not patch:', rel, err);
  }
}
