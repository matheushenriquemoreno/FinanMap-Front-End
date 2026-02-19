# Fluxo 06: Modo Somente Leitura

## 📝 Descrição

Este documento detalha como a interface do usuário se adapta quando um usuário está visualizando dados compartilhados com permissão de **Visualizar** (somente leitura).

## 🎯 Objetivo

Garantir que usuários com permissão de visualização não possam realizar operações de escrita, ocultando ou desabilitando elementos de UI apropriados.

## 🔄 Estratégia de Implementação

### Abordagem Escolhida: Ocultar Elementos

✅ **Elementos são OCULTADOS** (não apenas desabilitados)

**Motivo**: Melhor UX - usuário não vê opções que não pode usar

```vue
<!-- ✅ CORRETO -->
<q-btn v-if="compartilhamentoStore.podeEditar" ... />

<!-- ❌ EVITAR -->
<q-btn :disable="!compartilhamentoStore.podeEditar" ... />
```

## 📋 Páginas Adaptadas

### 1. RendimentoPage.vue

**Elementos Condicionais**:

```vue
<template>
  <q-page>
    <!-- Botões de ação em lote (topo da tabela) -->
    <template v-slot:top-right>
      <!-- Excluir selecionados -->
      <q-btn
        v-if="existeRegistroSelecionados && compartilhamentoStore.podeEditar"
        icon="delete"
        label="Excluir Selecionados"
        @click="excluirSelecionados"
      />
      
      <!-- Enviar para próximo mês -->
      <q-btn
        v-if="existeRegistroSelecionados && compartilhamentoStore.podeEditar"
        icon="arrow_forward"
        label="Enviar para Próximo Mês"
        @click="enviarParaProximoMes"
      />
      
      <!-- Adicionar novo -->
      <q-btn
        v-if="!existeRegistroSelecionados && compartilhamentoStore.podeEditar"
        icon="add"
        label="Adicionar Rendimento"
        @click="abrirModalAdicionar"
      />
    </template>
    
    <!-- Coluna de ações na tabela -->
    <q-td key="acoes">
      <!-- Desktop: botões inline -->
      <section v-if="$q.screen.gt.xs && compartilhamentoStore.podeEditar">
        <q-btn icon="edit" @click="editar(props.row)" />
        <q-btn icon="delete" @click="excluir(props.row)" />
      </section>
      
      <!-- Mobile: menu dropdown -->
      <section v-else-if="!$q.screen.gt.xs && compartilhamentoStore.podeEditar">
        <q-btn icon="more_vert">
          <q-menu>
            <q-list>
              <q-item clickable @click="editar(props.row)">
                <q-item-section>Editar</q-item-section>
              </q-item>
              <q-item clickable @click="excluir(props.row)">
                <q-item-section>Excluir</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </section>
      
      <!-- Mensagem quando não pode editar -->
      <div v-else class="text-grey-6 text-caption">
        Somente leitura
      </div>
    </q-td>
    
    <!-- Edição inline de valor -->
    <q-td key="valor">
      <div class="row items-center">
        {{ formatarMoeda(props.row.valor) }}
        
        <!-- Popup de edição -->
        <q-popup-edit
          v-if="compartilhamentoStore.podeEditar"
          v-model.number="props.row.valor"
          @save="(val) => atualizarValor(props.row.id, val)"
        >
          <q-input
            v-model.number="props.row.valor"
            type="number"
            dense
            autofocus
          />
        </q-popup-edit>
        
        <!-- Ícone de edição (só aparece se pode editar) -->
        <q-icon
          v-if="compartilhamentoStore.podeEditar"
          name="edit"
          size="xs"
          class="q-ml-xs cursor-pointer"
        />
      </div>
    </q-td>
  </q-page>
</template>

<script setup lang="ts">
import { useCompartilhamentoStore } from 'src/stores/compartilhamento-store';

const compartilhamentoStore = useCompartilhamentoStore();
</script>
```

### 2. DespesaPage.vue

**Particularidade**: Usa componente filho `DespesaTableRow`

**Página Principal**:

```vue
<template>
  <q-page>
    <!-- Botões de ação em lote -->
    <template v-slot:top-right>
      <q-btn
        v-if="existeRegistroSelecionados && compartilhamentoStore.podeEditar"
        icon="delete"
        label="Excluir Selecionados"
      />
      
      <q-btn
        v-if="!existeRegistroSelecionados && compartilhamentoStore.podeEditar"
        icon="add"
        label="Adicionar Despesa"
      />
    </template>
    
    <!-- Linha da tabela (componente filho) -->
    <template v-slot:body="props">
      <DespesaTableRow
        :props="props"
        :show-selected="true"
        :pode-editar="compartilhamentoStore.podeEditar"
        @editar="editar"
        @excluir="excluir"
      />
    </template>
  </q-page>
</template>
```

**Componente Filho** (`DespesaTableRow.vue`):

