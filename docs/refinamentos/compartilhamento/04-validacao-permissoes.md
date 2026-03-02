# Fluxo 04: Validação de Permissões

## 📝 Descrição

Este documento detalha como o sistema valida permissões em operações de leitura e escrita quando um usuário está acessando dados compartilhados.

## 🔐 Níveis de Permissão

```typescript
enum NivelPermissao {
  Visualizar = 0,  // Somente leitura
  Editar = 1       // Leitura e escrita
}
```

## 🎯 Regras de Negócio

### Operações de Leitura (GET)

✅ **Permitido para ambas as permissões** (`Visualizar` e `Editar`)

- Listar rendimentos, despesas, investimentos
- Visualizar categorias
- Ver relatórios e dashboards
- Consultar dados históricos

### Operações de Escrita (POST, PUT, DELETE)

✅ **Permitido apenas com permissão `Editar`**

- Adicionar rendimentos, despesas, investimentos
- Atualizar valores
- Excluir registros
- Criar/editar/excluir categorias

❌ **Bloqueado com permissão `Visualizar`**

## 🔄 Fluxo de Validação

### 1. Frontend - Controle de UI

**Store**: `compartilhamento-store.ts`

```typescript
// Computed que determina se pode editar
const podeEditar = computed(() => {
  // Se não está em modo compartilhado, pode editar
  if (!emModoCompartilhado.value) return true;
  
  // Se está compartilhado, verifica permissão
  return contextoAtivo.value?.permissao === NivelPermissao.Editar;
});
```

**Componente**: `RendimentoPage.vue`

```vue
<template>
  <!-- Botão de adicionar -->
  <q-btn
    v-if="compartilhamentoStore.podeEditar"
    label="Adicionar Rendimento"
    icon="add"
    @click="abrirModalAdicionar"
  />
  
  <!-- Botões de ação na tabela -->
  <q-btn
    v-if="compartilhamentoStore.podeEditar"
    icon="edit"
    @click="editar(item)"
  />
  
  <q-btn
    v-if="compartilhamentoStore.podeEditar"
    icon="delete"
    @click="excluir(item)"
  />
  
  <!-- Edição inline de valor -->
  <q-popup-edit
    v-if="compartilhamentoStore.podeEditar"
    v-model="item.valor"
    @save="atualizarValor"
  />
  
  <!-- Mensagem quando não pode editar -->
  <div v-else class="text-grey-6 text-caption">
    Somente leitura
  </div>
</template>

<script setup lang="ts">
import { useCompartilhamentoStore } from 'src/stores/compartilhamento-store';

const compartilhamentoStore = useCompartilhamentoStore();
</script>
```

### 2. Backend - Validação em Serviços

**Padrão aplicado em TODOS os serviços**:
- `RendimentoService`
- `DespesaService`
- `InvestimentoService`
- `CategoriaService`

#### Operações de Leitura

```csharp
// RendimentoService.cs
public async Task<List<ResultRendimentoDTO>> ObterMesAno(int mes, int ano)
{
    // ✅ SEM verificação de permissão
    // Usa IdContextoDados para buscar dados corretos
    var rendimentos = await _repository.ObterPeloMes(
        mes, 
        ano, 
        _usuarioLogado.IdContextoDados  // Contexto do proprietário ou próprio
    );
    
    return rendimentos.Select(x => ObterRendimentoDTO(x)).ToList();
}
```

#### Operações de Escrita

