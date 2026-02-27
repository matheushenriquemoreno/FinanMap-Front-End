# Componentes Vue - Compartilhamento

## 📦 Visão Geral

Esta documentação detalha os componentes Vue criados e modificados para a funcionalidade de compartilhamento.

## 🆕 Componentes Novos

### 1. ContextoSelector.vue

**Localização**: `src/components/Compartilhamento/ContextoSelector.vue`

**Propósito**: Bloco composto no header para alternar entre contextos de dados e abrir o modal de compartilhamento

**Props**: Nenhuma

**Emits**: Nenhum

**Dependências**:
- `useCompartilhamentoStore`
- `CompartilhamentoModal` (subcomponente interno)
- `useQuasar`

**Template** (estrutura simplificada):
```vue
<div class="row no-wrap items-center q-gutter-sm">
  <!-- Botão seletor de contexto com dropdown -->
  <div class="row no-wrap items-center rounded-borders cursor-pointer ...">
    <div class="row items-center" @click="toggleMenu">
      <q-icon :name="contextoIcon" />
      <span>{{ contextoLabel }}</span>
    </div>
    <q-icon name="arrow_drop_down" @click.stop="toggleMenu" />

    <q-menu v-model="menuOpen" fit>
      <q-list>
        <q-item v-for="opcao in opcoesContexto" @click="trocarContexto(opcao.value)">
          <!-- label, ícone, check do item ativo -->
        </q-item>
      </q-list>
    </q-menu>
    <q-inner-loading :showing="loading" />
  </div>

  <!-- Botão de compartilhamento com badge de convites pendentes -->
  <q-btn round flat icon="share" @click="abrirModalCompartilhamento">
    <q-badge
      v-if="compartilhamentoStore.convitesPendentes.length > 0"
      color="orange"
      :label="compartilhamentoStore.convitesPendentes.length"
      floating rounded
    />
    <q-tooltip>Compartilhar</q-tooltip>
  </q-btn>

  <!-- Modal de Compartilhamento (integrado) -->
  <compartilhamento-modal v-model="showCompartilhamentoModal" :titulo-contexto="contextoLabel" />
</div>
```

**Estado local**:
- `loading`: indica carregamento durante troca de contexto
- `menuOpen`: controla visibilidade do dropdown
- `showCompartilhamentoModal`: controla abertura do modal de compartilhamento
- `contextSelecionadoInternal`: valor interno do contexto selecionado (string ID ou `''` para próprios dados)

**Computed Properties**:
- `opcoesContexto`: Lista `[{ label, value, icon }]` — "Meus Dados" + compartilhamentos aceitos
- `contextoSelecionado`: get/set sobre `contextSelecionadoInternal`
- `contextoLabel`: label do contexto ativo
- `contextoIcon`: ícone do contexto ativo (`'person'` ou `'share'`)

**Methods**:
- `toggleMenu()`: Abre/fecha o dropdown (respeitando loading)
- `abrirModalCompartilhamento()`: Abre o `CompartilhamentoModal`
- `trocarContexto(proprietarioId)`: Ativa ou desativa contexto compartilhado via store

**`onMounted`**: Restaura o contexto selecionado com base no estado atual do store.

**Estilos customizados**:
- `.transition-hover`: transição suave de `background-color`
- `.transition-hover:hover`: `filter: brightness(0.95)`

**Uso** (em `MainLayout.vue`, apenas para telas maiores):
```vue
<ContextoSelector v-if="$q.screen.gt.sm" class="q-mr-md" />
```

---

### 2. BannerModoCompartilhado.vue

**Localização**: `src/components/Compartilhamento/BannerModoCompartilhado.vue`

> ⚠️ **Nota**: Este componente substituiu o `BannerCompartilhado.vue` original. O nome e a implementação foram alterados.

**Propósito**: Banner fixo exibido nas páginas quando o usuário está em modo compartilhado (visualizando dados de outro usuário)

**Props**: Nenhuma

**Emits**: Nenhum

**Dependências**:
- `useCompartilhamentoStore`
- `NivelPermissao` (model)

**Template**:
```vue
<q-banner
  v-if="compartilhamentoStore.emModoCompartilhado"
  rounded
  class="q-mb-md banner-compartilhado"
  :class="$q.dark.isActive ? 'bg-blue-9' : 'bg-blue-1'"
>
  <template v-slot:avatar>
    <q-icon name="share" :color="$q.dark.isActive ? 'blue-3' : 'primary'" />
  </template>
  <div>
    <span class="text-weight-medium">Modo Compartilhado</span>
    <span class="text-caption q-ml-xs">
      — Visualizando dados de
      <strong>{{ compartilhamentoStore.contextoAtivo?.proprietarioNome }}</strong>
      ({{ permissaoLabel }})
    </span>
  </div>
</q-banner>
```