```vue
<template>
  <q-tr :props="props">
    <!-- ... outras colunas ... -->
    
    <!-- Coluna de ações -->
    <q-td key="acoes">
      <!-- Desktop -->
      <section v-if="$q.screen.gt.xs && podeEditar">
        <q-btn icon="edit" @click="$emit('editar', props.row)" />
        <q-btn icon="delete" @click="$emit('excluir', props.row)" />
      </section>
      
      <!-- Mobile -->
      <section v-else-if="!$q.screen.gt.xs && podeEditar">
        <q-btn icon="more_vert">
          <q-menu>
            <q-list>
              <q-item clickable @click="$emit('editar', props.row)">
                <q-item-section>Editar</q-item-section>
              </q-item>
              <q-item clickable @click="$emit('excluir', props.row)">
                <q-item-section>Excluir</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </section>
      
      <!-- Somente leitura -->
      <div v-else class="text-grey-6 text-caption">
        Somente leitura
      </div>
    </q-td>
    
    <!-- Edição inline de valor -->
    <q-td key="valor">
      {{ formatarMoeda(props.row.valor) }}
      
      <q-popup-edit
        v-if="podeEditar"
        v-model.number="props.row.valor"
        @save="atualizarValor"
      >
        <q-input v-model.number="props.row.valor" type="number" />
      </q-popup-edit>
    </q-td>
    
    <!-- Despesas agrupadas (recursivo) -->
    <template v-if="props.row.despesasAgrupadas?.length > 0">
      <DespesaTableRow
        v-for="filha in props.row.despesasAgrupadas"
        :key="filha.id"
        :props="{ row: filha }"
        :show-selected="false"
        :pode-editar="podeEditar"
        @editar="$emit('editar', $event)"
        @excluir="$emit('excluir', $event)"
      />
    </template>
  </q-tr>
</template>

<script setup lang="ts">
interface Props {
  props: RowProps;
  showSelected: boolean;
  podeEditar?: boolean;  // ← Nova prop
}

const props = withDefaults(defineProps<Props>(), {
  podeEditar: true  // Default: pode editar (para compatibilidade)
});
</script>
```

### 3. InvestimentoPage.vue

**Implementação idêntica a RendimentoPage**:

```vue
<template>
  <q-page>
    <!-- Mesma estrutura de RendimentoPage -->
    <template v-slot:top-right>
      <q-btn
        v-if="existeRegistroSelecionados && compartilhamentoStore.podeEditar"
        ...
      />
      <q-btn
        v-if="!existeRegistroSelecionados && compartilhamentoStore.podeEditar"
        ...
      />
    </template>
    
    <q-td key="acoes">
      <section v-if="$q.screen.gt.xs && compartilhamentoStore.podeEditar">
        ...
      </section>
      <div v-else class="text-grey-6 text-caption">
        Somente leitura
      </div>
    </q-td>
  </q-page>
</template>
```

### 4. CategoriaConfig.vue

**Elementos Condicionais**:

```vue
<template>
  <q-card>
    <!-- Botão de adicionar categoria -->
    <q-btn
      v-if="compartilhamentoStore.podeEditar"
      icon="add"
      label="Nova Categoria"
      @click="abrirModalAdicionar"
    />
    
    <!-- Lista de categorias -->
    <q-list>
      <q-item v-for="categoria in categorias" :key="categoria.id">
        <q-item-section>
          {{ categoria.nome }}
        </q-item-section>
        
        <q-item-section side v-if="compartilhamentoStore.podeEditar">
          <q-btn icon="edit" @click="editar(categoria)" />
          <q-btn icon="delete" @click="excluir(categoria)" />
        </q-item-section>
      </q-item>
    </q-list>
  </q-card>
</template>
```

## 📊 Resumo de Elementos Ocultados

### Por Página

| Página | Elementos Ocultados em Modo Leitura |
|--------|-------------------------------------|
| **RendimentoPage** | • Botão "Adicionar"<br>• Botão "Excluir Selecionados"<br>• Botão "Enviar para Próximo Mês"<br>• Botões Editar/Excluir por linha<br>• Edição inline de valor |
| **DespesaPage** | • Botão "Adicionar"<br>• Botão "Excluir Selecionados"<br>• Botões Editar/Excluir (via DespesaTableRow)<br>• Edição inline de valor |
| **InvestimentoPage** | • Botão "Adicionar"<br>• Botão "Excluir Selecionados"<br>• Botão "Enviar para Próximo Mês"<br>• Botões Editar/Excluir por linha<br>• Edição inline de valor |
| **CategoriaConfig** | • Botão "Nova Categoria"<br>• Botões Editar/Excluir por categoria |

### Por Tipo de Ação

