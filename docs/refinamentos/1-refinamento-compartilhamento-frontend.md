# 📋 Refinamento — Compartilhamento de Informações Entre Contas (Front-End)

> **Objetivo**: Implementar a interface de compartilhamento no front-end, permitindo que o usuário convide outros por e-mail, gerencie permissões, responda convites e alterne entre visualizar seus dados ou os dados compartilhados de outro usuário.

---

## 📖 Contexto

Atualmente, o FinanMap mostra apenas os dados do usuário logado. Com essa feature, o usuário poderá:

1. **Convidar** outros usuários (por e-mail) para visualizar ou editar seus dados
2. **Ver e responder** convites recebidos de outros usuários
3. **Alternar** entre ver seus próprios dados ou os dados de quem compartilhou com ele
4. **Gerenciar** permissões e revogar acessos

---

## 🏗️ Arquitetura Existente (Resumo)

```
src/
├── components/     → Componentes reutilizáveis (Vue SFC)
├── pages/          → Páginas da aplicação
├── layouts/        → MainLayout.vue
├── router/         → Rotas (routes.ts)
├── services/       → Serviços de API (Axios)
│   ├── api/        → AxiosHelper.ts (CreateIntanceAxios com interceptors)
│   └── base/       → TransacaoBaseService.ts (classe base genérica)
├── stores/         → Pinia stores
├── Model/          → Interfaces TypeScript
└── helpers/        → Funções auxiliares (notificações, etc.)
```

**Padrões importantes:**
- Serviços usam `CreateIntanceAxios()` que adiciona o header `Authorization: Bearer {token}` automaticamente
- `TransacaoBaseService<CreateType, ReturnType>` é a classe base com métodos CRUD
- Stores usam Pinia com `defineStore` e Composition API (`ref`, funções)
- Componentes usam `<script setup lang="ts">` com Quasar components
- Notificações usam `notificar()`, `notificarErro()`, `notificarInfo()` de `helpers/Notificacao`

---

## 📝 O Que Precisa Ser Criado

### 1. Models / Interfaces TypeScript

**Arquivo**: `src/Model/Compartilhamento.ts`

```typescript
// Enums correspondentes ao back-end
export enum NivelPermissao {
  Visualizar = 0,
  Editar = 1,
}

export enum StatusConvite {
  Pendente = 0,
  Aceito = 1,
  Recusado = 2,
}

// DTO de retorno do backend
export interface Compartilhamento {
  id: string;
  proprietarioId: string;
  proprietarioEmail: string;
  proprietarioNome: string;
  convidadoId: string;
  convidadoEmail: string;
  permissao: NivelPermissao;
  status: StatusConvite;
  dataCriacao: string; // ISO date string
}

// DTO para criar convite
export interface CriarCompartilhamentoDTO {
  convidadoEmail: string;
  permissao: NivelPermissao;
}

// DTO para responder convite
export interface ResponderConviteDTO {
  compartilhamentoId: string;
  aceitar: boolean;
}

// DTO para atualizar permissão
export interface AtualizarPermissaoDTO {
  compartilhamentoId: string;
  novaPermissao: NivelPermissao;
}
```

---

### 2. Service — CompartilhamentoService

**Arquivo**: `src/services/CompartilhamentoService.ts`

