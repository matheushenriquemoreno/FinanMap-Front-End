import { access, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const failures = [];
const avatarIds = Array.from(
  { length: 8 },
  (_, index) => `avatar-${String(index + 1).padStart(2, '0')}`,
);

async function requireFile(path) {
  try {
    await access(join(root, path));
  } catch {
    failures.push(`Arquivo de release ausente: ${path}`);
  }
}

for (const avatarId of avatarIds) {
  await requireFile(`dist/spa/avatars/${avatarId}.svg`);
}

const authService = await readFile(join(root, 'src/services/AuthService.ts'), 'utf8');
const compartilhamento = await readFile(
  join(root, 'src/components/Compartilhamento/CompartilhamentoConfig.vue'),
  'utf8',
);

if (/avatarId/i.test(authService)) {
  failures.push('Contrato de login não deve transportar avatarId.');
}

if (/UserAvatar/.test(compartilhamento)) {
  failures.push('Telas de compartilhamento não devem exibir o avatar do perfil.');
}

if (failures.length > 0) {
  console.error('Falha na verificação de release do avatar:\n');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log('Release do avatar validada: oito assets e contratos preservados.');
}