**Computed Properties**:
- `permissaoLabel`: `'Edição'` ou `'Somente leitura'` com base na permissão do contexto ativo

**Estilos customizados**:
- `.banner-compartilhado`: `border-left: 4px solid #1976d2`

> **Diferenças em relação ao design original**: Não possui botão "Voltar para meus dados". Usa ícone `share` (antes `folder_shared`). Suporte a tema claro/escuro (`bg-blue-1` / `bg-blue-9`).

**Uso** (inserido nas páginas que precisam do modo compartilhado):
```vue
<!-- Ex: GerenciamentoMensalPageIndex.vue ou dashboards -->
<BannerModoCompartilhado />
```

> **Nota**: Este banner **não é mais incluído no `MainLayout.vue`**. Deve ser adicionado manualmente nas páginas relevantes.

---

### 3. CompartilhamentoModal.vue

**Localização**: `src/components/Compartilhamento/CompartilhamentoModal.vue`

**Propósito**: Modal completo de gerenciamento de compartilhamento em estilo "Google Drive" — exibe usuários com acesso, convites pendentes recebidos, e permite enviar novos convites.

**Props**:
```typescript
interface Props {
  modelValue: boolean;
  tituloContexto?: string; // default: 'Lista de tarefas'
}
```

**Emits**:
```typescript
emit('update:modelValue', value: boolean)
```

**Dependências**:
- `useCompartilhamentoStore`
- `useEmailStore` (para exibir dados do usuário logado)
- `NivelPermissao`, `StatusConvite` (models)
- `useQuasar`

**Seções do Modal**:

#### Cabeçalho
```vue
<q-card-section class="row items-center q-pb-sm">
  <div class="text-h6">Compartilhar "{{ tituloContexto }}"</div>
  <q-space />
  <q-btn icon="close" flat round dense v-close-popup />
</q-card-section>
```

#### Enviar Convite
```vue
<q-card-section>
  <div class="row q-col-gutter-sm">
    <q-input v-model="novoEmail" placeholder="Adicionar participantes..." @keyup.enter="enviarConvite">
      <template v-slot:prepend><q-icon name="person_add" /></template>
    </q-input>
    <q-select v-model="novaPermissao" :options="opcoesPermissao" emit-value map-options />
  </div>
  <q-btn label="Enviar Convite" icon="send" :loading="loadingConvite" @click="enviarConvite" />
</q-card-section>
```

#### Pessoas com Acesso (Convites Enviados)
```vue
<q-card-section>
  <div class="text-subtitle2">Pessoas com acesso (convites enviados)</div>

  <!-- Usuário atual como proprietário -->
  <q-item>
    <q-item-label>{{ nomeUsuario }} (you)</q-item-label>
    <q-item-label caption>{{ emailUsuario }}</q-item-label>
    <q-item-label side>Proprietário</q-item-label>
  </q-item>

  <!-- Compartilhamentos enviados -->
  <q-item v-for="comp in compartilhamentosAtivos">
    <q-item-label>{{ comp.convidadoEmail }}</q-item-label>
    <q-item-label caption>{{ statusTexto(comp.status) }}</q-item-label>
    <q-item-section side>
      <!-- Seletor de permissão (apenas para aceitos) -->
      <q-select v-if="comp.status === StatusConvite.Aceito" @update:model-value="atualizarPermissao(comp.id, val)" />
      <!-- Botão remover -->
      <q-btn icon="delete" @click="confirmarRevogacao(comp.id)" />
    </q-item-section>
  </q-item>
</q-card-section>
```

#### Convites Pendentes Recebidos (seção condicional)
```vue
<template v-if="convitesPendentes.length > 0">
  <q-separator />
  <q-card-section>
    <div class="row items-center">
      <div class="text-subtitle2">Convites Pendentes</div>
      <q-badge color="orange" :label="convitesPendentes.length" />
    </div>
    <div class="text-caption text-grey">Você recebeu convites para acessar dados de outras pessoas.</div>
    <q-item v-for="convite in convitesPendentes">
      <q-item-label>{{ convite.proprietarioNome }}</q-item-label>
      <q-item-label caption>{{ convite.proprietarioEmail }} • {{ permissaoTexto(convite.permissao) }}</q-item-label>
      <q-btn label="Aceitar" color="positive" @click="responderConviteModal(convite.id, true)" />
      <q-btn label="Recusar" color="negative" @click="responderConviteModal(convite.id, false)" />
    </q-item>
  </q-card-section>
</template>
```

