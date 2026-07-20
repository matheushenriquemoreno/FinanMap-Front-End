import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function readEnvValue(fileName, key) {
  const filePath = path.join(root, fileName);
  if (!fs.existsSync(filePath)) return undefined;

  const line = fs
    .readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .find((candidate) => candidate.trimStart().startsWith(`${key}=`));

  return line?.slice(line.indexOf('=') + 1).trim();
}

const apiUrl = process.env.URL_API?.trim() || readEnvValue('.env.prod', 'URL_API');

if (!apiUrl) {
  console.error('URL_API não configurada. Defina a variável ou adicione-a ao .env.prod.');
  process.exitCode = 1;
} else {
  try {
    const parsedUrl = new URL(apiUrl);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) throw new Error('protocolo inválido');
    console.log('Ambiente de build validado.');
  } catch {
    console.error('URL_API deve ser uma URL HTTP(S) absoluta.');
    process.exitCode = 1;
  }
}
