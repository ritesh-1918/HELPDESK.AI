import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const frontendSrcRoot = path.resolve(process.cwd(), 'src');
const blockedPatterns = [
  /VITE_GEMINI_API_KEY/i,
  /VITE_OPENROUTER_API_KEY/i,
  /VITE_GROQ_API_KEY/i,
];
const allowedExtensions = new Set(['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs']);

const walk = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const resolvedPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...await walk(resolvedPath));
      continue;
    }

    if (allowedExtensions.has(path.extname(entry.name))) {
      files.push(resolvedPath);
    }
  }

  return files;
};

const findHits = async () => {
  const hits = [];
  const files = await walk(frontendSrcRoot);

  for (const filePath of files) {
    const content = await readFile(filePath, 'utf8');
    const lines = content.split(/\r?\n/);

    lines.forEach((line, index) => {
      if (blockedPatterns.some((pattern) => pattern.test(line))) {
        hits.push(`${path.relative(process.cwd(), filePath)}:${index + 1}: ${line.trim()}`);
      }
    });
  }

  return hits;
};

try {
  const hits = await findHits();

  if (hits.length > 0) {
    console.error('Frontend AI secret references detected:');
    for (const hit of hits) {
      console.error(hit);
    }
    process.exit(1);
  }

  console.log('No frontend AI secret references found.');
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}