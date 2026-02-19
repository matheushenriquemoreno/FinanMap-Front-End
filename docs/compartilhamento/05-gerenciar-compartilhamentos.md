# Fluxo 05: Gerenciar Compartilhamentos

## 📝 Descrição

Este fluxo descreve como proprietários e convidados gerenciam compartilhamentos existentes, incluindo atualização de permissões e revogação de acesso.

## 👥 Atores

- **Proprietário**: Usuário que compartilhou seus dados
- **Convidado**: Usuário que recebeu acesso

## 🔄 Operações Disponíveis

### Para o Proprietário

1. **Visualizar compartilhamentos enviados**
2. **Atualizar permissão** (Visualizar ↔ Editar)
3. **Revogar acesso** (excluir compartilhamento)

### Para o Convidado

1. **Visualizar compartilhamentos recebidos**
2. **Sair do compartilhamento** (excluir acesso)

## 📋 Fluxo 1: Atualizar Permissão (Proprietário)

### 1. Visualizar Compartilhamentos Enviados

**Componente**: `CompartilhamentoConfig.vue`

```vue
<template>
  <q-card>
    <q-card-section>
      <h6>Meus Compartilhamentos</h6>
      
      <q-list>
        <q-item 
          v-for="comp in compartilhamentoStore.meusCompartilhamentos" 
          :key="comp.id"
        >
          <q-item-section>
            <q-item-label>
              <strong>{{ comp.convidadoEmail }}</strong>
            </q-item-label>
            <q-item-label caption>
              Status: 
              <q-badge :color="getStatusColor(comp.status)">
                {{ getStatusTexto(comp.status) }}
              </q-badge>
            </q-item-label>
            <q-item-label caption>
              Permissão: 
              <q-badge :color="comp.permissao === 0 ? 'blue' : 'green'">
                {{ comp.permissao === 0 ? 'Visualizar' : 'Editar' }}
              </q-badge>
            </q-item-label>
          </q-item-section>
          
          <q-item-section side v-if="comp.status === StatusConvite.Aceito">
            <div class="q-gutter-sm">
              <!-- Botão de alternar permissão -->
              <q-btn
                :icon="comp.permissao === 0 ? 'edit' : 'visibility'"
                :label="comp.permissao === 0 ? 'Dar Edição' : 'Só Leitura'"
                @click="alternarPermissao(comp)"
                size="sm"
              />
              
              <!-- Botão de revogar -->
              <q-btn
                icon="delete"
                label="Revogar"
                color="negative"
                @click="revogar(comp.id)"
                size="sm"
              />
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { useCompartilhamentoStore } from 'src/stores/compartilhamento-store';
import { NivelPermissao, StatusConvite } from 'src/models/Compartilhamento';

const compartilhamentoStore = useCompartilhamentoStore();

async function alternarPermissao(comp: Compartilhamento) {
  const novaPermissao = comp.permissao === NivelPermissao.Visualizar
    ? NivelPermissao.Editar
    : NivelPermissao.Visualizar;
  
  await compartilhamentoStore.atualizarPermissao(comp.id, novaPermissao);
}

async function revogar(id: string) {
  // Confirma ação
  Dialog.create({
    title: 'Revogar Acesso',
    message: 'Tem certeza que deseja revogar o acesso deste usuário?',
    cancel: true
  }).onOk(async () => {
    await compartilhamentoStore.revogar(id);
  });
}
</script>
```

### 2. Atualizar Permissão

**Store**: `compartilhamento-store.ts`

```typescript
async atualizarPermissao(compartilhamentoId: string, novaPermissao: NivelPermissao) {
  this.loading = true;
  
  try {
    await CompartilhamentoService.atualizarPermissao({
      compartilhamentoId,
      permissao: novaPermissao
    });
    
    // Atualiza localmente
    const comp = this.meusCompartilhamentos.find(c => c.id === compartilhamentoId);
    if (comp) {
      comp.permissao = novaPermissao;
    }
    
    Notify.create({
      type: 'positive',
      message: 'Permissão atualizada com sucesso!'
    });
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: 'Erro ao atualizar permissão'
    });
  } finally {
    this.loading = false;
  }
}
```

**Service**: `CompartilhamentoService.ts`

```typescript
async atualizarPermissao(dto: AtualizarPermissaoDTO): Promise<void> {
  await api.put('/compartilhamento/permissao', dto);
}
```

**Backend**: `CompartilhamentoService.cs`

