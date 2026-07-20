# Plano de Implementação: melhorias de qualidade front-end

## Objetivo

Elevar a nota ponderada da auditoria front-end para acima de 9,0 e eliminar
todos os findings críticos, altos e médios do relatório de qualidade.

## Fase 1 — Acessibilidade, responsividade e sessão

- Associar nomes acessíveis aos campos de autenticação e formulários citados.
- Tornar seletores de período e data operáveis por teclado.
- Nomear botões somente com ícone.
- Permitir zoom do navegador e corrigir o card de autenticação em telas estreitas.
- Corrigir o redirecionamento de sessão no Vue Router em modo hash.
- Adicionar regressão automatizada para os requisitos desta fase.

## Fase 2 — Performance de carregamento e dashboard

- Carregar ApexCharts somente nas rotas/componentes que o utilizam.
- Centralizar e deduplicar as requisições do dashboard.
- Otimizar o logo das páginas de autenticação e reservar seu espaço.

## Fase 3 — Arquitetura, testes e configuração

- Consolidar configuração de API e cliente HTTP.
- Fortalecer tipagem e regras de lint sem quebrar a aplicação.
- Adicionar testes de comportamento com framework apropriado.
- Reduzir responsabilidades dos maiores componentes.
- Resolver a estratégia de armazenamento de sessão junto ao contrato disponível.

## Fase 4 — Design System e CSS

- Centralizar cores semânticas e o shell dos cards do dashboard.
- Reduzir overrides profundos e estilos inline estáticos.
- Padronizar tokens, modais e estados visuais.

## Gate final

- `npm test`, `npm run lint` e `npm run build` verdes.
- Nova auditoria completa com nota ponderada maior que 9,0.
- Zero findings críticos, altos ou médios.