```typescript
import { CreateIntanceAxios, handleErrorAxios } from 'src/services/api/AxiosHelper';
import { notificar } from 'src/helpers/Notificacao';
import { ref } from 'vue';
import type {
  Compartilhamento,
  CriarCompartilhamentoDTO,
  ResponderConviteDTO,
  AtualizarPermissaoDTO,
} from 'src/Model/Compartilhamento';

export class CompartilhamentoService {
  private baseUrl: string;
  public loading = ref(false);
  private axios = CreateIntanceAxios();

  constructor() {
    this.baseUrl = process.env.URL_API + 'compartilhamento';
  }

  private async requestWithLoading<T>(requestFn: () => Promise<T>): Promise<T> {
    try {
      this.loading.value = true;
      return await requestFn();
    } catch (error) {
      handleErrorAxios(error);
      throw error;
    } finally {
      this.loading.value = false;
    }
  }

  // Convidar alguém para compartilhar seus dados
  async convidar(dto: CriarCompartilhamentoDTO): Promise<Compartilhamento> {
    return this.requestWithLoading(async () => {
      const response = await this.axios.post<Compartilhamento>(this.baseUrl, dto);
      notificar('Convite enviado com sucesso!');
      return response.data;
    });
  }

  // Listar meus compartilhamentos (onde sou o dono)
  async obterMeusCompartilhamentos(): Promise<Compartilhamento[]> {
    return this.requestWithLoading(async () => {
      const response = await this.axios.get<Compartilhamento[]>(`${this.baseUrl}/meus`);
      return response.data;
    });
  }

  // Listar convites que recebi
  async obterConvitesRecebidos(): Promise<Compartilhamento[]> {
    return this.requestWithLoading(async () => {
      const response = await this.axios.get<Compartilhamento[]>(`${this.baseUrl}/convites`);
      return response.data;
    });
  }

  // Aceitar ou recusar convite
  async responderConvite(dto: ResponderConviteDTO): Promise<void> {
    return this.requestWithLoading(async () => {
      await this.axios.post(`${this.baseUrl}/responder`, dto);
      notificar(dto.aceitar ? 'Convite aceito!' : 'Convite recusado.');
    });
  }

  // Atualizar permissão de um compartilhamento
  async atualizarPermissao(dto: AtualizarPermissaoDTO): Promise<void> {
    return this.requestWithLoading(async () => {
      await this.axios.put(`${this.baseUrl}/permissao`, dto);
      notificar('Permissão atualizada com sucesso!');
    });
  }

  // Revogar (excluir) um compartilhamento
  async revogar(id: string): Promise<void> {
    return this.requestWithLoading(async () => {
      await this.axios.delete(`${this.baseUrl}/${id}`);
      notificar('Compartilhamento revogado com sucesso!');
    });
  }
}

export function obterCompartilhamentoService() {
  return new CompartilhamentoService();
}
```

---

### 3. Store — compartilhamento-store.ts

**Arquivo**: `src/stores/compartilhamento-store.ts`

Esta store controla o **contexto ativo**: se o usuário está vendo seus próprios dados ou os dados de outro usuário.

```typescript
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Compartilhamento } from 'src/Model/Compartilhamento';
import { NivelPermissao, StatusConvite } from 'src/Model/Compartilhamento';

export const useCompartilhamentoStore = defineStore('CompartilhamentoStore', () => {
  // Contexto ativo: null = meus dados, objeto = dados de outro usuário
  const contextoAtivo = ref<Compartilhamento | null>(null);

  // Listas de compartilhamentos
  const meusCompartilhamentos = ref<Compartilhamento[]>([]);
  const convitesRecebidos = ref<Compartilhamento[]>([]);

  // Computed: verifica se está em modo compartilhado
  const emModoCompartilhado = computed(() => contextoAtivo.value !== null);

  // Computed: ID do proprietário dos dados que está sendo visualizado
  const proprietarioIdAtivo = computed(() =>
    contextoAtivo.value?.proprietarioId ?? null
  );

  // Computed: nível de permissão no contexto atual
  const permissaoAtual = computed(() =>
    contextoAtivo.value?.permissao ?? null
  );

  // Computed: verifica se pode editar no contexto atual
  const podeEditar = computed(() =>
    !emModoCompartilhado.value || permissaoAtual.value === NivelPermissao.Editar
  );

  // Computed: nome do proprietário ativo (para exibição no header)
  const nomeProprietarioAtivo = computed(() =>
    contextoAtivo.value?.proprietarioNome ?? null
  );

  // Computed: apenas convites aceitos (para o seletor de contexto)
  const compartilhamentosAceitos = computed(() =>
    convitesRecebidos.value.filter(c => c.status === StatusConvite.Aceito)
  );

  // Computed: convites pendentes (para badge/notificação)
  const convitesPendentes = computed(() =>
    convitesRecebidos.value.filter(c => c.status === StatusConvite.Pendente)
  );

  // Ações
  function alternarContexto(compartilhamento: Compartilhamento | null) {
    contextoAtivo.value = compartilhamento;
  }

  function voltarParaMeusDados() {
    contextoAtivo.value = null;
  }

  function setMeusCompartilhamentos(lista: Compartilhamento[]) {
    meusCompartilhamentos.value = lista;
  }

  function setConvitesRecebidos(lista: Compartilhamento[]) {
    convitesRecebidos.value = lista;
  }

  return {
    // Estado
    contextoAtivo,
    meusCompartilhamentos,
    convitesRecebidos,

    // Computed
    emModoCompartilhado,
    proprietarioIdAtivo,
    permissaoAtual,
    podeEditar,
    nomeProprietarioAtivo,
    compartilhamentosAceitos,
    convitesPendentes,

    // Ações
    alternarContexto,
    voltarParaMeusDados,
    setMeusCompartilhamentos,
    setConvitesRecebidos,
  };
});
```

