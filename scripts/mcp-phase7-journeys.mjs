export const mcpPhase7Journeys = [
  { id: 'consulta-saldo', kind: 'consulta', evidence: 'resultado sem confirmação' },
  { id: 'consulta-transacoes', kind: 'consulta', evidence: 'paginação e filtros' },
  { id: 'analise-categorias', kind: 'análise', evidence: 'resumo agregado' },
  { id: 'criar-categoria', kind: 'crud', evidence: 'prévia + confirmação única' },
  { id: 'editar-categoria', kind: 'crud', evidence: 'prévia + confirmação única' },
  { id: 'excluir-categoria', kind: 'exclusão', evidence: 'prévia + confirmação única' },
  { id: 'criar-meta', kind: 'crud', evidence: 'prévia + confirmação única' },
  { id: 'excluir-meta', kind: 'exclusão', evidence: 'prévia + confirmação única' },
  { id: 'importar-csv', kind: 'importação', evidence: 'lote parcial até 1.000 itens' },
  { id: 'revogar-autorizacao', kind: 'exclusão', evidence: 'revogação e indisponibilidade segura' },
];
