# Fluxo 03: Trocar Contexto de Dados

## 📝 Descrição

Este fluxo descreve como um usuário alterna entre visualizar seus próprios dados e os dados compartilhados por outros usuários.

## 👥 Atores

- **Usuário**: Pode ser tanto proprietário quanto convidado
- **Sistema**: Gerencia o contexto ativo e headers HTTP

## 📋 Pré-requisitos

- Usuário deve estar autenticado
- Deve ter pelo menos um compartilhamento aceito (como convidado)

## 🔄 Fluxo Principal

### 1. Visualização do Seletor de Contexto

**Componente**: `ContextoSelector.vue` (integrado no `MainLayout.vue`)

```vue
<template>
  <q-select
    v-model="contextoSelecionado"
    :options="opcoesContexto"
    @update:model-value="trocarContexto"
    dense
    borderless
    class="contexto-selector"
  >
    <template v-slot:prepend>
      <q-icon name="folder_shared" />
    </template>
  </q-select>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useCompartilhamentoStore } from 'src/stores/compartilhamento-store';

const compartilhamentoStore = useCompartilhamentoStore();

// Opções do dropdown
const opcoesContexto = computed(() => {
  const opcoes = [
    {
      label: 'Meus Dados',
      value: '',  // String vazia = contexto próprio
      icon: 'person'
    }
  ];
  
  // Adiciona compartilhamentos aceitos
  compartilhamentoStore.compartilhamentosAceitos.forEach(comp => {
    opcoes.push({
      label: `${comp.proprietarioNome} (${comp.permissao === 0 ? 'Visualizar' : 'Editar'})`,
      value: comp.proprietarioId,
      icon: 'folder_shared'
    });
  });
  
  return opcoes;
});

// Contexto atualmente selecionado
const contextoSelecionado = computed({
  get: () => compartilhamentoStore.contextoAtivo?.proprietarioId || '',
  set: (value) => {
    // Setter vazio, lógica no @update:model-value
  }
});

function trocarContexto(novoContexto: string) {
  if (novoContexto === '') {
    // Voltar para dados próprios
    compartilhamentoStore.desativarContexto();
  } else {
    // Ativar contexto compartilhado
    const compartilhamento = compartilhamentoStore.compartilhamentosAceitos
      .find(c => c.proprietarioId === novoContexto);
    
    if (compartilhamento) {
      compartilhamentoStore.ativarContexto(compartilhamento);
    }
  }
}
</script>
```

### 2. Usuário Seleciona Contexto Compartilhado

**Store**: `compartilhamento-store.ts`

```typescript
function ativarContexto(compartilhamento: Compartilhamento) {
  // 1. Define contexto ativo
  contextoAtivo.value = {
    proprietarioId: compartilhamento.proprietarioId,
    proprietarioNome: compartilhamento.proprietarioNome,
    permissao: compartilhamento.permissao
  };
  
  // 2. Persiste no localStorage
  localStorage.setItem(
    STORAGE_KEY, 
    compartilhamento.proprietarioId
  );
  
  // 3. Recarrega página para aplicar novo contexto
  window.location.reload();
}
```

### 3. Aplicação do Contexto nas Requisições

**Axios Interceptor**: `AxiosHelper.ts`

```typescript
// Request Interceptor
api.interceptors.request.use(
  (config) => {
    // 1. Adiciona token JWT
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 2. Adiciona header de contexto compartilhado
    const proprietarioIdAtivo = localStorage.getItem('proprietarioIdAtivo');
    if (proprietarioIdAtivo) {
      config.headers['X-Proprietario-Id'] = proprietarioIdAtivo;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);
```

**Exemplo de requisição**:

```http
GET /api/rendimento/mes/2/2026 HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
X-Proprietario-Id: user-1
```

### 4. Backend Processa Contexto

**Interceptor**: `UsuarioLogado.cs` (WebApi)