---

### 4. ⭐ Modificação Crucial — AxiosHelper para enviar `X-Proprietario-Id`

O back-end usa o header `X-Proprietario-Id` para saber de quem buscar os dados quando em modo compartilhado.

**Modificar**: `src/services/api/AxiosHelper.ts`

Na função `CreateIntanceAxios()`, dentro do interceptor de **request**, adicionar:

```typescript
AxiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ★ NOVO: Enviar header X-Proprietario-Id se em modo compartilhado
    const proprietarioId = localStorage.getItem("proprietarioIdAtivo");
    if (proprietarioId) {
      config.headers['X-Proprietario-Id'] = proprietarioId;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);
```

> **Explicação**: O `proprietarioIdAtivo` será salvo no `localStorage` pela store quando o usuário trocar o contexto. Isso garante que todas as requisições incluam esse header automaticamente.

**Adicionar na store** (`compartilhamento-store.ts`), no método `alternarContexto`:

```typescript
function alternarContexto(compartilhamento: Compartilhamento | null) {
  contextoAtivo.value = compartilhamento;

  // Persiste no localStorage para o interceptor do Axios
  if (compartilhamento) {
    localStorage.setItem('proprietarioIdAtivo', compartilhamento.proprietarioId);
  } else {
    localStorage.removeItem('proprietarioIdAtivo');
  }
}
```

---

### 5. Componentes Visuais

#### 5.1. Seletor de Contexto (Header)

**Arquivo**: `src/components/Compartilhamento/ContextoSelector.vue`

**Localização**: Deve ser colocado no Header do `MainLayout.vue` ou próximo ao seletor de mês/ano.

**Comportamento**:
- Mostra um **dropdown/select** com as opções:
  - "Meus Dados" (padrão)
  - Lista de compartilhamentos aceitos: "Dados de {nome} ({email})"
- Ao selecionar, chama `store.alternarContexto(compartilhamento)`
- Quando em modo compartilhado, exibe um **banner/badge** indicando que está vendo dados de outro usuário
- Mostrar um **ícone de cadeado** se a permissão for somente "Visualizar"

**Sugestão de UI** (usar componentes Quasar):
```html
<q-select
  v-model="contextoSelecionado"
  :options="opcoes"
  label="Visualizando dados de"
  outlined
  dense
  emit-value
  map-options
/>
```

**Se tiver convites pendentes**, mostrar um badge no header:
```html
<q-badge v-if="store.convitesPendentes.length > 0" color="red" floating>
  {{ store.convitesPendentes.length }}
</q-badge>
```

---

#### 5.2. Página/Seção de Configurações de Compartilhamento

**Arquivo**: `src/components/Compartilhamento/CompartilhamentoConfig.vue`

Esta pode ser uma nova aba/seção dentro do modal de Configurações existente (`src/components/Configuracoes/`).

**Dividir em 3 seções:**

##### Seção A: "Convidar Pessoa"
- Campo de input para **e-mail**
- Select para **nível de permissão** (Visualizar / Editar)
- Botão **"Convidar"**
- Ao clicar, chama `compartilhamentoService.convidar({ convidadoEmail, permissao })`

##### Seção B: "Pessoas que Compartilhei" (onde sou o dono)
- Lista/tabela mostrando:
  - E-mail do convidado
  - Status (Pendente / Aceito / Recusado) → com badge colorido
  - Permissão (Visualizar / Editar) → select editável
  - Ações: **Alterar Permissão** | **Revogar** (botão de excluir com confirmação)
