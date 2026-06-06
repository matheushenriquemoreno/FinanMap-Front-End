# Implementation Plan — Redesign do Filtro de Período do Dashboard

| Field        | Value                         |
| ------------ | ----------------------------- |
| Tech Lead    | @Usuario                      |
| Team         | Front-end                     |
| Epic/Ticket  | Dashboard — Filtro de período |
| Status       | Completed                         |
| Created      | 2026-06-05                    |
| Last Updated | 2026-06-05                    |

## Overview

Repensar o filtro de período do dashboard para reduzir a carga visual e tornar os caminhos mais frequentes mais rápidos, sem remover os atalhos existentes nem alterar o contrato atual das consultas.

A proposta usa **divulgação progressiva**:

1. O estado principal mostra o período aplicado e os atalhos `Mês atual`, `Últimos 3 meses` e `Este ano`.
2. O usuário abre `Personalizar período` somente quando precisa informar um intervalo diferente.
3. O formulário manual aparece em uma segunda linha, com grupos claros `De` e `Até`, validação inline e ações `Cancelar` e `Aplicar período`.

**Technical Design**: Not provided

**Stack**: Vue 3 + Quasar Framework + Pinia + TypeScript

### Diagnóstico da interface atual

- Os quatro selects, seus rótulos, o separador e o botão `Filtrar` competem visualmente com os atalhos, embora os atalhos representem os caminhos mais rápidos.
- Os atalhos ficam distantes do título e do intervalo manual; em telas largas, parecem uma ação secundária desconectada.
- O atalho `Mês atual` desaparece quando ativo, causando mudança de layout e não comunicando qual preset está selecionado.
- O período aplicado não possui um resumo central e facilmente escaneável; é necessário ler quatro campos.
- O formulário manual e os atalhos usam padrões diferentes no desktop e mobile, o que aumenta inconsistência.
- A confirmação positiva por toast após toda aplicação adiciona ruído a uma ação frequente; o resumo do período aplicado pode oferecer feedback persistente.
- O erro depende de tooltip/toast. A correção deve estar visível junto ao formulário.
- O CSS usa `transition: all` e as animações da página não tratam `prefers-reduced-motion`.

### Proposta de experiência

**Estado compacto padrão**

```text
Período do dashboard                         [Personalizar período]
Junho de 2026
[Mês atual ✓] [Últimos 3 meses] [Este ano]
```

**Estado expandido para intervalo personalizado**

```text
Período do dashboard                         [Fechar]
Junho de 2026
[Mês atual] [Últimos 3 meses] [Este ano]

De                 →  Até
[Mês] [Ano]           [Mês] [Ano]          [Cancelar] [Aplicar período]
Mensagem de validação inline, quando necessária
```

### Direção visual

- **Tom**: utilitário refinado, calmo e financeiro; o filtro deve orientar sem disputar atenção com os indicadores.
- **Hierarquia**: período aplicado em destaque; presets como controle segmentado; edição manual como detalhe secundário.
- **Estado ativo**: preset selecionado com fundo primário suave, borda e ícone de confirmação. Presets nunca desaparecem.
- **Feedback**: atalhos aplicam imediatamente; intervalo manual aplica somente pelo botão. O resumo atualizado substitui o toast de sucesso.
- **Responsividade**: no mobile, atalhos permanecem na primeira camada e podem quebrar em linhas; editor manual ocupa largura total com campos agrupados.
- **Acessibilidade**: foco visível, rótulos persistentes, erro inline, alvos de toque de pelo menos 44px e suporte a redução de movimento.

## Scope

### Included

- Redesign de `SectionFiltrarPeriodo.vue`.
- Preservação dos três atalhos existentes e de suas regras de período.
- Estado visual ativo para preset reconhecido.
- Resumo do período aplicado usando `Intl.DateTimeFormat('pt-BR')`.
- Editor manual expansível, validação inline e cancelamento de alterações não aplicadas.
- Responsividade, dark mode, teclado e redução de movimento.
- Sincronização opcional do período com query params para preservar o filtro ao recarregar/compartilhar a URL.