**Estado local**:
- `novoEmail`: email para novo convite
- `novaPermissao`: permissão selecionada para novo convite (default: `Visualizar`)
- `loadingConvite`: loading do botão enviar
- `loadingResposta: string | null`: id do convite que está sendo respondido

**Computed**:
- `showDialog`: v-model do dialog
- `nomeUsuario`: nome do usuário logado (via `useEmailStore`)
- `emailUsuario`: email do usuário logado (via `useEmailStore`)
- `compartilhamentosAtivos`: alias de `compartilhamentoStore.meusCompartilhamentos`
- `convitesPendentes`: alias de `compartilhamentoStore.convitesPendentes`

**Methods**:
- `permissaoTexto(permissao)`: retorna `'Edição'` ou `'Visualização'`
- `statusTexto(status)`: retorna texto legível do status do convite
- `enviarConvite()`: chama `store.convidar()`, exibe notificação
- `atualizarPermissao(id, val)`: chama `store.atualizarPermissao()`
- `confirmarRevogacao(id)`: abre diálogo de confirmação, depois chama `store.revogar()`
- `responderConviteModal(id, aceitar)`: chama `store.responderConvite()` com loading por convite
- `onHide()`: limpa formulário ao fechar modal

**`@hide`**: Ao fechar o dialog, reseta `novoEmail` e `novaPermissao`.

**Estilos customizados**:
```css
.q-card { border-radius: 8px; }
```

**Uso** (integrado dentro do `ContextoSelector.vue`):
```vue
<compartilhamento-modal
  v-model="showCompartilhamentoModal"
  :titulo-contexto="contextoLabel"
/>
```

---

### 4. CompartilhamentoConfig.vue

**Localização**: `src/components/Compartilhamento/CompartilhamentoConfig.vue`

**Propósito**: Painel de gerenciamento de compartilhamentos (usado nas Configurações)

**Dependências**:
- `useCompartilhamentoStore`
- `CompartilhamentoService`

**Seções**: Convidar Usuário, Convites Recebidos, Meus Compartilhamentos, Compartilhamentos Aceitos

**Methods**:
- `enviarConvite()`, `aceitarConvite(id)`, `recusarConvite(id)`, `alternarPermissao(comp)`, `revogar(id)`, `sair(id)`

**Uso**:
```vue
<!-- Dentro de ModalConfiguracoes.vue (aba de compartilhamento) -->
<CompartilhamentoConfig />
```

---

## 🔄 Componentes Modificados

### 5. MainLayout.vue

**Modificações relevantes para compartilhamento**:

1. **Imports**:
```typescript
import ContextoSelector from 'src/components/Compartilhamento/ContextoSelector.vue';
import { useCompartilhamentoStore } from 'src/stores/compartilhamento-store';
```
> `BannerCompartilhado` **não é mais importado** no `MainLayout`.

2. **Setup**:
```typescript
const compartilhamentoStore = useCompartilhamentoStore();

onMounted(async () => {
  await compartilhamentoStore.carregarCompartilhamentos();
  compartilhamentoStore.restaurarContextoDoLocalStorage();
});
```

3. **Template**:
```vue
<q-header>
  <q-toolbar>
    <!-- ContextoSelector apenas em telas > sm -->
    <ContextoSelector v-if="$q.screen.gt.sm" class="q-mr-md" />
    <!-- ... outros botões ... -->
  </q-toolbar>
</q-header>

<q-page-container class="q-pa-xs">
  <!-- key força re-renderização da page ao trocar contexto -->
  <router-view :key="compartilhamentoStore.contextoAtivo?.proprietarioId || 'meus-dados'" />
</q-page-container>
```

> **Diferenças em relação ao design original**:
> - `BannerCompartilhado` foi removido do layout global — o banner deve ser incluído diretamente nas páginas que precisam.
> - `ContextoSelector` usa `v-if="$q.screen.gt.sm"` (visível apenas em desktop/tablet).
> - O `router-view` possui `:key` dinâmico para forçar reload ao trocar de contexto.

---

### 6. RendimentoPage.vue