```csharp
// RendimentoService.cs
public async Task<Result<ResultRendimentoDTO>> Adicionar(CreateRendimentoDTO dto)
{
    // ✅ VERIFICA permissão de edição
    if (_usuarioLogado.EmModoCompartilhado && 
        _usuarioLogado.PermissaoAtual != NivelPermissao.Editar)
    {
        return Result.Failure<ResultRendimentoDTO>(
            Error.Forbidden("Você não tem permissão para editar os dados deste usuário."));
    }
    
    // ... resto da lógica
}

public async Task<Result<ResultRendimentoDTO>> Atualizar(UpdateRendimentoDTO dto)
{
    // ✅ VERIFICA permissão de edição
    if (_usuarioLogado.EmModoCompartilhado && 
        _usuarioLogado.PermissaoAtual != NivelPermissao.Editar)
    {
        return Result.Failure<ResultRendimentoDTO>(
            Error.Forbidden("Você não tem permissão para editar os dados deste usuário."));
    }
    
    // ... resto da lógica
}

public async Task<Result> Excluir(string id)
{
    // ✅ VERIFICA permissão de edição
    if (_usuarioLogado.EmModoCompartilhado && 
        _usuarioLogado.PermissaoAtual != NivelPermissao.Editar)
    {
        return Result.Failure(
            Error.Forbidden("Você não tem permissão para editar os dados deste usuário."));
    }
    
    // ... resto da lógica
}

public async Task<Result<ResultRendimentoDTO>> AtualizarValor(UpdateValorTransacaoDTO dto)
{
    // ✅ VERIFICA permissão de edição
    if (_usuarioLogado.EmModoCompartilhado && 
        _usuarioLogado.PermissaoAtual != NivelPermissao.Editar)
    {
        return Result.Failure<ResultRendimentoDTO>(
            Error.Forbidden("Você não tem permissão para editar os dados deste usuário."));
    }
    
    // ... resto da lógica
}
```

### 3. Propriedades do IUsuarioLogado

**Interface**: `IUsuarioLogado.cs` (Domain)

```csharp
public interface IUsuarioLogado
{
    string Id { get; }
    Usuario Usuario { get; }
    
    // Propriedades para compartilhamento
    string IdContextoDados { get; }           // ID do proprietário ou próprio
    bool EmModoCompartilhado { get; }         // true se acessando dados de outro
    NivelPermissao? PermissaoAtual { get; }   // null se não compartilhado
}
```

**Implementação**: `UsuarioLogado.cs` (WebApi)

```csharp
public class UsuarioLogado : IUsuarioLogado
{
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

## 📊 Matriz de Permissões

| Operação | Próprios Dados | Compartilhado (Visualizar) | Compartilhado (Editar) |
|----------|----------------|----------------------------|------------------------|
| **GET** - Listar | ✅ Permitido | ✅ Permitido | ✅ Permitido |
| **GET** - Obter por ID | ✅ Permitido | ✅ Permitido | ✅ Permitido |
| **POST** - Criar | ✅ Permitido | ❌ Bloqueado (403) | ✅ Permitido |
| **PUT** - Atualizar | ✅ Permitido | ❌ Bloqueado (403) | ✅ Permitido |
| **PUT** - Atualizar Valor | ✅ Permitido | ❌ Bloqueado (403) | ✅ Permitido |
| **DELETE** - Excluir | ✅ Permitido | ❌ Bloqueado (403) | ✅ Permitido |

## 🔍 Exemplos Práticos

### Exemplo 1: Usuário com Permissão Visualizar

**Cenário**: João compartilhou dados com Maria (permissão: Visualizar)

```typescript
// Frontend - Maria tenta adicionar rendimento
await rendimentoService.create(novoRendimento);
```

**Backend recebe**:
```http
POST /api/rendimento HTTP/1.1
Authorization: Bearer {token-maria}
X-Proprietario-Id: joao-id
```

**UsuarioLogado**:
```csharp
Id = "maria-id"
IdContextoDados = "joao-id"
EmModoCompartilhado = true
PermissaoAtual = NivelPermissao.Visualizar
```

**RendimentoService.Adicionar()**:
```csharp
if (EmModoCompartilhado && PermissaoAtual != NivelPermissao.Editar)
    return Error.Forbidden(...);  // ❌ BLOQUEADO