- Ao alterar permissão: `compartilhamentoService.atualizarPermissao({ compartilhamentoId, novaPermissao })`
- Ao revogar: mostrar `q-dialog` de confirmação → `compartilhamentoService.revogar(id)`

##### Seção C: "Convites Recebidos"
- Lista mostrando:
  - Nome e e-mail do proprietário (quem compartilhou)
  - Permissão oferecida
  - Status
  - Ações (se pendente): **Aceitar** | **Recusar**
- Ao aceitar: `compartilhamentoService.responderConvite({ compartilhamentoId, aceitar: true })`
- Ao recusar: `compartilhamentoService.responderConvite({ compartilhamentoId, aceitar: false })`

**Sugestão de layout**:
```
┌─────────────────────────────────────────────────┐
│  🤝 Compartilhamento                            │
│                                                  │
│  ┌──────────────────────────────────────────┐    │
│  │ ✉️ Convidar Pessoa                        │    │
│  │ E-mail: [__________________]              │    │
│  │ Permissão: [Visualizar ▾]  [Convidar]    │    │
│  └──────────────────────────────────────────┘    │
│                                                  │
│  📤 Pessoas que compartilhei                     │
│  ┌──────────────────────────────────────────┐    │
│  │ joao@email.com  | Aceito | Editar ▾ | 🗑️ │    │
│  │ maria@email.com | Pendente | Visualizar  │    │
│  └──────────────────────────────────────────┘    │
│                                                  │
│  📥 Convites Recebidos                           │
│  ┌──────────────────────────────────────────┐    │
│  │ Carlos (carlos@email.com) | Editar       │    │
│  │                       [Aceitar] [Recusar]│    │
│  └──────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

---

#### 5.3. Banner de Modo Compartilhado

**Arquivo**: `src/components/Compartilhamento/BannerCompartilhado.vue`

Exibido quando `store.emModoCompartilhado === true`, em todas as páginas (Rendimentos, Despesas, Investimentos, Dashboard).

```html
<template>
  <q-banner v-if="store.emModoCompartilhado" class="banner-compartilhado">
    <template v-slot:avatar>
      <q-icon name="people" color="white" />
    </template>

    Visualizando dados de <strong>{{ store.nomeProprietarioAtivo }}</strong>
    <span v-if="!store.podeEditar"> (somente leitura)</span>

    <template v-slot:action>
      <q-btn flat label="Voltar para meus dados" @click="store.voltarParaMeusDados()" />
    </template>
  </q-banner>
</template>
```

**Onde colocar**: No `MainLayout.vue`, logo abaixo do header ou acima do conteúdo principal.

---

### 6. Modificar Páginas Existentes para Modo Somente Leitura

Quando `store.podeEditar === false`, as páginas devem:

1. **Esconder** ou **desabilitar** botões de criar/editar/excluir
2. **Impedir** interações de edição (como editar valores direto na célula)

**Páginas a modificar**:

| Arquivo | O que mudar |
|---------|------------|
| `pages/GerenciamentoMensal/RendimentoPage.vue` | Desabilitar botão "Adicionar", edição inline e exclusão |
| `pages/GerenciamentoMensal/DespesaPage.vue` | Desabilitar botão "Adicionar", edição inline e exclusão |
| `pages/GerenciamentoMensal/InvestimentoPage.vue` | Desabilitar botão "Adicionar", edição inline e exclusão |
| `pages/Dashbord/dashbord-Gerenciamento-Mensal.vue` | Nenhuma mudança especial (dashboard é somente leitura naturalmente) |

**Como fazer**: Usar `v-if="store.podeEditar"` nos botões de ação:

```html
<!-- Exemplo: botão de adicionar -->
<q-btn
  v-if="compartilhamentoStore.podeEditar"
  label="Adicionar"
  @click="abrirFormulario()"
/>

<!-- Exemplo: botão de excluir na tabela -->
<q-btn
  v-if="compartilhamentoStore.podeEditar"
  icon="delete"
  @click="excluir(item.id)"