```csharp
public async Task<Result> AtualizarPermissao(AtualizarPermissaoDTO dto)
{
    var compartilhamento = await _repository.ObterPorId(dto.CompartilhamentoId);
    
    if (compartilhamento == null)
        return Result.Failure(Error.NotFound("Compartilhamento não encontrado"));
    
    // Valida que é o proprietário
    if (compartilhamento.ProprietarioId != _usuarioLogado.Id)
        return Result.Failure(Error.Forbidden(
            "Apenas o proprietário pode alterar permissões"));
    
    // Valida que está aceito
    if (compartilhamento.Status != StatusConvite.Aceito)
        return Result.Failure(Error.Validation(
            "Só é possível alterar permissões de compartilhamentos aceitos"));
    
    // Atualiza permissão
    compartilhamento.AtualizarPermissao(dto.Permissao);
    
    await _repository.Atualizar(compartilhamento);
    
    return Result.Success();
}
```

**Entity**: `Compartilhamento.cs`

```csharp
public void AtualizarPermissao(NivelPermissao novaPermissao)
{
    Permissao = novaPermissao;
    DataAtualizacao = DateTime.UtcNow;
}
```

## 📋 Fluxo 2: Revogar Acesso (Proprietário)

### 1. Revogar Compartilhamento

**Store**: `compartilhamento-store.ts`

```typescript
async revogar(compartilhamentoId: string) {
  this.loading = true;
  
  try {
    await CompartilhamentoService.excluir(compartilhamentoId);
    
    // Remove da lista local
    this.meusCompartilhamentos = this.meusCompartilhamentos
      .filter(c => c.id !== compartilhamentoId);
    
    Notify.create({
      type: 'positive',
      message: 'Acesso revogado com sucesso!'
    });
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: 'Erro ao revogar acesso'
    });
  } finally {
    this.loading = false;
  }
}
```

**Service**: `CompartilhamentoService.ts`

```typescript
async excluir(compartilhamentoId: string): Promise<void> {
  await api.delete(`/compartilhamento/${compartilhamentoId}`);
}
```

**Backend**: `CompartilhamentoService.cs`

```csharp
public async Task<Result> Excluir(string compartilhamentoId)
{
    var compartilhamento = await _repository.ObterPorId(compartilhamentoId);
    
    if (compartilhamento == null)
        return Result.Failure(Error.NotFound("Compartilhamento não encontrado"));
    
    // Valida que é o proprietário
    if (compartilhamento.ProprietarioId != _usuarioLogado.Id)
        return Result.Failure(Error.Forbidden(
            "Apenas o proprietário pode revogar o compartilhamento"));
    
    await _repository.Excluir(compartilhamento);
    
    return Result.Success();
}
```

### 2. Impacto no Convidado

**Se convidado estiver usando os dados no momento**:

1. Próxima requisição com `X-Proprietario-Id` falhará
2. Backend retorna `403 Forbidden`
3. Frontend detecta erro e limpa contexto

```typescript
// Axios Response Interceptor
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 403 && 
        compartilhamentoStore.emModoCompartilhado) {
      
      // Limpa contexto automaticamente
      compartilhamentoStore.desativarContexto();
      
      Notify.create({
        type: 'warning',
        message: 'O acesso aos dados compartilhados foi revogado',
        timeout: 5000
      });
    }
    return Promise.reject(error);
  }
);
```

## 📋 Fluxo 3: Sair do Compartilhamento (Convidado)

### 1. Visualizar Compartilhamentos Recebidos

**Componente**: `CompartilhamentoConfig.vue`

```vue
<template>
  <q-card>
    <q-card-section>
      <h6>Compartilhamentos Recebidos</h6>
      
      <q-list>
        <q-item 
          v-for="comp in compartilhamentoStore.compartilhamentosAceitos" 
          :key="comp.id"
        >
          <q-item-section>
            <q-item-label>
              <strong>{{ comp.proprietarioNome }}</strong>
            </q-item-label>
            <q-item-label caption>
              {{ comp.proprietarioEmail }}
            </q-item-label>
            <q-item-label caption>
              Permissão: 
              <q-badge :color="comp.permissao === 0 ? 'blue' : 'green'">
                {{ comp.permissao === 0 ? 'Visualizar' : 'Editar' }}
              </q-badge>
            </q-item-label>
          </q-item-section>
          
          <q-item-section side>
            <q-btn
              icon="exit_to_app"
              label="Sair"
              color="negative"
              @click="sair(comp.id)"
              size="sm"
            />
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
async function sair(id: string) {
  Dialog.create({
    title: 'Sair do Compartilhamento',
    message: 'Você não terá mais acesso aos dados compartilhados. Deseja continuar?',
    cancel: true
  }).onOk(async () => {
    await compartilhamentoStore.sairDoCompartilhamento(id);
  });
}
</script>
```

