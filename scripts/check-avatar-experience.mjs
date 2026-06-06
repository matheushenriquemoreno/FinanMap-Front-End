import { access, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const failures = [];
const avatarIds = Array.from(
  { length: 10 },
  (_, index) => `avatar-${String(index + 1).padStart(2, '0')}`,
);

async function read(path) {
  return readFile(join(root, path), 'utf8');
}

function requirePattern(content, pattern, message) {
  if (!pattern.test(content)) {
    failures.push(message);
  }
}

for (const avatarId of avatarIds) {
  try {
    await access(join(root, `public/avatars/${avatarId}.svg`));
  } catch {
    failures.push(`Asset ausente: public/avatars/${avatarId}.svg`);
  }
}

const model = await read('src/models/Usuario.ts');
const account = await read('src/components/Configuracoes/InformacoesConta.vue');
const layout = await read('src/layouts/MainLayout.vue');
const avatarComponent = await read('src/components/UserAvatar.vue').catch(() => '');

for (const avatarId of avatarIds) {
  requirePattern(model, new RegExp(`id:\\s*['"]${avatarId}['"]`), `Catálogo sem ${avatarId}.`);
}

requirePattern(avatarComponent, /normalizarAvatarId/, 'UserAvatar deve aplicar fallback local.');
requirePattern(avatarComponent, /alt/, 'UserAvatar deve aceitar texto alternativo.');
requirePattern(account, /role="radiogroup"/, 'Seletor deve expor um radiogroup acessível.');
requirePattern(account, /aria-checked/, 'Opções devem expor o estado selecionado.');
requirePattern(account, /catch\s*\(/, 'Falha ao salvar avatar deve ser tratada.');
requirePattern(account, /UserAvatar/, 'Cabeçalho da conta deve usar UserAvatar.');
requirePattern(layout, /UserAvatar/g, 'Layout deve usar UserAvatar.');

if (failures.length > 0) {
  console.error('Falha na experiência de avatar:\n');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log('Experiência de avatar validada.');
}