/>
```

**Importar a store** em cada página que precisa dessa verificação:

```typescript
import { useCompartilhamentoStore } from 'src/stores/compartilhamento-store';
const compartilhamentoStore = useCompartilhamentoStore();
```

---

### 7. Modificar Configurações Existentes

**Modificar**: `src/components/Configuracoes/` (o modal/drawer de configurações)

Adicionar uma nova opção de menu: **"Compartilhamento"** que renderiza o componente `CompartilhamentoConfig.vue`.

> Verificar como as opções de menu existentes funcionam (ex: "Categorias", "Conta") e seguir o mesmo padrão.

---

### 8. Carregar Dados de Compartilhamento ao Fazer Login

Ao fazer login (ou ao carregar o `MainLayout.vue`), carregar a lista de compartilhamentos:

**Modificar**: `src/layouts/MainLayout.vue` (ou onde o layout inicializa)

```typescript
import { obterCompartilhamentoService } from 'src/services/CompartilhamentoService';
import { useCompartilhamentoStore } from 'src/stores/compartilhamento-store';

const compartilhamentoService = obterCompartilhamentoService();
const compartilhamentoStore = useCompartilhamentoStore();

// No onMounted ou onBeforeMount:
async function carregarCompartilhamentos() {
  try {
    const [meus, recebidos] = await Promise.all([
      compartilhamentoService.obterMeusCompartilhamentos(),
      compartilhamentoService.obterConvitesRecebidos(),
    ]);
    compartilhamentoStore.setMeusCompartilhamentos(meus);
    compartilhamentoStore.setConvitesRecebidos(recebidos);
  } catch (e) {
    // Silencioso — não impedir o carregamento do app se falhar
    console.error('Erro ao carregar compartilhamentos:', e);
  }
}
```

---

### 9. Recarregar Dados Ao Trocar Contexto

Quando o usuário troca o contexto (de "meus dados" para "dados de fulano" ou vice-versa), **os dados da página atual precisam ser recarregados**.

**Estratégia**: Usar um `watch` na store de contexto para recarregar os dados da página atual.

No `GerenciamentoMensalPageIndex.vue` (ou componente pai), observar a mudança de contexto:

```typescript
import { useCompartilhamentoStore } from 'src/stores/compartilhamento-store';

const compartilhamentoStore = useCompartilhamentoStore();

