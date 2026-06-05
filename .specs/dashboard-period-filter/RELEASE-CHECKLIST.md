# Dashboard Period Filter — Release Checklist

## Evidências da Phase 3

- A rota do dashboard usa `inicio=YYYY-MM` e `fim=YYYY-MM`.
- Uma URL válida inicializa a store antes da montagem dos componentes filhos.
- Query ausente, repetida, malformada, com mês inválido ou intervalo invertido retorna ao mês atual.
- Alterações aplicadas na store atualizam a URL com `router.replace`.
- Comparações antes de `setFiltros` e `router.replace` evitam consultas e navegações duplicadas.
- Os demais query params da rota são preservados.

## Regressão

- [x] Regras puras de query: 6 cenários exercitados com sucesso.
- [x] Contrato de `dashboardStore.setFiltros(mesInicial, anoInicial, mesFinal, anoFinal)` preservado.
- [x] Watchers dos cards e gráficos continuam reagindo a `dataInicial` e `dataFinal`.
- [x] `npm test` executado; o projeto informa que não possui testes automatizados configurados.
- [x] `npm run lint` concluído sem erros.
- [x] `npm run build` concluído sem erros.
- [x] Guarda de autenticação confirmada no navegador local.
- [ ] Dashboard autenticado, recarga, back/forward, modos compartilhado/light/dark e falhas de API:
      validação visual indisponível sem credenciais.

## Checklist de release

- [x] Formato de query documentado.
- [x] Fallback para query inválida implementado.
- [x] Proteções contra loop e duplicidade implementadas.
- [x] Build de produção gerado.
- [ ] Executar smoke test autenticado em homologação antes da liberação.
