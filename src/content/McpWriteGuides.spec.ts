import { describe, expect, it } from 'vitest';
import { mcpWriteGuides } from './McpWriteGuides';

const domains = ['categoria', 'receita', 'despesa', 'investimento', 'custo-fixo'] as const;
const actions = ['create', 'update', 'delete'] as const;

describe('catálogo de prompts MCP de escrita', () => {
  it('cobre create, update e delete nos cinco domínios sem alterar os guias de leitura', () => {
    expect(mcpWriteGuides).toHaveLength(15);
    expect(mcpWriteGuides.map((guide) => guide.id)).toEqual(
      domains.flatMap((domain) => actions.map((action) => `${domain}-${action}`)),
    );
  });

  it.each(actions)('exige prévia, revisão e a decisão exata em toda operação %s', (action) => {
    const guides = mcpWriteGuides.filter((guide) => guide.action === action);
    const requiredDecision = action === 'delete' ? 'DELETE_PERMANENTLY' : 'APPLY_CHANGES';

    expect(guides).toHaveLength(5);
    guides.forEach((guide) => {
      expect(guide.prompt).toMatch(/prepare uma prévia/i);
      expect(guide.prompt).toMatch(/não execute .*diretamente/i);
      expect(guide.prompt).toMatch(/revise|revisão/i);
      expect(guide.prompt).toContain(requiredDecision);
      expect(guide.prompt).not.toContain(
        action === 'delete' ? 'APPLY_CHANGES' : 'DELETE_PERMANENTLY',
      );
    });
  });

  it('identifica inequivocamente alterações e exclusões e pede esclarecimento de ambiguidade', () => {
    const targetGuides = mcpWriteGuides.filter((guide) => guide.action !== 'create');

    expect(targetGuides).toHaveLength(10);
    targetGuides.forEach((guide) => {
      expect(guide.prompt).toMatch(/identificador opaco/i);
      expect(guide.prompt).toMatch(/ambígu|mais de um|nenhum registro/i);
      expect(guide.prompt).toMatch(/esclareça|pergunte/i);
    });
  });

  it('não contém credenciais, URLs nem dados pessoais ou financeiros inventados', () => {
    mcpWriteGuides.forEach((guide) => {
      expect(guide.prompt).not.toMatch(
        /https?:\/\/|token|client_secret|chave de API|senha|Bearer\s+/i,
      );
      expect(guide.prompt).not.toMatch(
        /\b\d{2}\/\d{2}\/\d{4}\b|\bR\$\s*\d|\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b/,
      );
    });
  });

  it('cobre agrupamento, parcelamento, recorrência e escopos seguros nas despesas', () => {
    const expensePrompts = mcpWriteGuides
      .filter((guide) => guide.domain === 'despesa')
      .map((guide) => guide.prompt)
      .join(' ');

    expect(expensePrompts).toMatch(/agrupamento/i);
    expect(expensePrompts).toMatch(/parcelamento/i);
    expect(expensePrompts).toMatch(/recorrência/i);
    expect(expensePrompts).toContain('ApenasEsta');
    expect(expensePrompts).toContain('EstaEProximas');
    expect(expensePrompts).toContain('TodasDoLote');
    expect(expensePrompts).toMatch(/não prometa atomicidade/i);
  });

  it('explicita nome, dia de vencimento, categoria e status em todo custo fixo', () => {
    const fixedCostGuides = mcpWriteGuides.filter((guide) => guide.domain === 'custo-fixo');

    expect(fixedCostGuides).toHaveLength(3);
    fixedCostGuides.forEach((guide) => {
      expect(guide.prompt).toMatch(/nome/i);
      expect(guide.prompt).toMatch(/dia de vencimento/i);
      expect(guide.prompt).toMatch(/categoria/i);
      expect(guide.prompt).toMatch(/status/i);
    });
  });

  it('não oferece status configurável ao criar custo fixo e orienta alteração posterior', () => {
    const createFixedCost = mcpWriteGuides.find((guide) => guide.id === 'custo-fixo-create');

    expect(createFixedCost).toBeDefined();
    expect(createFixedCost?.prompt).not.toMatch(/status \[ativo ou inativo\]/i);
    expect(createFixedCost?.prompt).toMatch(/criad[oa] (?:com o status )?ativ[oa]/i);
    expect(createFixedCost?.prompt).toMatch(/status.*depois.*prompt de altera(?:ção|r)/i);
  });
});
