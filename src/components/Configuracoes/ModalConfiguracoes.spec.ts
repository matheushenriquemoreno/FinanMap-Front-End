import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('ModalConfiguracoes', () => {
  it('oferece Integração com IA como seção navegável em desktop e mobile', async () => {
    const componentPath = resolve(
      process.cwd(),
      'src/components/Configuracoes/ModalConfiguracoes.vue',
    );
    const source = await readFile(componentPath, 'utf8');

    expect(source).toContain("label: 'Integração com IA'");
    expect(source).toContain("value: 'integracao-ia'");
    expect(source).toContain("tab === 'integracao-ia'");
    expect(source).toContain('<IntegracaoIaConfig');
  });
});
