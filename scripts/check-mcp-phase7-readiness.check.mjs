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
assert.equal(
  new Set(journeys.mcpPhase7Journeys.map(({ id }) => id)).size,
  10,
  'IDs de jornada devem ser únicos',
);

const quasar = fs.readFileSync(path.join(root, 'quasar.config.ts'), 'utf8');
assert.ok(quasar.includes('process.env.URL_API'), 'URL_API deve vir do ambiente de build');
assert.ok(
  !quasar.includes('https://api.devmoreno.online'),
  'URL de produção não pode ficar hardcoded',
);

const compose = fs.readFileSync(path.join(root, 'docker-compose.homolog.yml'), 'utf8');
assert.ok(compose.includes('URL_API'), 'compose de homologação deve declarar URL_API');
assert.ok(compose.includes('MCP_ENABLED'), 'compose de homologação deve declarar a flag MCP');

const integrationConfig = fs.readFileSync(
  path.join(root, 'src/components/Configuracoes/IntegracaoIaConfig.vue'),
  'utf8',
);
assert.ok(
  integrationConfig.includes('[mcp_servers.finanmap]'),
  'UI MCP deve expor o bloco TOML do Codex',
);
assert.ok(integrationConfig.includes('auth = "oauth"'), 'UI MCP deve orientar OAuth no Codex');
assert.ok(
  integrationConfig.includes('claude mcp add --transport http finanmap'),
  'UI MCP deve expor o comando HTTP do Claude Code',
);
assert.ok(integrationConfig.includes("'http'"), 'UI MCP deve gerar JSON do Claude com type http');
assert.ok(
  integrationConfig.includes('O campo type é obrigatório'),
  'UI MCP deve avisar que type é obrigatório para Claude JSON',
);

console.log(
  `phase7 frontend readiness OK: ${journeys.mcpPhase7Journeys.length} jornadas representadas`,
);
