import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const required = [
  'Dockerfile.homolog',
  'docker-compose.homolog.yml',
  'deploy/nginx.conf',
  'docs/PHASE-7-TRACEABILITY.md',
  'scripts/mcp-phase7-journeys.mjs',
];

for (const relative of required) {
  assert.ok(fs.existsSync(path.join(root, relative)), `artefato ausente: ${relative}`);
}

const journeys = await import(pathToFileURL(path.join(root, 'scripts/mcp-phase7-journeys.mjs')));
assert.equal(journeys.mcpPhase7Journeys.length, 10, 'o smoke deve representar dez jornadas');
assert.equal(new Set(journeys.mcpPhase7Journeys.map(({ id }) => id)).size, 10, 'IDs de jornada devem ser únicos');

const quasar = fs.readFileSync(path.join(root, 'quasar.config.ts'), 'utf8');
assert.ok(quasar.includes('process.env.URL_API'), 'URL_API deve vir do ambiente de build');
assert.ok(!quasar.includes('https://api.devmoreno.online'), 'URL de produção não pode ficar hardcoded');

const compose = fs.readFileSync(path.join(root, 'docker-compose.homolog.yml'), 'utf8');
assert.ok(compose.includes('URL_API'), 'compose de homologação deve declarar URL_API');
assert.ok(compose.includes('MCP_ENABLED'), 'compose de homologação deve declarar a flag MCP');

console.log(`phase7 frontend readiness OK: ${journeys.mcpPhase7Journeys.length} jornadas representadas`);