watch(
  () => compartilhamentoStore.contextoAtivo,
  () => {
    // Recarrega os dados da página quando o contexto muda
    carregarDados();
  }
);
```

> **Observação**: Como o `AxiosHelper` já injeta o header `X-Proprietario-Id` baseado no `localStorage`, ao chamar `carregarDados()` novamente após a troca de contexto, o back-end retornará os dados do proprietário correto automaticamente.

---

## 📁 Checklist de Arquivos

| Ação        | Caminho do Arquivo                                              |
|-------------|-----------------------------------------------------------------|
| CRIAR       | `src/Model/Compartilhamento.ts`                                 |
| CRIAR       | `src/services/CompartilhamentoService.ts`                       |
| CRIAR       | `src/stores/compartilhamento-store.ts`                          |
| CRIAR       | `src/components/Compartilhamento/ContextoSelector.vue`          |
| CRIAR       | `src/components/Compartilhamento/CompartilhamentoConfig.vue`    |
| CRIAR       | `src/components/Compartilhamento/BannerCompartilhado.vue`       |
| MODIFICAR   | `src/services/api/AxiosHelper.ts` (adicionar header)            |
| MODIFICAR   | `src/layouts/MainLayout.vue` (carregar dados e banner)          |
| MODIFICAR   | `src/components/Configuracoes/...` (adicionar menu de compartilhamento) |
| MODIFICAR   | `src/pages/GerenciamentoMensal/RendimentoPage.vue` (modo leitura) |
| MODIFICAR   | `src/pages/GerenciamentoMensal/DespesaPage.vue` (modo leitura)  |
| MODIFICAR   | `src/pages/GerenciamentoMensal/InvestimentoPage.vue` (modo leitura) |
| MODIFICAR   | `src/pages/GerenciamentoMensal/GerenciamentoMensalPageIndex.vue` (watch contexto) |

---

## 🔒 Regras de Permissão no Front-End

| Situação                                          | Pode visualizar? | Pode criar/editar/excluir? |
|---------------------------------------------------|-------------------|----------------------------|
| Vendo meus próprios dados                         | ✅                | ✅                         |
| Vendo dados compartilhados (Permissão: Editar)    | ✅                | ✅                         |
| Vendo dados compartilhados (Permissão: Visualizar)| ✅                | ❌                         |

---

## 🔄 Fluxo Completo do Usuário

### Fluxo 1: Convidar alguém
```
1. Usuário A acessa Configurações > Compartilhamento
2. Digita o e-mail do Usuário B
3. Seleciona a permissão (Visualizar/Editar)
4. Clica em "Convidar"
5. → POST /api/compartilhamento (back-end cria o convite com status Pendente)
6. O convite aparece na lista "Pessoas que compartilhei" com status "Pendente"
```

### Fluxo 2: Aceitar convite
```
1. Usuário B faz login
2. No header, aparece um badge com "1" (convite pendente)
3. Acessa Configurações > Compartilhamento > Convites Recebidos
4. Vê o convite do Usuário A
5. Clica em "Aceitar"
6. → POST /api/compartilhamento/responder (status muda para Aceito)
7. No seletor de contexto do header, agora aparece "Dados de Usuário A"
```

### Fluxo 3: Visualizar dados compartilhados
```
1. Usuário B seleciona "Dados de Usuário A" no seletor de contexto do header
2. → Store salva o proprietarioId no localStorage
3. → Todas as requisições passam a incluir header X-Proprietario-Id
4. → Dados são recarregados; back-end retorna dados do Usuário A
5. Banner aparece: "Visualizando dados de Usuário A (somente leitura)"
6. Botões de criar/editar/excluir ficam ocultos (se permissão = Visualizar)
```

### Fluxo 4: Revogar acesso
```
1. Usuário A acessa Configurações > Compartilhamento
2. Na lista "Pessoas que compartilhei", clica no ícone de lixeira ao lado do Usuário B
3. Confirma no dialog de confirmação
4. → DELETE /api/compartilhamento/{id}
5. O Usuário B perde acesso imediatamente
```

---

## 📐 Estilo e Design

- Seguir o tema existente (dark/light mode)
- Usar componentes Quasar: `q-select`, `q-btn`, `q-dialog`, `q-banner`, `q-badge`, `q-list`, `q-item`, `q-input`
- O banner de modo compartilhado deve ter fundo colorido (ex: `bg-primary` ou `bg-info`) para chamar atenção
- Badges de status no compartilhamento:
  - **Pendente** → `color="warning"` (amarelo)
  - **Aceito** → `color="positive"` (verde)
  - **Recusado** → `color="negative"` (vermelho)
- Respeitar responsividade mobile (já existente no projeto)

---

## 📌 Ordem de Implementação Sugerida

1. `Model/Compartilhamento.ts` — interfaces e enums
2. `services/CompartilhamentoService.ts` — comunicação com a API
3. `stores/compartilhamento-store.ts` — estado global
4. `services/api/AxiosHelper.ts` — adicionar header `X-Proprietario-Id`
5. `components/Compartilhamento/CompartilhamentoConfig.vue` — tela de gerenciamento
6. Integrar `CompartilhamentoConfig.vue` no modal de Configurações
7. `components/Compartilhamento/ContextoSelector.vue` — seletor no header
8. `components/Compartilhamento/BannerCompartilhado.vue` — banner informativo
9. Integrar seletor e banner no `MainLayout.vue`
10. Carregar dados de compartilhamento ao inicializar o app
11. Modificar páginas existentes para modo somente leitura
12. Adicionar watch de contexto para recarregar dados

---

## 🧪 Sugestões de Teste Manual

1. **Convidar um e-mail válido** → verificar que aparece na lista com status "Pendente"
2. **Convidar um e-mail inválido** → verificar mensagem de erro
3. **Aceitar convite** → verificar que o seletor de contexto aparece
4. **Trocar contexto** → verificar que os dados mudam
5. **Verificar modo somente leitura** → botões devem sumir quando permissão = Visualizar
6. **Revogar compartilhamento** → verificar que o convidado perde acesso
7. **Trocar permissão** → verificar que muda de Visualizar para Editar e vice-versa
8. **Mobile** → verificar que o seletor e o banner funcionam em tela pequena