### Not Included

- Alterações nos endpoints ou no formato de data enviado ao backend.
- Novos presets além dos três atuais.
- Redesign dos cards e gráficos do dashboard.
- Persistência de preferências no backend.

## Implementation Phases

---

### Phase 1: Tracer Bullet — Filtro compacto com atalhos e edição personalizada

**Goal**: O usuário identifica rapidamente o período aplicado, usa qualquer atalho em um clique e ainda consegue aplicar um intervalo personalizado.

**Vertical slice**: `SectionFiltrarPeriodo.vue` → estado local → `dashboardStore.setFiltros()` → atualização dos cards e gráficos existentes.

**Tasks**:

| ID | Task | Owner | Estimate |
|----|------|-------|----------|
| DPF-P1-01 | Reestruturar o template de `SectionFiltrarPeriodo.vue` em cabeçalho, resumo do período, grupo de presets e editor manual expansível. | @Usuario | 2h |
| DPF-P1-02 | Manter os atalhos `Mês atual`, `Últimos 3 meses` e `Este ano` sempre visíveis; aplicar imediatamente e indicar visualmente o preset correspondente ao período aplicado. | @Usuario | 1h |
| DPF-P1-03 | Criar resumo computado do período aplicado: `Junho de 2026` para mês único e `Abril a Junho de 2026` ou `Dezembro de 2025 a Fevereiro de 2026` para intervalos. Usar `Intl.DateTimeFormat('pt-BR')`. | @Usuario | 1h |
| DPF-P1-04 | Implementar `Personalizar período`, `Cancelar` e `Aplicar período`; `Cancelar` restaura o rascunho com os valores atualmente aplicados. | @Usuario | 1h |
| DPF-P1-05 | Substituir tooltip/toast de erro por mensagem inline; desabilitar `Aplicar período` enquanto o intervalo for inválido e manter o formulário aberto. | @Usuario | 45min |
| DPF-P1-06 | Remover o toast positivo da aplicação bem-sucedida; usar a mudança do resumo e do estado ativo como confirmação persistente. | @Usuario | 15min |

**Testing**:

- Manual: aplicar cada preset e confirmar atualização de todos os cards/gráficos.
- Manual: abrir editor, alterar campos, cancelar e confirmar restauração do período aplicado.
- Manual: tentar aplicar início posterior ao fim e confirmar erro inline sem chamada à store.
- Regressão: confirmar que `dashboardStore.setFiltros()` continua recebendo mês/ano inicial e final no mesmo formato.

**Acceptance Criteria**:

- [ ] Os três atalhos permanecem sempre visíveis e aplicam o período em um clique.
- [ ] O preset correspondente ao período aplicado possui estado ativo perceptível.
- [ ] O período aplicado é legível sem abrir o editor manual.
- [ ] O editor manual inicia fechado e pode ser aberto pelo botão `Personalizar período`.
- [ ] `Cancelar` descarta alterações locais e mantém o dashboard inalterado.
- [ ] Intervalo inválido exibe mensagem inline e não pode ser aplicado.
- [ ] Cards e gráficos continuam atualizando pelo contrato atual da store.

**Dependencies**: Nenhuma dependência externa; utiliza componentes Quasar e a store existentes.

---

### Phase 2: Responsividade, acessibilidade e refinamento visual

**Goal**: O novo filtro funciona com clareza em desktop, tablet, mobile, dark mode e navegação por teclado.

**Vertical slice**: marcação semântica → componentes Quasar → estilos responsivos → interação por teclado e leitores de tela.

**Tasks**:

| ID | Task | Owner | Estimate |
|----|------|-------|----------|
| DPF-P2-01 | Criar layout responsivo: cabeçalho e atalhos compactos no desktop; controles empilhados e ações em largura total no mobile; evitar overflow horizontal em 320px. | @Usuario | 1.5h |
| DPF-P2-02 | Refinar estados light/dark, ativo, hover, pressed, disabled e `focus-visible`, mantendo contraste suficiente e alvos de toque de pelo menos 44px. | @Usuario | 1.5h |
| DPF-P2-03 | Garantir nomes acessíveis e rótulos persistentes para controles; ligar mensagem de erro ao editor com `aria-live="polite"`/equivalente Quasar. | @Usuario | 1h |
| DPF-P2-04 | Trocar `transition: all` por propriedades específicas e adicionar tratamento de `prefers-reduced-motion` ao filtro e às animações de entrada do dashboard. | @Usuario | 45min |
| DPF-P2-05 | Validar conteúdo e truncamento com nomes de meses longos, zoom de 200% e diferentes larguras. | @Usuario | 45min |

**Testing**:

- Browser: testar em 320px, 480px, 768px, 1024px e 1440px.
- Acessibilidade manual: navegar somente por teclado, verificar ordem de foco e foco visível.
- Temas: validar light e dark mode.
- Preferências: ativar `prefers-reduced-motion` e confirmar remoção/redução das animações.

**Acceptance Criteria**:

- [ ] Nenhum controle ou texto é cortado em 320px ou com zoom de 200%.
- [ ] Todos os controles podem ser usados somente por teclado.
- [ ] Foco, preset ativo, erro e estado desabilitado são distinguíveis em light e dark mode.
- [ ] Mensagem de erro fica visível junto aos campos e é anunciada de forma acessível.
- [ ] Animações respeitam `prefers-reduced-motion`.

**Dependencies**: Phase 1 completa.

---

### Phase 3: Persistência do período e produção

**Goal**: O filtro mantém contexto após recarregar a página e pode ser liberado com baixo risco.

**Vertical slice**: rota do dashboard → query params → inicialização da store → filtro → consultas existentes.

**Tasks**:

| ID | Task | Owner | Estimate |
|----|------|-------|----------|
| DPF-P3-01 | Sincronizar período aplicado com query params (`inicio=YYYY-MM` e `fim=YYYY-MM`) usando Vue Router, sem registrar alterações ainda não aplicadas. | @Usuario | 1.5h |
| DPF-P3-02 | Na entrada da página, validar query params e inicializar a store; ignorar valores inválidos com fallback para o mês atual. | @Usuario | 1h |
| DPF-P3-03 | Executar regressão completa do dashboard, incluindo recarga, back/forward, URL compartilhada, modo compartilhado, light/dark e falhas de API. | @Usuario | 1.5h |
| DPF-P3-04 | Documentar evidências visuais antes/depois e checklist de release no ticket da entrega. | @Usuario | 30min |

**Testing**:

- Recarregar uma URL com período customizado e confirmar restauração do mesmo intervalo.
- Navegar com back/forward após trocar períodos e confirmar estado consistente.
- Abrir URL com query inválida e confirmar fallback sem quebrar o dashboard.
- Executar `npm run lint` e `npm run build`.

**Acceptance Criteria**:

- [ ] Recarregar a página preserva o período aplicado.
- [ ] Query params inválidos não causam erro nem intervalo inválido.
- [ ] Trocas de período não geram loops de navegação ou consultas duplicadas indevidas.
- [ ] `npm run lint` e `npm run build` concluem sem novos erros.

**Dependencies**: Phase 2 completa; alinhamento de produto para incluir query params no escopo final.

## Milestones

| Milestone | Target Date | Description |
|-----------|-------------|-------------|
| Experiência principal validável | 2026-06-08 | Filtro compacto, presets ativos e editor manual funcional |
| Refinamento responsivo e acessível | 2026-06-10 | Interface validada em breakpoints, temas e teclado |
| Pronto para produção | 2026-06-12 | Persistência por URL, regressão e build validados |

