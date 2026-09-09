const prioridadePeso = { Alta: 3, Media: 2, Baixa: 1 };

export function ordenarComprasPlanejadas(compras) {
  return [...compras].sort((a, b) => {
    const prioridade = prioridadePeso[b.prioridade] - prioridadePeso[a.prioridade];
    if (prioridade !== 0) return prioridade;
    return new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime();
  });
}

export function calcularTotalEstimado(compras) {
  return compras.reduce((total, compra) => total + compra.valorEstimado, 0);
}