**Modificações**:

1. **Import do Store**:
```typescript
import { useCompartilhamentoStore } from 'src/stores/compartilhamento-store';
const compartilhamentoStore = useCompartilhamentoStore();
```

2. **Botões condicionais**:
```vue
<q-btn v-if="compartilhamentoStore.podeEditar" label="Adicionar" @click="abrirModal" />
```

3. **Coluna de Ações**:
```vue
<q-td key="acoes">
  <section v-if="compartilhamentoStore.podeEditar">
    <q-btn icon="edit" @click="editar" />
    <q-btn icon="delete" @click="excluir" />
  </section>
  <div v-else class="text-grey-6 text-caption">Somente leitura</div>
</q-td>
```

---

### 7. DespesaPage.vue

**Modificações**: Similares a `RendimentoPage`, passa prop para componente filho

```vue
<DespesaTableRow
  :props="props"
  :pode-editar="compartilhamentoStore.podeEditar"
  @editar="editar"
  @excluir="excluir"
/>
```

---

### 8. DespesaTableRow.vue

**Nova Prop**:
```typescript
interface Props {
  props: RowProps;
  showSelected: boolean;
  podeEditar?: boolean;  // ← Nova (default: true)
}
```

**Uso**:
```vue
<section v-if="podeEditar">
  <q-btn icon="edit" @click="$emit('editar', props.row)" />
  <q-btn icon="delete" @click="$emit('excluir', props.row)" />
</section>
<div v-else class="text-grey-6 text-caption">Somente leitura</div>
```

---

### 9. InvestimentoPage.vue

**Modificações**: Idênticas a `RendimentoPage`

---

## 📊 Hierarquia de Componentes

```
MainLayout.vue
├── ContextoSelector.vue        (v-if="$q.screen.gt.sm")
│   └── CompartilhamentoModal.vue  (integrado internamente)
└── router-view  (key muda ao trocar contexto)
    ├── GerenciamentoMensalPageIndex.vue
    │   └── BannerModoCompartilhado.vue  (inserido na página)
    ├── RendimentoPage.vue
    ├── DespesaPage.vue
    │   └── DespesaTableRow.vue (recebe podeEditar)
    ├── InvestimentoPage.vue
    └── ModalConfiguracoes.vue
        └── CompartilhamentoConfig.vue
```

## 🎨 Estilos e Classes

### Classes Quasar Utilizadas

- `bg-blue-1` / `bg-blue-9`: Background do banner (claro/escuro)
- `bg-dark` / `bg-white`: Card do modal (tema)
- `text-dark` / `text-white`: Texto do modal (tema)
- `text-grey-6`, `text-caption`: Texto "Somente leitura"
- `q-pa-md`: Padding médio
- `q-gutter-sm`: Espaçamento pequeno entre elementos

### Classes Customizadas

- `.banner-compartilhado`: borda azul à esquerda (`border-left: 4px solid #1976d2`)
- `.transition-hover` / `.transition-hover:hover`: transição suave em `ContextoSelector`
- `.q-card`: `border-radius: 8px` em `CompartilhamentoModal`

## 🔍 Boas Práticas Aplicadas

1. **Composition API**: Todos os componentes usam `<script setup>`
2. **TypeScript**: Tipagem forte em props e interfaces
3. **Reatividade**: Uso de `computed` para valores derivados
4. **Separação de Responsabilidades**: Lógica no store, UI nos componentes
5. **Props com Default**: `podeEditar: true` para compatibilidade; `tituloContexto: 'Lista de tarefas'`
6. **Emits Tipados**: Eventos bem definidos
7. **Conditional Rendering**: `v-if` em vez de `:disabled`
8. **Loading por item**: `loadingResposta` salva o ID do item em loading (não booleano global)
9. **Responsividade**: `ContextoSelector` oculto em mobile (`v-if="$q.screen.gt.sm"`)
10. **Re-render por key**: `router-view :key` garante que as páginas relêem dados ao trocar de contexto

## 🔗 Relacionados

- [arquitetura.md](./arquitetura.md) - Visão geral da arquitetura
- [06-modo-leitura.md](./06-modo-leitura.md) - Detalhes do modo leitura
- [03-trocar-contexto.md](./03-trocar-contexto.md) - Fluxo de troca de contexto
- [01-enviar-convite.md](./01-enviar-convite.md) - Fluxo de envio de convite
- [02-responder-convite.md](./02-responder-convite.md) - Fluxo de resposta a convites