```csharp
public class UsuarioLogado : IUsuarioLogado
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly ICompartilhamentoRepository _compartilhamentoRepository;
    
    public string IdContextoDados
    {
        get
        {
            // 1. Verifica se há header X-Proprietario-Id
            var proprietarioId = _httpContextAccessor.HttpContext?
                .Request.Headers["X-Proprietario-Id"].FirstOrDefault();
            
            if (!string.IsNullOrEmpty(proprietarioId))
            {
                // 2. Valida compartilhamento
                var compartilhamento = _compartilhamentoRepository
                    .ObterPorProprietarioEConvidado(proprietarioId, this.Id)
                    .Result;
                
                // 3. Verifica se está aceito
                if (compartilhamento != null && 
                    compartilhamento.Status == StatusConvite.Aceito)
                {
                    return proprietarioId;  // Retorna ID do proprietário
                }
                
                throw new AutenticacaoNecessariaException(
                    "Você não tem permissão para acessar os dados deste usuário!");
            }
            
            // 4. Sem header = retorna próprio ID
            return this.Id;
        }
    }
    
    public bool EmModoCompartilhado => IdContextoDados != this.Id;
    
    public NivelPermissao? PermissaoAtual
    {
        get
        {
            if (!EmModoCompartilhado) return null;
            
            var proprietarioId = _httpContextAccessor.HttpContext?
                .Request.Headers["X-Proprietario-Id"].FirstOrDefault();
            
            var compartilhamento = _compartilhamentoRepository
                .ObterPorProprietarioEConvidado(proprietarioId!, this.Id)
                .Result;
            
            return compartilhamento?.Permissao;
        }
    }
}
```

### 5. Serviços Usam IdContextoDados

**Exemplo**: `RendimentoService.cs`

```csharp
public async Task<List<ResultRendimentoDTO>> ObterMesAno(int mes, int ano)
{
    // Usa IdContextoDados em vez de Id
    // Se em modo compartilhado, busca dados do proprietário
    // Se em modo próprio, busca próprios dados
    var rendimentos = await _repository.ObterPeloMes(
        mes, 
        ano, 
        _usuarioLogado.IdContextoDados  // ← Contexto dinâmico
    );
    
    return rendimentos.Select(x => ObterRendimentoDTO(x)).ToList();
}
```

### 6. Exibição do Banner de Contexto

**Componente**: `BannerCompartilhado.vue` (integrado no `MainLayout.vue`)

```vue
<template>
  <q-banner 
    v-if="compartilhamentoStore.emModoCompartilhado"
    class="bg-blue-2 text-dark"
  >
    <template v-slot:avatar>
      <q-icon name="folder_shared" color="primary" />
    </template>
    
    <div class="row items-center">
      <div class="col">
        Visualizando dados de 
        <strong>{{ compartilhamentoStore.contextoAtivo?.proprietarioNome }}</strong>
        <q-badge :color="badgeColor" class="q-ml-sm">
          {{ permissaoTexto }}
        </q-badge>
      </div>
      <div class="col-auto">
        <q-btn 
          flat 
          dense 
          label="Voltar para meus dados"
          @click="compartilhamentoStore.desativarContexto()"
        />
      </div>
    </div>
  </q-banner>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useCompartilhamentoStore } from 'src/stores/compartilhamento-store';
import { NivelPermissao } from 'src/models/Compartilhamento';

const compartilhamentoStore = useCompartilhamentoStore();

const permissaoTexto = computed(() => {
  return compartilhamentoStore.contextoAtivo?.permissao === NivelPermissao.Visualizar
    ? 'Somente Leitura'
    : 'Leitura e Edição';
});

const badgeColor = computed(() => {
  return compartilhamentoStore.contextoAtivo?.permissao === NivelPermissao.Visualizar
    ? 'blue'
    : 'green';
});
</script>
```

### 7. Voltar para Dados Próprios

**Store**: `compartilhamento-store.ts`

```typescript
function desativarContexto() {
  // 1. Limpa contexto ativo
  contextoAtivo.value = null;
  
  // 2. Remove do localStorage
  localStorage.removeItem(STORAGE_KEY);
  
  // 3. Recarrega página
  window.location.reload();
}
```

## ✅ Resultado Final

### Em Modo Próprio (Padrão)

**localStorage**: (vazio ou sem `proprietarioIdAtivo`)

**Headers HTTP**:
```http
Authorization: Bearer {token}
```

**Backend**:
- `IdContextoDados` = ID do usuário logado
- `EmModoCompartilhado` = `false`
- `PermissaoAtual` = `null`