### 2. Excluir Acesso

**Store**: `compartilhamento-store.ts`

```typescript
async sairDoCompartilhamento(compartilhamentoId: string) {
  this.loading = true;
  
  try {
    await CompartilhamentoService.excluir(compartilhamentoId);
    
    // Remove da lista local
    this.convitesRecebidos = this.convitesRecebidos
      .filter(c => c.id !== compartilhamentoId);
    
    // Se estava usando este contexto, desativa
    if (this.contextoAtivo?.proprietarioId === 
        this.convitesRecebidos.find(c => c.id === compartilhamentoId)?.proprietarioId) {
      this.desativarContexto();
    }
    
    Notify.create({
      type: 'positive',
      message: 'Você saiu do compartilhamento'
    });
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: 'Erro ao sair do compartilhamento'
    });
  } finally {
    this.loading = false;
  }
}
```

**Backend**: Mesmo endpoint de exclusão, mas valida que é o convidado

```csharp
public async Task<Result> Excluir(string compartilhamentoId)
{
    var compartilhamento = await _repository.ObterPorId(compartilhamentoId);
    
    if (compartilhamento == null)
        return Result.Failure(Error.NotFound("Compartilhamento não encontrado"));
    
    // Permite tanto proprietário quanto convidado excluir
    if (compartilhamento.ProprietarioId != _usuarioLogado.Id &&
        compartilhamento.ConvidadoId != _usuarioLogado.Id)
    {
        return Result.Failure(Error.Forbidden(
            "Você não tem permissão para excluir este compartilhamento"));
    }
    
    await _repository.Excluir(compartilhamento);
    
    return Result.Success();
}
```

## 📊 Matriz de Operações

| Operação | Proprietário | Convidado |
|----------|--------------|-----------|
| Visualizar compartilhamento | ✅ Sim | ✅ Sim |
| Atualizar permissão | ✅ Sim | ❌ Não |
| Excluir compartilhamento | ✅ Sim (revogar) | ✅ Sim (sair) |
| Reenviar convite | ❌ Não* | ❌ Não |

*Para reenviar, deve excluir e criar novo

## 🔄 Sincronização em Tempo Real

### Problema

Se proprietário alterar permissão ou revogar acesso, convidado não saberá até fazer nova requisição.

### Solução Atual

- Validação acontece a cada requisição HTTP
- Se acesso revogado, próxima chamada retorna 403
- Frontend detecta e limpa contexto

### Solução Futura (Opcional)

Implementar WebSocket ou polling para notificações em tempo real:

```typescript
// Exemplo com polling
setInterval(async () => {
  if (compartilhamentoStore.emModoCompartilhado) {
    await compartilhamentoStore.verificarAcessoAtivo();
  }
}, 60000); // A cada 1 minuto
```

## ✅ Casos de Uso Comuns

### Caso 1: Upgrade de Permissão

**Cenário**: Proprietário inicialmente deu "Visualizar", depois quer dar "Editar"

1. Proprietário clica "Dar Edição"
2. Backend atualiza `permissao: 1`
3. Convidado continua usando normalmente
4. Na próxima requisição de escrita, terá permissão

### Caso 2: Downgrade de Permissão

**Cenário**: Proprietário quer remover permissão de edição

1. Proprietário clica "Só Leitura"
2. Backend atualiza `permissao: 0`
3. Convidado perde acesso a botões de edição
4. Tentativas de escrita retornam 403

### Caso 3: Revogação Durante Uso

**Cenário**: Convidado está usando dados quando proprietário revoga

1. Proprietário clica "Revogar"
2. Backend exclui compartilhamento
3. Convidado continua vendo dados (cache local)
4. Próxima requisição retorna 403
5. Frontend limpa contexto e volta para dados próprios

## 🔍 Pontos de Atenção

1. **Confirmação de ações destrutivas**: Sempre pedir confirmação antes de revogar/sair
2. **Limpeza de contexto**: Se revogar compartilhamento ativo, limpar contexto
3. **Mensagens claras**: Explicar impacto das ações (ex: "O usuário perderá acesso imediatamente")
4. **Auditoria**: Registrar alterações de permissão e revogações (futuro)
5. **Limite de alterações**: Considerar cooldown para evitar spam de alterações

## 🔗 Relacionados

- [01-enviar-convite.md](./01-enviar-convite.md) - Criar compartilhamento
- [04-validacao-permissoes.md](./04-validacao-permissoes.md) - Como permissões funcionam
- [03-trocar-contexto.md](./03-trocar-contexto.md) - Impacto na troca de contexto
