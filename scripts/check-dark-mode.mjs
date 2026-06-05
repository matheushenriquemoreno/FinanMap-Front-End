import { readFile, readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const failures = [];

async function read(path) {
  return readFile(join(root, path), 'utf8');
}

function requirePattern(content, pattern, message) {
  if (!pattern.test(content)) {
    failures.push(message);
  }
}

async function findVueFiles(directory) {
  const absoluteDirectory = join(root, directory);
  const entries = await readdir(absoluteDirectory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = join(absoluteDirectory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await findVueFiles(`${directory}${entry.name}/`)));
    } else if (entry.name.endsWith('.vue')) {
      files.push(absolutePath);
    }
  }

  return files;
}

const appStyles = await read('src/css/app.scss');
const dashboard = await read('src/pages/Dashbord/dashbord-Gerenciamento-Mensal.vue');

requirePattern(
  appStyles,
  /body\.body--dark\s*\{[\s\S]*?--bg-primary:\s*var\(--q-dark-page\);/,
  'src/css/app.scss deve definir --bg-primary com --q-dark-page dentro de body.body--dark.',
);

requirePattern(
  appStyles,
  /\.q-page-container,\s*\.q-page\s*\{[\s\S]*?background-color:\s*var\(--bg-primary\);/,
  'src/css/app.scss deve aplicar --bg-primary em .q-page-container e .q-page.',
);

if (/bg-dark-page/.test(dashboard)) {
  failures.push('O dashboard não deve possuir uma implementação exclusiva chamada bg-dark-page.');
}

const partialGlobalSelector = /:global\(body\.body--dark\)\s+[^{,]+/g;

for (const file of await findVueFiles('src/')) {
  const content = await readFile(file, 'utf8');
  const matches = content.match(partialGlobalSelector);

  if (matches) {
    failures.push(
      `${relative(root, file)} usa :global(body.body--dark) parcial: ${matches.join(', ')}`,
    );
  }
}

if (failures.length > 0) {
  console.error('Falha na arquitetura do dark mode:\n');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log('Arquitetura do dark mode validada.');
}