As datas são propostas e podem ser ajustadas conforme a prioridade da equipe.

## Dependencies

| Dependency | Type | Owner | Status | Risk if Delayed |
|------------|------|-------|--------|-----------------|
| `dashboardStore.setFiltros()` | Internal | @Usuario | Disponível | Alteração de contrato pode afetar todos os gráficos |
| Componentes `InputSelectMes` e `InputSelectAno` | Internal | @Usuario | Disponível | Limitações de acessibilidade/estilo podem exigir pequenos ajustes compartilhados |
| Vue Router | Internal | @Usuario | Disponível | Necessário apenas para persistência por URL na Phase 3 |
| Validação visual em Browser | Technical | @Usuario | Pendente | Problemas responsivos podem chegar à produção sem inspeção real |

## Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Usuário não percebe que o período personalizado está disponível por estar recolhido | Médio | Baixa | Usar botão explícito `Personalizar período`, ícone de calendário e teste visual em desktop/mobile |
| Estado local diverge do período aplicado após ações externas | Alto | Média | Manter watchers da store e separar claramente `draftPeriod` de `appliedPeriod` |
| Preset ativo é identificado incorretamente em virada de mês/ano | Médio | Média | Centralizar cálculo dos presets em funções puras e testar dezembro/janeiro |
| Query params criam consultas duplicadas ou loop de rota | Alto | Baixa | Atualizar URL apenas após aplicação e comparar valores antes de chamar `router.replace` |
| Mudança em inputs compartilhados afeta outras telas | Alto | Baixa | Priorizar props/classes locais; alterar componentes compartilhados somente com regressão das telas consumidoras |

## Testing Strategy

O projeto não possui suíte automatizada configurada (`npm test` apenas informa que não há testes). A entrega deve combinar verificações estáticas, build e testes manuais focados.

### Static and Build

- `npm run lint`
- `npm run build`

### Functional Scenarios

1. Carregamento inicial no mês atual.
2. Aplicação de cada preset.
3. Aplicação de intervalo personalizado no mesmo ano.
4. Aplicação de intervalo personalizado atravessando anos.
5. Cancelamento de rascunho.
6. Tentativa de intervalo inválido.
7. Mudança de preset após editar sem aplicar.
8. Recarga e navegação back/forward com query params.

### Visual and Accessibility

- Breakpoints: 320px, 480px, 768px, 1024px e 1440px.
- Light mode e dark mode.
- Zoom de 200%.
- Navegação somente por teclado.
- `prefers-reduced-motion`.

## Rollback Plan

### Deployment Strategy

Entregar em commits separados por fase. Se houver ambiente de homologação, validar Phase 1 e Phase 2 antes de habilitar a persistência por URL da Phase 3.

### Rollback Triggers

- Presets aplicam períodos incorretos.
- Cards ou gráficos deixam de atualizar.
- Filtro fica inutilizável em mobile.
- Query params causam loop, consultas repetidas ou quebra no carregamento.

### Rollback Steps

1. Reverter primeiro a sincronização por query params, preservando o redesign visual.
2. Se o problema estiver no fluxo principal, restaurar a versão anterior de `SectionFiltrarPeriodo.vue`.
3. Validar o dashboard no mês atual e com intervalo manual após o rollback.

## Validation Checklist

- [x] Technical design referenced: não fornecido
- [x] Phase 1 entrega valor visível ponta a ponta
- [x] Todas as fases possuem goal, vertical slice, tasks, testing, acceptance criteria e dependencies
- [x] IDs seguem o padrão `DPF-PN-NN`
- [x] Testes estão incorporados em cada fase
- [x] Nenhuma fase é apenas setup
- [x] Milestones e datas propostas definidos
- [x] Dependencies e riscos documentados
- [x] Testing Strategy incluída
- [x] Rollback Plan incluído
