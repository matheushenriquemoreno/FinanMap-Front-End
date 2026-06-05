# Implementation Plan — Padronização Visual das Modais de Configuração

| Field        | Value                        |
| ------------ | ---------------------------- |
| Tech Lead    | @Antigravity                 |
| Team         | Matheus                      |
| Epic/Ticket  | Padronização de Layout Modais |
| Status       | In Review                    |
| Created      | 2026-06-05                   |
| Last Updated | 2026-06-05                   |

## Overview

Este plano de implementação visa padronizar visualmente as três telas integradas à modal de configurações (`ModalConfiguracoes.vue`):
1. **Informações da Conta** (`InformacoesConta.vue`)
2. **Categorias** (`CategoriaConfig.vue`)
3. **Compartilhamento de Dados** (`CompartilhamentoConfig.vue`)

Atualmente, essas três modais possuem identidades visuais distintas causadas por terem sido desenvolvidas em épocas diferentes. A padronização focará em unificar a estrutura usando um cabeçalho padronizado (Avatar + Título + Subtítulo/Descrição) e organizando os controles/formulários dentro de cartões flat (`q-card`) com bordas arredondadas de `16px` (`rounded-borders-xl`), sombras discretas, alinhamento responsivo para dispositivos móveis e suporte completo ao Dark Mode.

**Technical Design**: Not provided

## Implementation Phases

### Phase 1: Padronização de "Informações da Conta" (Tracer Bullet)

**Goal**: Padronizar a tela de conta como prova de conceito, aplicando o cabeçalho unificado e os cards de configuração.

**Vertical slice**: Camada de UI do componente `InformacoesConta.vue`.

**Tasks**:

| ID | Task | Owner | Estimate |
|----|------|-------|----------|
| [CFG-P1-01] | Refatorar cabeçalho: integrar o avatar do usuário com o nome e e-mail no formato unificado (avatar de 48px + título + legenda). | @Antigravity | 2h |
| [CFG-P1-02] | Envelopar a seção de "Aparência" (tema claro/escuro) em um `q-card` flat e bordered usando a classe `.rounded-borders-xl`. | @Antigravity | 2h |
| [CFG-P1-03] | Envelopar a seção de "Notificações" (lembretes de e-mail) em um card idêntico, ajustando o banner de modo compartilhado. | @Antigravity | 2h |
| [CFG-P1-04] | Validar a reatividade do tema, consistência visual em Dark Mode e responsividade no mobile. | @Antigravity | 1h |

**Testing**:
- **Teste Visual**: Validar renderização do avatar e alinhamentos de texto no desktop e mobile.
- **Teste de Estado**: Mudar o tema para escuro e claro e confirmar se as cores dos cards e textos se adaptam conforme definido no `app.scss`.
- **Teste Funcional**: Clicar nos botões de tema e toggle de notificação para garantir que as ações continuam gravando no store/serviço.

**Acceptance Criteria**:
- [ ] O cabeçalho possui um avatar de `48px` com a letra inicial do usuário à esquerda, o nome destacado à direita e o e-mail em uma linha abaixo com cor suavizada.
- [ ] As seções "Aparência" e "Notificações" estão envelopadas em cartões com bordas de `16px`, borda sutil e sombra suave.
- [ ] O layout é responsivo (se adapta perfeitamente ao mobile).

**Dependencies**: Nenhuma.

---

### Phase 2: Padronização de "Categorias"

**Goal**: Adaptar a tela de categorias para o novo layout unificado, inserindo o cabeçalho e agrupando a tabela/filtros em um card.

**Vertical slice**: Camada de UI do componente `CategoriaConfig.vue`.

**Tasks**:

| ID | Task | Owner | Estimate |
|----|------|-------|----------|
| [CFG-P2-01] | Substituir o parágrafo de descrição simples pelo cabeçalho padronizado (Avatar 48px com ícone `category` + título + legenda). | @Antigravity | 2h |
| [CFG-P2-02] | Envelopar o controle de filtros (`q-tabs`, `q-input` de busca, botão Criar) e a tabela de dados (`q-table`) em um `q-card` flat bordered padronizado. | @Antigravity | 2h |
| [CFG-P2-03] | Ajustar paddings e margens internas para que o conteúdo do card não fique muito apertado nem com espaços excessivos. | @Antigravity | 1h |
| [CFG-P2-04] | Testar o fluxo de listagem, troca de abas de tipo de categoria, edição in-line e exclusão. | @Antigravity | 1h |

**Testing**:
- **Teste Visual**: Confirmar se o cabeçalho e o card da tabela combinam visualmente com o componente de Informações da Conta criado na Fase 1.
- **Teste de Fluxo**: Criar, editar e deletar uma categoria para garantir que as modais nativas de diálogo do Quasar funcionam perfeitamente sobre o novo layout de card.

**Acceptance Criteria**:
- [ ] A descrição simples foi removida e substituída pelo cabeçalho com avatar azul de `48px` (ícone `category`).
- [ ] A toolbar e a tabela estão consolidadas visualmente dentro de um cartão flat com borda arredondada de `16px`.
- [ ] O layout da tabela e do filtro é totalmente responsivo no mobile.

**Dependencies**: Phase 1 concluída e aprovada.

---