```

**Resposta**: `403 Forbidden`
```json
{
  "message": "Você não tem permissão para editar os dados deste usuário."
}
```

**Frontend**:
- Botão de adicionar nem aparece (v-if="podeEditar")
- Se tentar via API diretamente, recebe 403

### Exemplo 2: Usuário com Permissão Editar

**Cenário**: João compartilhou dados com Pedro (permissão: Editar)

```typescript
// Frontend - Pedro adiciona rendimento
await rendimentoService.create(novoRendimento);
```

**Backend recebe**:
```http
POST /api/rendimento HTTP/1.1
Authorization: Bearer {token-pedro}
X-Proprietario-Id: joao-id
```

**UsuarioLogado**:
```csharp
Id = "pedro-id"
IdContextoDados = "joao-id"
EmModoCompartilhado = true
PermissaoAtual = NivelPermissao.Editar
```

**RendimentoService.Adicionar()**:
```csharp
if (EmModoCompartilhado && PermissaoAtual != NivelPermissao.Editar)
    return Error.Forbidden(...);  // ✅ PASSA (Editar == Editar)

// Cria rendimento para João
var rendimento = new Rendimento(..., _usuarioLogado.Usuario);
// Usuario aqui é João (proprietário), não Pedro
```

**Resposta**: `200 OK` + dados do rendimento criado

### Exemplo 3: Operação de Leitura

**Cenário**: Maria (Visualizar) lista rendimentos de João

```typescript
// Frontend
const rendimentos = await rendimentoService.getByMonth(2, 2026);
```

**Backend**:
```csharp
public async Task<List<ResultRendimentoDTO>> ObterMesAno(int mes, int ano)
{
    // ✅ SEM verificação de permissão
    var rendimentos = await _repository.ObterPeloMes(
        mes, 
        ano, 
        _usuarioLogado.IdContextoDados  // "joao-id"
    );
    
    return rendimentos.Select(x => ObterRendimentoDTO(x)).ToList();
}
```

**Resposta**: `200 OK` + lista de rendimentos de João

## ❌ Tratamento de Erros

### Frontend

**Axios Response Interceptor**:

```typescript
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 403) {
      Notify.create({
        type: 'negative',
        message: 'Você não tem permissão para realizar esta ação'
      });
    }
    return Promise.reject(error);
  }
);
```

### Backend

**Result Pattern**:

```csharp
// Error.cs
public static Error Forbidden(string message) => 
    new(TypeError.Forbidden, message);

public enum TypeError
{
    Validation,
    NotFound,
    Exception,
    Forbidden  // ← Novo tipo
}
```

**Extension Method**:

```csharp
// ResultExtensionsApi.cs
private static IResult HandleFailure(Error error) => error.Type switch
{
    TypeError.Validation => Results.UnprocessableEntity(ApiResultError.Create(error)),
    TypeError.NotFound => Results.NotFound(ApiResultError.Create(error)),
    TypeError.Exception => Results.InternalServerError(ApiResultError.Create(error)),
    TypeError.Forbidden => Results.Json(
        ApiResultError.Create(error), 
        statusCode: (int)HttpStatusCode.Forbidden),  // 403
    _ => throw new Exception("TypeError invalid")
};
```

## 🔍 Pontos de Atenção

1. **Defesa em profundidade**: Validação tanto no frontend (UX) quanto no backend (segurança)
2. **Consistência**: Mesmo padrão em todos os serviços
3. **Performance**: `PermissaoAtual` faz query ao banco - considerar cache
4. **Auditoria**: Registrar tentativas de acesso não autorizado (futuro)
5. **Mensagens claras**: Usuário deve entender por que não pode realizar ação

## 🔗 Relacionados

- [03-trocar-contexto.md](./03-trocar-contexto.md) - Como contexto é definido
- [06-modo-leitura.md](./06-modo-leitura.md) - Adaptação da UI para modo leitura
- [05-gerenciar-compartilhamentos.md](./05-gerenciar-compartilhamentos.md) - Alterar permissões
