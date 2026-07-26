import { describe, expect, it } from 'vitest';
import { mcpQueryGuides, mcpQueryTips } from './McpQueryGuides';

const expectedGuideIds = [
  'categorias',
  'receitas',
  'despesas',
  'investimentos',
  'custos-fixos',
  'totais-saldo',
  'maiores-movimentos',
  'distribuicao-categoria',
  'comparacao-periodos',
];

describe('catálogo de guias MCP de leitura', () => {
  it('cobre todas as consultas e análises previstas na Fase 2', () => {
    expect(mcpQueryGuides.map((guide) => guide.id)).toEqual(expectedGuideIds);
  });

  it.each(expectedGuideIds)('mantém o prompt %s somente leitura e sem credenciais', (id) => {
    const guide = mcpQueryGuides.find((candidate) => candidate.id === id);

    expect(guide).toBeDefined();
    expect(guide?.prompt).toMatch(/somente leitura/i);
    expect(guide?.prompt).toMatch(/não (exige|precisa de) confirmação/i);
    expect(guide?.prompt).not.toMatch(/https?:\/\/|token|chave de API|client_secret/i);
  });

  it('corresponde cada prompt aos inputs e outputs da ferramenta de leitura', () => {
    const prompt = (id: (typeof expectedGuideIds)[number]) =>
      mcpQueryGuides.find((guide) => guide.id === id)!.prompt;
    const expectTerms = (id: (typeof expectedGuideIds)[number], terms: RegExp[]) => {
      terms.forEach((term) => expect(prompt(id)).toMatch(term));
    };

    expectTerms('categorias', [
      /tipo "Despesa"/i,
      /texto "Casa"/i,
      /limite/i,
      /categorias/i,
      /continuação/i,
      /estado vazio/i,
    ]);
    expect(prompt('categorias')).not.toMatch(/\d{2}\/\d{2}\/\d{4}|BRL|descrição|período/i);

    expectTerms('receitas', [
      /01\/06\/2026.*30\/06\/2026/is,
      /categoria/i,
      /descrição/i,
      /limite/i,
      /continuação/i,
      /BRL/,
      /estado vazio/i,
    ]);
    expectTerms('despesas', [
      /01\/06\/2026.*30\/06\/2026/is,
      /categoria/i,
      /descrição/i,
      /limite/i,
      /continuação/i,
      /BRL/,
      /estado vazio/i,
    ]);
    expectTerms('investimentos', [
      /01\/01\/2026.*30\/06\/2026/is,
      /categoria/i,
      /descrição/i,
      /limite/i,
      /continuação/i,
      /BRL/,
      /estado vazio/i,
    ]);

    expectTerms('custos-fixos', [
      /status/i,
      /ativos/i,
      /inativos/i,
      /categoria/i,
      /limite/i,
      /continuação/i,
      /estado vazio/i,
    ]);
    expect(prompt('custos-fixos')).not.toMatch(/\d{2}\/\d{2}\/\d{4}|BRL|descrição|período/i);

    expectTerms('totais-saldo', [/01\/06\/2026.*30\/06\/2026/is, /totais/i, /saldo/i, /BRL/]);
    expect(prompt('totais-saldo')).not.toMatch(
      /categoria|descrição|filtro|cursor|continuação|paginação/i,
    );

    expectTerms('maiores-movimentos', [
      /tipo "receitas"/i,
      /quantidade 5/i,
      /tipo.*"despesas"/i,
      /01\/01\/2026.*30\/06\/2026/is,
      /BRL/,
      /estado vazio/i,
    ]);
    expect(prompt('maiores-movimentos')).not.toMatch(
      /categoria|descrição|filtro|cursor|continuação|paginação/i,
    );

    expectTerms('distribuicao-categoria', [
      /despesas/i,
      /01\/06\/2026.*30\/06\/2026/is,
      /valores/i,
      /percentuais/i,
      /BRL/,
      /estado vazio/i,
    ]);
    expect(prompt('distribuicao-categoria')).not.toMatch(
      /descrição|filtro|cursor|continuação|paginação/i,
    );

    expectTerms('comparacao-periodos', [
      /01\/05\/2026.*31\/05\/2026.*01\/06\/2026.*30\/06\/2026/is,
      /totais/i,
      /diferença/i,
      /percentual/i,
      /BRL/,
    ]);
    expect(prompt('comparacao-periodos')).not.toMatch(
      /categoria|descrição|filtro|cursor|continuação|paginação/i,
    );
  });

  it('orienta limites, estado vazio e erros somente quando aplicáveis', () => {
    const tips = mcpQueryTips.join(' ');

    expect(tips).toMatch(/parâmetros.*ferramenta/i);
    expect(tips).toMatch(/listas.*estado vazio|estado vazio.*listas/i);
    expect(tips).toMatch(/reduza.*período|divida.*consulta/i);
    expect(tips).toMatch(/autenticação.*autorização.*validação.*conflito.*indisponibilidade/i);
    expect(tips).toContain('sem confirmação');
  });
});