| Tipo de Ação | Implementação |
|--------------|---------------|
| **Criar** | `v-if="compartilhamentoStore.podeEditar"` no botão "Adicionar" |
| **Editar** | `v-if="compartilhamentoStore.podeEditar"` no botão "Editar" |
| **Excluir** | `v-if="compartilhamentoStore.podeEditar"` no botão "Excluir" |
| **Edição Inline** | `v-if="compartilhamentoStore.podeEditar"` no `q-popup-edit` |
| **Ações em Lote** | `v-if="... && compartilhamentoStore.podeEditar"` |

## 🎨 Feedback Visual

### Banner de Contexto

Sempre exibido quando em modo compartilhado:

```vue
<q-banner 
  v-if="compartilhamentoStore.emModoCompartilhado"
  class="bg-blue-2 text-dark"
>
  <template v-slot:avatar>
    <q-icon name="folder_shared" color="primary" />
  </template>
  
  Visualizando dados de 
  <strong>{{ compartilhamentoStore.contextoAtivo?.proprietarioNome }}</strong>
  
  <q-badge :color="badgeColor">
    {{ compartilhamentoStore.podeEditar ? 'Leitura e Edição' : 'Somente Leitura' }}
  </q-badge>
</q-banner>
```

### Mensagem na Coluna de Ações

Quando não pode editar, exibe texto explicativo:

```vue
<div class="text-grey-6 text-caption">
  Somente leitura
</div>
```

**Aparência**:
- Cor cinza (`text-grey-6`)
- Fonte pequena (`text-caption`)
- Centralizado na coluna

## 🔍 Computed Property no Store

**Store**: `compartilhamento-store.ts`

```typescript
const podeEditar = computed(() => {
  // Se não está em modo compartilhado, pode editar
  if (!emModoCompartilhado.value) {
    return true;
  }
  
  // Se está em modo compartilhado, verifica permissão
  return contextoAtivo.value?.permissao === NivelPermissao.Editar;
});

const emModoCompartilhado = computed(() => {
  return contextoAtivo.value !== null;
});
```

**Uso nos componentes**:

```typescript
import { useCompartilhamentoStore } from 'src/stores/compartilhamento-store';

const compartilhamentoStore = useCompartilhamentoStore();

// Acesso direto:
// compartilhamentoStore.podeEditar
// compartilhamentoStore.emModoCompartilhado
```

## ✅ Checklist de Adaptação

Para adaptar uma nova página para modo leitura:

- [ ] Importar `useCompartilhamentoStore`
- [ ] Adicionar `v-if="compartilhamentoStore.podeEditar"` em:
  - [ ] Botão de adicionar/criar
  - [ ] Botões de editar
  - [ ] Botões de excluir
  - [ ] Ações em lote
  - [ ] Edição inline (`q-popup-edit`)
- [ ] Adicionar mensagem "Somente leitura" na coluna de ações
- [ ] Testar com permissão Visualizar
- [ ] Testar com permissão Editar
- [ ] Testar com dados próprios

## 🧪 Cenários de Teste

### Teste 1: Permissão Visualizar

1. Usuário A compartilha com Usuário B (Visualizar)
2. Usuário B aceita e troca para contexto de A
3. **Verificar**:
   - ✅ Banner "Somente Leitura" exibido
   - ✅ Nenhum botão de ação visível
   - ✅ Mensagem "Somente leitura" na coluna de ações
   - ✅ Dados são exibidos normalmente
   - ✅ Filtros e navegação funcionam

### Teste 2: Permissão Editar

1. Usuário A compartilha com Usuário C (Editar)
2. Usuário C aceita e troca para contexto de A
3. **Verificar**:
   - ✅ Banner "Leitura e Edição" exibido
   - ✅ Todos os botões de ação visíveis
   - ✅ Pode adicionar/editar/excluir
   - ✅ Edição inline funciona

### Teste 3: Downgrade de Permissão

1. Usuário C está usando dados de A com permissão Editar
2. Usuário A altera permissão para Visualizar
3. Usuário C recarrega página ou faz nova requisição
4. **Verificar**:
   - ✅ Botões de ação desaparecem
   - ✅ Badge muda para "Somente Leitura"
   - ✅ Tentativa de edição via API retorna 403

## 🔍 Pontos de Atenção

1. **Prop Drilling**: `DespesaTableRow` precisa receber `podeEditar` como prop
2. **Default Value**: Componentes devem ter `podeEditar: true` como padrão para compatibilidade
3. **Consistência**: Usar sempre `v-if`, nunca `:disabled`
4. **Mensagem Visual**: Sempre mostrar "Somente leitura" onde botões foram removidos
5. **Responsividade**: Adaptar tanto para desktop quanto mobile
6. **Recursão**: Em componentes recursivos (despesas agrupadas), passar prop para filhos

## 🔗 Relacionados

- [04-validacao-permissoes.md](./04-validacao-permissoes.md) - Validação no backend
- [03-trocar-contexto.md](./03-trocar-contexto.md) - Como contexto é ativado
- [05-gerenciar-compartilhamentos.md](./05-gerenciar-compartilhamentos.md) - Alterar permissões