**UI**:
- Seletor mostra "Meus Dados"
- Sem banner
- Todos os botões de ação visíveis

### Em Modo Compartilhado

**localStorage**:
```
proprietarioIdAtivo: "user-1"
```

**Headers HTTP**:
```http
Authorization: Bearer {token}
X-Proprietario-Id: user-1
```

**Backend**:
- `IdContextoDados` = `"user-1"` (ID do proprietário)
- `EmModoCompartilhado` = `true`
- `PermissaoAtual` = `NivelPermissao.Visualizar` ou `Editar`

**UI**:
- Seletor mostra "João Silva (Visualizar)"
- Banner azul exibido
- Botões de ação condicionais (ver [06-modo-leitura.md](./06-modo-leitura.md))

## 🔄 Persistência de Contexto

### Ao Recarregar Página

**MainLayout.vue** restaura contexto:

```typescript
onMounted(() => {
  compartilhamentoStore.carregarCompartilhamentos();
  compartilhamentoStore.restaurarContextoDoLocalStorage();
});
```

**Store**:

```typescript
function restaurarContextoDoLocalStorage() {
  const proprietarioId = localStorage.getItem(STORAGE_KEY);
  
  if (proprietarioId) {
    // Busca compartilhamento correspondente
    const compartilhamento = compartilhamentosAceitos.value
      .find(c => c.proprietarioId === proprietarioId);
    
    if (compartilhamento) {
      // Restaura contexto SEM recarregar página
      contextoAtivo.value = {
        proprietarioId: compartilhamento.proprietarioId,
        proprietarioNome: compartilhamento.proprietarioNome,
        permissao: compartilhamento.permissao
      };
    } else {
      // Compartilhamento não existe mais, limpa
      localStorage.removeItem(STORAGE_KEY);
    }
  }
}
```

## ❌ Fluxos de Erro

### Compartilhamento Revogado

Se proprietário revogar acesso enquanto convidado está usando:

**Backend retorna**: `401 Unauthorized` ou `403 Forbidden`

**Frontend**:
```typescript
// Axios Response Interceptor
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 403) {
      // Limpa contexto inválido
      compartilhamentoStore.desativarContexto();
      
      Notify.create({
        type: 'warning',
        message: 'Acesso aos dados compartilhados foi revogado'
      });
    }
    return Promise.reject(error);
  }
);
```

### Compartilhamento Não Encontrado

Se header `X-Proprietario-Id` for inválido:

**Backend**: Lança `AutenticacaoNecessariaException`

**Frontend**: Redireciona para login ou limpa contexto

## 📊 Diagrama de Sequência

```mermaid
sequenceDiagram
    actor Usuário
    participant Selector as ContextoSelector
    participant Store as compartilhamento-store
    participant LocalStorage
    participant Axios as AxiosHelper
    participant API as Backend
    
    Usuário->>Selector: Seleciona "Dados de João"
    Selector->>Store: ativarContexto(compartilhamento)
    Store->>LocalStorage: Salva proprietarioIdAtivo
    Store->>Selector: Recarrega página
    
    Note over Selector,API: Após reload
    
    Selector->>Store: restaurarContextoDoLocalStorage()
    Store->>LocalStorage: Lê proprietarioIdAtivo
    LocalStorage-->>Store: "user-1"
    Store->>Store: Define contextoAtivo
    
    Usuário->>Selector: Navega para Rendimentos
    Selector->>API: GET /rendimento/mes/2/2026
    Note right of Axios: Interceptor adiciona header
    Axios->>API: + X-Proprietario-Id: user-1
    API->>API: Valida compartilhamento
    API->>API: IdContextoDados = "user-1"
    API->>API: Busca rendimentos de user-1
    API-->>Selector: Rendimentos do proprietário
```

## 🔍 Pontos de Atenção

1. **Reload necessário**: Trocar contexto recarrega a página para garantir estado limpo
2. **Validação em toda requisição**: Backend valida compartilhamento a cada chamada
3. **Sincronização localStorage**: Manter sincronizado com estado do store
4. **Limpeza ao revogar**: Se acesso for revogado, limpar contexto imediatamente
5. **Performance**: Considerar cache de validação de compartilhamento (futuro)
6. **Múltiplos compartilhamentos**: Usuário pode ter acesso a dados de várias pessoas
