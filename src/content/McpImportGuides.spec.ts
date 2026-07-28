import { describe, expect, it } from 'vitest';
import { MCP_IMPORT_MAX_ITEMS, mcpImportGuides } from './McpImportGuides';

const importTypes = ['category', 'income', 'expense', 'investment', 'fixed_cost'] as const;

describe('catálogo de prompts MCP de importação', () => {
  it('cobre os cinco tipos estruturados e um fluxo exclusivo de correção', () => {
    expect(MCP_IMPORT_MAX_ITEMS).toBe(1_000);
    expect(mcpImportGuides.map((guide) => guide.id)).toEqual([
      ...importTypes.map((type) => `import-${type}`),
      'import-correct-failed',
    ]);
  });

  it('exige JSON estruturado, referências estáveis, prévia e confirmação exata', () => {
    mcpImportGuides.forEach((guide) => {
      expect(guide.prompt).toMatch(/JSON estruturado/i);
      expect(guide.prompt).toContain('clientItemId');
      expect(guide.prompt).toContain('sourceRef');
      expect(guide.prompt).toMatch(/1\.000 itens/i);
      expect(guide.prompt).toMatch(/prévia/i);
      expect(guide.prompt).toMatch(/revis/i);
      expect(guide.prompt).toContain('IMPORT_VALID_ITEMS');
    });
  });

  it('mantém decisões de duplicidade explícitas sem enviar arquivo ou segredo', () => {
    mcpImportGuides.forEach((guide) => {
      expect(guide.prompt).toContain('skip');
      expect(guide.prompt).toContain('import_anyway');
      expect(guide.prompt).toMatch(/não faça upload/i);
      expect(guide.prompt).toMatch(/não envie.*arquivo/i);
      expect(guide.prompt).toMatch(/não inclua.*segredo/i);
    });
  });

  it('permite lote heterogêneo com os cinco tipos sem ultrapassar 1.000 itens', () => {
    mcpImportGuides.forEach((guide) => {
      expect(guide.prompt).toMatch(/mesmo lote.*misturar/i);
      importTypes.forEach((type) => {
        expect(guide.prompt).toContain(type);
      });
    });
  });

  it('corrige e reenvia somente itens falhos sem repetir os concluídos', () => {
    const correctionGuide = mcpImportGuides.find((guide) => guide.id === 'import-correct-failed');

    expect(correctionGuide).toBeDefined();
    expect(correctionGuide?.prompt).toMatch(/somente os itens.*falh|somente.*inválidos/i);
    expect(correctionGuide?.prompt).toMatch(/reutilize.*clientItemId/i);
    expect(correctionGuide?.prompt).toMatch(/não reenvie.*concluídos/i);
  });
});