### Phase 3: Refinamento de "Compartilhamento de Dados"

**Goal**: Refinar a tela de compartilhamento de dados para garantir que se alinhe perfeitamente aos padrões das fases anteriores.

**Vertical slice**: Camada de UI do componente `CompartilhamentoConfig.vue`.

**Tasks**:

| ID | Task | Owner | Estimate |
|----|------|-------|----------|
| [CFG-P3-01] | Ajustar o cabeçalho existente para usar o tamanho padrão de avatar (`48px`) e harmonizar os estilos tipográficos. | @Antigravity | 1h |
| [CFG-P3-02] | Uniformizar as classes dos cards ("Convidar", "Pessoas com Acesso", "Acessos Liberados", "Convites") para usarem exatamente as mesmas propriedades físicas e de sombra dos componentes anteriores. | @Antigravity | 2h |
| [CFG-P3-03] | Validar fluxos de convites e permissões sobre o layout revisado. | @Antigravity | 1h |

**Testing**:
- **Teste Visual**: Garantir coerência tipográfica e de sombras com as modais de Conta e Categoria.
- **Teste Funcional**: Simular envio e resposta a convites para garantir que os componentes e badges de status atualizam corretamente.

**Acceptance Criteria**:
- [ ] O cabeçalho possui avatar de `48px` e tipografia idêntica às telas de Conta e Categoria.
- [ ] Todos os cards do fluxo de compartilhamento usam a classe `rounded-borders-xl` e `shadow-1` com paddings idênticos.

**Dependencies**: Phase 2 concluída.

---

### Phase 4: Ajustes de Integração e Mobile no Modal Principal

**Goal**: Garantir que o container principal do modal renderize perfeitamente as 3 telas sem margens duplicadas ou problemas de rolagem.

**Vertical slice**: Layout global do modal (`ModalConfiguracoes.vue`).

**Tasks**:

| ID | Task | Owner | Estimate |
|----|------|-------|----------|
| [CFG-P4-01] | Revisar espaçamentos do container e remover margens excessivas ao redor das telas filhas. | @Antigravity | 2h |
| [CFG-P4-02] | Otimizar visualização mobile (garantir que a barra lateral de navegação oculte/exiba corretamente e que as telas caibam na tela). | @Antigravity | 2h |
| [CFG-P4-03] | Realizar validação final e correção de pequenos bugs de alinhamento em todos os navegadores/resoluções. | @Antigravity | 1h |

**Testing**:
- **Teste de Navegação**: Alternar rapidamente entre as 3 abas e observar se ocorrem saltos visuais indesejados ou quebras de layout.
- **Teste Responsivo**: Simular visualização em telas de `320px`, `375px`, `768px` e `1024px+` usando ferramentas de desenvolvedor.

**Acceptance Criteria**:
- [ ] O modal de configurações se comporta de forma totalmente fluida ao alternar entre as 3 abas.
- [ ] Não há barras de rolagem horizontais ou sobreposição de texto em resoluções mobile.

**Dependencies**: Faves 1, 2 e 3 concluídas.

## Milestones

| Milestone | Target Date | Description |
|-----------|-------------|-------------|
| M1: Prova de Conceito (Conta) | 2026-06-08 | Tela de Informações da Conta padronizada com o novo cabeçalho e cards de preferências. |
| M2: Categorias Unificadas | 2026-06-10 | Tela de Categorias migrada para o estilo de cartões e cabeçalho consistente. |
| M3: Design Coeso Completo | 2026-06-12 | Todas as 3 telas e o modal principal funcionando de forma integrada, responsiva e com suporte total a Dark Mode. |

## Dependencies

| Dependency | Type | Owner | Status | Risk if Delayed |
|------------|------|-------|--------|-----------------|
| Nenhuma | N/A | @Antigravity | Concluído | Nenhum |

## Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Quebra de layouts responsivos devido a tamanhos fixos de componentes antigos | M | M | Utilizar classes flexíveis do Quasar (`row`, `col`, `col-12`, `col-md-*`) e evitar `width` fixo nos cards. |
| Divergência na paleta de cores entre o modo claro e escuro | M | L | Utilizar as variáveis globais de CSS do `app.scss` (como `--bg-card`, `--text-primary`) e cores semânticas do Quasar. |
| Conflitos de padding em navegadores móveis antigos | L | L | Testar extensivamente emulando múltiplos aparelhos nos DevTools e usando classes utilitárias padrões do Quasar. |

## Testing Strategy
1. **Testes de Regressão Visual**:
   - Comparação das telas antes e depois para garantir que nenhum elemento funcional (como o botão de exclusão de categoria ou toggle de convite) tenha sumido ou ficado inacessível.
2. **Testes de Responsividade**:
   - Testar o comportamento das telas em breakpoints do Quasar: `xs` (mobile), `sm` (tablet) e `md+` (desktop).
3. **Testes de Modo Escuro**:
   - Garantir legibilidade perfeita dos textos em fundo escuro em todos os novos componentes de card.

## Rollback Plan
- Falha catastrófica de renderização que impeça o usuário de salvar configurações críticas.
- Problemas de usabilidade severos no mobile que impeçam o fechamento do modal ou a navegação.
- **Passos**: Fazer rollback imediato dos commits de UI usando Git para a versão estável anterior.
