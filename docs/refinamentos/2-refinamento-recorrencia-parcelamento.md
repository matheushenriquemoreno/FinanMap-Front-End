# 📋 Refinamento — Compras Parceladas e Recorrência Automática

> **Objetivo**: Fornecer ao usuário a capacidade de lançar uma despesa como **Parcelada** (ex: 12x de R$ 100) ou **Recorrente/Assinatura** (mensal), com o Back-end gerenciando a criação das parcelas ou a replicação, refletindo automaticamente nos dashboards dos meses seguintes no Front-end.

---

## 📖 Contexto e Solução Escolhida

Atualmente, o usuário precisa replicar manualmente as despesas. Isso é problemático para *Parcelamentos*, pois o valor total da compra deve ser dividido entre os meses.

**Diferença dos Conceitos:**
1. **Compras Parceladas**: O usuário compra algo de valor X. O valor é fixo e rateado em `N` parcelas mensais (ex: 1/12, 2/12). Tem uma data de fim.
2. **Assinatura/Recorrente**: O usuário paga X por mês de forma contínua (ex: Netflix, Spotify). Não tem um número definido de parcelas.

Para minimizar o impacto na arquitetura existente (onde a visualização do Dashboard é feita buscando registros no banco filtrando por `mês` e `ano`), **a abordagem escolhida é a da Projeção Imediata no Banco de Dados.**

---

## 🏗️ 1. Back-End: Modelagem e Alterações

### 1.1 Modificações na Entidade `Despesa`
Para saber que uma despesa faz parte de um grupo ou de um parcelamento (para permitir editar ou deletar as futuras em cascata), precisaremos vincular os registros.

Modificar a entidade `Despesa`:

```csharp
public class Despesa {
    // Campos já existentes...
    public Guid Id { get; set; }
    public decimal Valor { get; set; }
    public string Descricao { get; set; }
    // ...

    // NOVOS CAMPOS PARA RECORRÊNCIA:
    public string? DespesaOrigemId { get; set; } // Agrupa as despesas da mesma compra
    public bool IsParcelado { get; set; }
    public bool IsRecorrente { get; set; }
    public int? ParcelaAtual { get; set; }    // Ex: 1
    public int? TotalParcelas { get; set; }   // Ex: 12
}
```

### 1.2 DTOs de Entrada

Atualizar o `CriarDespesaDTO` ou criar um específico para contemplar isso.

```csharp
public class LancarDespesaLoteDTO {
    public string Descricao { get; set; }
    public decimal ValorTotal { get; set; }
    public Guid CategoriaId { get; set; }
    public int AnoInicial { get; set; }  // Ano de referência da primeira parcela
    public int MesInicial { get; set; }  // Mês de referência da primeira parcela
    
    // Opções de Lote
    public bool IsParcelado { get; set; } 
    public int QuantidadeMeses { get; set; } 
    public bool IsRecorrenteFixa { get; set; } // Uma assinatura, valor mensal ao invés de rateio
}
```

### 1.3 Lógica de Negócio (Service)

No domínio, o serviço terá o novo método `LancarDespesaEmLoteAsync(dto)`.

**Regra para Parcelamento (`IsParcelado = true`):**
1. O valor de cada despesa inserida será `ValorTotal / QuantidadeMeses`.
2. O sistema faz um laço de `1` até `QuantidadeMeses`.
3. Insere uma despesa no banco incrementando `Mes` e `Ano` a cada iteração a partir de `MesInicial`/`AnoInicial` (quando `Mes > 12`, reseta para `1` e incrementa `Ano`).
4. Altera a descrição para: `Descricao + $" ({i}/{QuantidadeMeses})"`.
5. Coloca um `DespesaOrigemId` único (ex: Guid autogerado) vinculando as 12 despesas criadas.

**Regra para Recorrente (`IsRecorrenteFixa = true`):**
1. O sistema faz um laço de `1` até `QuantidadeMeses` (o usuário diz "projetar para os próximos 12 meses", por exemplo).
2. O valor de cada despesa é igual ao `ValorTotal` (Não divide o valor).
3. Insere a despesa no banco incrementando `Mes` e `Ano` a cada iteração a partir de `MesInicial`/`AnoInicial`.
4. Coloca um `DespesaOrigemId` único para identificação.

### 1.4 API Endpoints
- **`POST /api/despesa/lote`**: Recebe o `LancarDespesaLoteDTO` e gera internamente todas as entradas.

#### Endpoint Inteligente de Atualização (Edição de Parcelas / Recorrências)
O grande desafio de operações geradas em lote é quando o usuário altera o valor ou a categoria de uma despesa. Para garantir integridade UX/Data, vamos refinar este endpoint crucial:

- **`PUT /api/despesa/{id}/lote`**
Este endpoint lidará com qualquer edição originária de uma despesa que possua `DespesaOrigemId`.

**DTO de Atualização (`AtualizarLoteDespesaDTO`):**
```csharp
public class AtualizarLoteDespesaDTO {
    public decimal NovoValor { get; set; }
    public string NovaDescricao { get; set; }
    public Guid NovaCategoriaId { get; set; }

    // O coração da feature: O raio de impacto
    // 0 = AtualizarApenasEsta
    // 1 = AtualizarEstaEProximas
    // 2 = AtualizarTodasDoLote
    public ModificadorLote Modificador { get; set; } 
}
```

**Regras de Negócio no Backend (`DespesaDomainService`):**

1. **`AtualizarApenasEsta`:**
   - Comportamento padrão de um `PUT` convencional. 
   - Exemplo de uso: *A fatura do mês atual da assinatura de luz veio mais cara. O usuário edita a despesa de R$100 para R$120. Apenas esse `Id` sofre o UPDATE. As despesas dos próximos meses, vinculadas ao mesmo `DespesaOrigemId`, permanecem inalteradas.*

2. **`AtualizarEstaEProximas`:**
   - **MUITO IMPORTANTE:** Não podemos confiar em dados arbitrários do Front-End para definir a linha de corte. 
   - A requisição é feita para um `{id}` específico (a parcela em que o usuário clicou). O backend primeiramente faz um `var despesaAlvo = await repository.GetByIdAsync(id)`.
   - **Para Despesas Parceladas:** Como temos os dados verdadeiros em `despesaAlvo`, o backend extrai o `.ParcelaAtual` e aplica o filtro Mongo: `Builders<Despesa>.Filter.And(Builders<Despesa>.Filter.Eq(x => x.DespesaOrigemId, despesaAlvo.DespesaOrigemId), Builders<Despesa>.Filter.Gte(x => x.ParcelaAtual, despesaAlvo.ParcelaAtual))`
   - **Para Despesas Recorrentes:** Como Assinaturas não possuem `ParcelaAtual` sequencial, o backend utiliza os campos `Ano` e `Mes` da `despesaAlvo` para definir a linha de corte. O filtro Mongo deve buscar registros com o mesmo `DespesaOrigemId` cujo `Ano`/`Mes` seja >= ao `Ano`/`Mes` da `despesaAlvo`. Exemplo: `Filter.And(Eq(DespesaOrigemId, ...), Or(Gt(Ano, despesaAlvo.Ano), And(Eq(Ano, despesaAlvo.Ano), Gte(Mes, despesaAlvo.Mes))))`
   - Faz o update em massa (`UpdateManyAsync` ou `ForEach + UpdateOneAsync`) para todos os registros encontrados com os novos valores (`NovoValor`, `NovaDescricao`, `NovaCategoriaId`). Desta forma, as despesas pagas em meses anteriores ficam 100% blindadas e o payload do Front fica livre de re-identificar dados.

3. **`AtualizarTodasDoLote`:**
   - O backend busca no MongoDB: `Builders<Despesa>.Filter.Eq(x => x.DespesaOrigemId, IdPai)`
   - Útil quando o usuário lança algo incorreto por engano (ex: categorizou 12 meses de IPTU como Lazer e quer consertar todas para Moradia de uma vez).
   - O update (`UpdateManyAsync`) afeta o histórico e o futuro em massa.

#### Endpoint Inteligente de Remoção (Exclusão em Cascata)
O processo de deleção (`DELETE`) deve seguir obrigatoriamente a mesma filosofia da atualização de lotes, evitando que o usuário tenha que deletar uma a uma uma Assinatura de 10 meses que foi cancelada.

- **`DELETE /api/despesa/{id}/lote`** (Pode assumir o endpoint padrão `DELETE /api/despesa/{id}?modificador={0|1|2}` usando QueryString)

**Parâmetro de Impacto (`ModificadorLote`):**

1. **`ExcluirApenasEsta` (Modificador = 0):**
   - Comportamento padrão de um delete individual.
   - O backend apenas apaga o `Id` solicitado. Opcionalmente (para refinamento futuro em Despesas Parceladas), recalcula o número das parcelas restantes, mas para Recorrências contínuas pode simplesmente pular aquele mês.

2. **`ExcluirEstaEProximas` (Modificador = 1):**
   - Segue a mesma linha de raciocínio da Edição.
   - O backend busca a despesa primária com o `{id}` vindo da rota (`GetByIdAsync`).
   - O backend aplica o filtro no MongoDB: `Eq(DespesaOrigemId, despesaAlvo.DespesaOrigemId) & Gte(ParcelaAtual, despesaAlvo.ParcelaAtual)`.
   - Exclui em massa os registros futuros encontrados via `DeleteManyAsync`.
   - Exemplo de uso: *O usuário cancelou a Netflix a partir do mês de Outubro. Ele clica em Excluir na conta de Outubro e escolhe "Esta e as próximas". Historicamente os meses pagos continuam lá, as futuras morrem.*
   - **Regra de Banco Crítica**: Como são várias transações atreladas, usar o `IClientSessionHandle` (Session Transaction do MongoDb Driver) para garantir o *AbortTransactionAsync* se o delete em lote falhar. *(Requer MongoDB em Replica Set)*.

3. **`ExcluirTodasDoLote` (Modificador = 2):**
   - O backend aplica o filtro: `Eq(DespesaOrigemId, IdPai)`.
   - Útil quando o usuário lançou a recorrência totalmente incorreta (Ex: Gerou 24x ao invés de 12x desde o início).
   - Exclui completamente todos os vínculos em massa via `DeleteManyAsync`.

> **UI do Front-end (Modal de Confirmação):**
> O Front-end ao interceptar a exclusão de uma despesa `emVincunlo` (`DespesaOrigemId != null`), deve exibir um `q-dialog`: "Esta despesa se repete em outros meses. Deseja excluir:"
> `[X] Apenas este lançamento`
> `[ ] Este e os próximos eventos`
> `[ ] Todos os eventos vinculados` 
> Se não houver vínculo (`DespesaOrigemId == null`), segue o Popup nativo atual "Excluir transação?".

---

## 🌐 2. Front-End: Interfaces e Lógica

### 2.1 Atualização das Interfaces TypeScript
**Arquivo:** `src/Model/Transacao.ts`

Adicionar os novos campos nas interfaces existentes e criar as novas interfaces para operações em lote:

```typescript
// --- Atualização nas interfaces existentes ---

export interface DespesaResult extends TransacaoResult {
  ehDespesaAgrupadora: boolean;
  idDespesaAgrupadora: string;
  agrupadora: DespesaResult | null;
  despesasFilhas?: DespesaResult[];
  // NOVOS CAMPOS:
  despesaOrigemId?: string;   // Vínculo do lote (parcelamento ou recorrência)
  isParcelado?: boolean;
  isRecorrente?: boolean;
  parcelaAtual?: number;      // Ex: 3
  totalParcelas?: number;     // Ex: 12
}

// --- Novas interfaces para operações em lote ---

export interface LancarDespesaLoteDTO {
  descricao: string;
  valorTotal: number;
  categoriaId: string;
  anoInicial: number;          // Ano de referência da primeira parcela
  mesInicial: number;          // Mês de referência da primeira parcela
  isParcelado: boolean;
  isRecorrenteFixa: boolean;
  quantidadeMeses: number;
}

export interface AtualizarLoteDespesaDTO {
  novoValor: number;
  novaDescricao: string;
  novaCategoriaId: string;
  modificador: ModificadorLote;
}

// Enum que define o raio de impacto da operação em lote
export enum ModificadorLote {
  ApenasEsta = 0,
  EstaEProximas = 1,
  TodasDoLote = 2,
}
```

### 2.2 Novos Métodos no `DespesaService.ts`
**Arquivo:** `src/services/transacao/DespesaService.ts`

O `DespesaService` já estende `TransacaoServiceBase` e usa o pattern `requestWithLoading`. Os novos métodos devem seguir o **mesmo padrão de classe**:

```typescript
import type {
  DespesaCreate, DespesaResult,
  LancarDespesaLoteDTO, AtualizarLoteDespesaDTO
} from 'src/Model/Transacao';
import TransacaoServiceBase from '../base/TransacaoBaseService';

class DespesaService extends TransacaoServiceBase<DespesaCreate, DespesaResult> {
  constructor() {
    super('Despesas');
  }

  // Método já existente
  async getDespesasAgrupadas(id: string) { /* ... */ }

  // NOVO: Criar despesas em lote (parcelamento ou recorrência)
  async criarEmLote(dto: LancarDespesaLoteDTO) {
    return this.requestWithLoading(async () => {
      const response = await this.axios.post<void>(`${this.baseUrl}/lote`, dto);
      notificar('Despesas geradas com sucesso!');
      return response.data;
    });
  }

  // NOVO: Atualizar despesas em lote (com ModificadorLote)
  async atualizarLote(id: string, dto: AtualizarLoteDespesaDTO) {
    return this.requestWithLoading(async () => {
      const response = await this.axios.put<void>(`${this.baseUrl}/${id}/lote`, dto);
      notificar('Despesa(s) atualizada(s) com sucesso!');
      return response.data;
    });
  }

  // NOVO: Excluir despesas em lote (com ModificadorLote via QueryString)
  async excluirLote(id: string, modificador: number) {
    return this.requestWithLoading(async () => {
      await this.axios.delete(`${this.baseUrl}/${id}`, {
        params: { modificador },
      });
      notificar('Despesa(s) excluída(s) com sucesso!');
    });
  }
}

export default function getDespesaService() {
  return new DespesaService();
}
```

### 2.3 Modificações no Formulário de Lançamento
**Arquivo:** `src/components/Despesa/ModalCreateUpdateDespesa.vue`

Na UI de criação, introduzimos um **Toggle Switch** que ao ser ativado exibe os controles de lote. O toggle só aparece quando **não** é edição (`!ehEdicao`), pois a edição de lotes já existentes usa outro fluxo.

**Novas Variáveis Reativas:**
```typescript
const modoLote = ref(false);
const tipoLote = ref<'PARCELADO' | 'RECORRENTE'>('PARCELADO');
const quantidadeMeses = ref<number>(2);
```

**Template (adicionar dentro do `<q-form>`, antes dos botões de ação):**
```html
<!-- Toggle Mode (somente na criação, nunca na edição) -->
<q-toggle v-if="!ehEdicao" v-model="modoLote" label="Parcelar / Assinatura" />

<!-- Opções de Lote (aparecem com animação ao ativar) -->
<div v-if="modoLote && !ehEdicao">
   <q-radio v-model="tipoLote" val="PARCELADO" label="Compra Parcelada (Divide o valor)" />
   <q-radio v-model="tipoLote" val="RECORRENTE" label="Assinatura Mensal (Mantém o valor)" />

   <q-input
      rounded filled
      v-model.number="quantidadeMeses"
      type="number"
      label="Quantidade de Meses (Parcelas)"
      min="2" max="144"
      :rules="[
        (val: number) => val >= 2 || 'Mínimo de 2 meses',
        (val: number) => val <= 144 || 'Máximo de 144 meses',
        (val: number) => Number.isInteger(val) || 'Deve ser um número inteiro'
      ]"
   />

   <!-- Resumo Preditivo -->
   <q-banner v-if="resumoLancamento" class="bg-blue-1 text-blue-9 q-mt-sm" rounded>
      <template v-slot:avatar>
        <q-icon name="info" color="blue" />
      </template>
      {{ resumoLancamento }}
   </q-banner>
</div>
```

**Computed de Resumo Preditivo:**
```typescript
const resumoLancamento = computed(() => {
   if (!modoLote.value) return '';

   const valor = Number(dadosFormulario.value.valor) || 0;
   if (valor <= 0 || quantidadeMeses.value < 2) return '';

   if (tipoLote.value === 'PARCELADO') {
      const valorParcela = valor / quantidadeMeses.value;
      return `Serão lançadas ${quantidadeMeses.value} parcelas mensais de R$ ${valorParcela.toFixed(2)}`;
   } else {
      return `Será mantido o lançamento de R$ ${valor.toFixed(2)} por ${quantidadeMeses.value} meses seguidos`;
   }
});
```

**Submissão do Formulário** (ajustar `submitFormulario`):
```typescript
const submitFormulario = () => {
  dadosFormulario.value.idDespesaAgrupadora = despesaAgrupadora.value?.id ?? '';

  if (props.ehEdicao) {
    emit('onSubmitEdit', dadosFormulario.value as DespesaCreate);
  } else if (modoLote.value) {
    // Emite evento específico para criação em lote
    emit('onSubmitAddLote', {
      descricao: dadosFormulario.value.descricao,
      valorTotal: Number(dadosFormulario.value.valor),
      categoriaId: dadosFormulario.value.categoriaId,
      anoInicial: props.ano,    // Recebe via props (do GerenciamentoMensal)
      mesInicial: props.mes,    // Recebe via props (do GerenciamentoMensal)
      isParcelado: tipoLote.value === 'PARCELADO',
      isRecorrenteFixa: tipoLote.value === 'RECORRENTE',
      quantidadeMeses: quantidadeMeses.value,
    } as LancarDespesaLoteDTO);
  } else {
    emit('onSubmitAdd', dadosFormulario.value as DespesaCreate);
  }
};
```

> **Importante:** Adicionar o novo emit `onSubmitAddLote` na definição de emits:
> ```typescript
> (e: 'onSubmitAddLote', dados: LancarDespesaLoteDTO): void;
> ```

### 2.4 Lógica da Página `DespesaPage.vue` — Criação em Lote
**Arquivo:** `src/pages/GerenciamentoMensal/DespesaPage.vue`

Conectar o novo evento do modal à chamada do service:

```html
<!-- No template, adicionar o handler no ModalDespesa -->
<ModalDespesa
  ...
  @on-submit-add-lote="adicionarEmLote"
/>
```

```typescript
async function adicionarEmLote(dto: LancarDespesaLoteDTO) {
  await despesaservice.criarEmLote(dto);
  abriModal.value = false;
  getReportAcumulado();
}
```

### 2.5 Modal de Edição em Lote (Raio de Impacto)
**Arquivo:** `src/pages/GerenciamentoMensal/DespesaPage.vue`

Quando o usuário clica em "Editar" numa despesa vinculada (`despesaOrigemId != null`), o fluxo deve mudar:

```typescript
function abriModalEditarDespesa(despesa: DespesaResult) {
  despesaEdit.value = despesa;
  abriModalAdicionar(true);
}

async function editar(despesa: DespesaCreate) {
  const despesaOriginal = despesaEdit.value;

  // Se a despesa faz parte de um lote, perguntar o raio de impacto
  if (despesaOriginal.despesaOrigemId) {
    const modificador = await abrirDialogModificadorLote(
      'Esta despesa se repete em outros meses. Deseja editar:'
    );
    if (modificador === null) return; // Cancelou

    if (modificador === ModificadorLote.ApenasEsta) {
      // Update unitário convencional
      await despesaservice.update(despesa);
    } else {
      // Update em lote
      await despesaservice.atualizarLote(despesaOriginal.id!, {
        novoValor: Number(despesa.valor),
        novaDescricao: despesa.descricao,
        novaCategoriaId: despesa.categoriaId,
        modificador: modificador,
      });
    }
  } else {
    // Fluxo unitário normal
    await despesaservice.update(despesa);
  }

  fecharModal();
  getReportAcumulado();
}
```

### 2.6 Modal de Exclusão em Cascata (Raio de Impacto)
**Arquivo:** `src/pages/GerenciamentoMensal/DespesaPage.vue`

Ajustar a função `excluir()` existente para diferenciar despesas vinculadas:

```typescript
function excluir(id: string) {
  const despesa = despesas.value.find(d => d.id === id);

  // Se a despesa NÃO faz parte de um lote → dialog simples atual
  if (!despesa?.despesaOrigemId) {
    $q.dialog({
      message: 'Deseja realmente excluir essa despesa?',
      cancel: true,
      persistent: false,
    }).onOk(() => {
      despesaservice.delete(id).then(() => getReportAcumulado());
    });
    return;
  }

  // Se faz parte de lote → dialog com 3 opções
  abrirDialogModificadorLote(
    'Esta despesa se repete em outros meses. Deseja excluir:'
  ).then((modificador) => {
    if (modificador === null) return; // Cancelou
    despesaservice.excluirLote(id, modificador).then(() => getReportAcumulado());
  });
}
```

### 2.7 Componente do Dialog de Raio de Impacto (Reutilizável)
O dialog `abrirDialogModificadorLote` é utilizado tanto na edição quanto na exclusão. Pode ser implementado como uma função utilitária dentro da própria `DespesaPage.vue` ou extraído como composable:

```typescript
import { ModificadorLote } from 'src/Model/Transacao';

function abrirDialogModificadorLote(mensagem: string): Promise<ModificadorLote | null> {
  return new Promise((resolve) => {
    const modificadorSelecionado = ref(ModificadorLote.ApenasEsta);

    $q.dialog({
      title: 'Despesa Vinculada',
      message: mensagem,
      options: {
        type: 'radio',
        model: ModificadorLote.ApenasEsta,
        items: [
          { label: 'Apenas este lançamento', value: ModificadorLote.ApenasEsta },
          { label: 'Este e os próximos eventos', value: ModificadorLote.EstaEProximas },
          { label: 'Todos os eventos vinculados', value: ModificadorLote.TodasDoLote },
        ],
      },
      cancel: true,
      persistent: false,
    })
      .onOk((val: ModificadorLote) => resolve(val))
      .onCancel(() => resolve(null));
  });
}
```

### 2.8 Ajustes Visuais na Tabela e Listagem
**Arquivo:** `src/components/Despesa/DespesaTableRow.vue`

Para facilitar ao usuário identificar o que é parcela, ajustar a coluna de descrição:

```html
<q-td key="descricao" class="no-pointer-events coluna-descricao">
  {{ propsLocal.row.descricao }}

  <!-- Badge de Parcela: 3/12 -->
  <q-badge
    v-if="propsLocal.row.isParcelado && propsLocal.row.totalParcelas > 0"
    color="purple" outline class="q-ml-xs"
  >
    {{ propsLocal.row.parcelaAtual }}/{{ propsLocal.row.totalParcelas }}
  </q-badge>

  <!-- Ícone de Recorrência -->
  <q-icon
    v-if="propsLocal.row.isRecorrente"
    name="sync" color="teal" size="xs" class="q-ml-xs"
  >
    <q-tooltip>Despesa Recorrente</q-tooltip>
  </q-icon>
</q-td>
```

---

## 🔀 3. Fluxo de Integração Integrado

1. **Ação:** Usuário quer lançar a compra de um Smartphone de R$ 2.400 em 12 vezes.
2. **Front-End:** No modal de "Nova Despesa", ele seleciona a opção "Parcelar/Assinatura", Escolhe "Compra Parcelada", e coloca 12 meses. O Front exibe `Serão lançadas 12 parcelas mensais de R$ 200,00`.
3. **Comunicação:** Front dispara o `POST /api/despesa/lote`.
4. **Back-End:** Valida o DTO, faz um loop 1..12 dividindo 2400 por 12. Adiciona o Parent ID e cria uma `List<Despesa>`. Em seguida grava tudo via `InsertManyAsync` da collection de despesas no MongoDB..
5. **Retorno:** Status HTTP 201 OK.
6. **Front-End Atualização da Tela:** A tela inicial reinvoca a pesquisa (`store.carregarTransacoes()`). A primeira parcela aparece listada automaticamente para o mês corrente, equipada com o badge `1/12`.
7. Ao mudar mês no seletor do cabeçalho da aplicação (para mês+1), a parcela `2/12` já constará lá puxando os gráficos normalmente.

---

## 🚀 Próximos Passos — Checklist de Execução

> Marque cada item conforme for executando. A ordem recomendada é de cima para baixo, pois respeita as dependências entre as camadas.

---

### Fase 1 — Back-End: Entidade e Modelagem

- [ ] **1.1** `Domain\Despesa\Entity\Despesa.cs` — Adicionar os novos campos opcionais na entidade:
  - `string? DespesaOrigemId`
  - `bool IsParcelado`
  - `bool IsRecorrente`
  - `int? ParcelaAtual`
  - `int? TotalParcelas`
  - *(MongoDB C# Driver: sem necessidade de migrations, as propriedades viram BsonElements automaticamente)*

- [ ] **1.2** `Application\Despesa\DTOs\` — Criar o DTO `LancarDespesaLoteDTO` conforme seção 1.2 (campos: `Descricao`, `ValorTotal`, `CategoriaId`, `AnoInicial`, `MesInicial`, `IsParcelado`, `QuantidadeMeses`, `IsRecorrenteFixa`)

- [ ] **1.3** `Application\Despesa\DTOs\` — Criar o DTO `AtualizarLoteDespesaDTO` conforme seção 1.4 (campos: `NovoValor`, `NovaDescricao`, `NovaCategoriaId`, `Modificador`)

- [ ] **1.4** `Domain\` ou `Application\` — Criar o enum `ModificadorLote` com os valores: `ApenasEsta = 0`, `EstaEProximas = 1`, `TodasDoLote = 2`

---

### Fase 2 — Back-End: Lógica de Negócio (Service/Domain)

- [ ] **2.1** `Application\Despesa\Services\DespesaService.cs` ou `DespesaDomainService` — Implementar o método `LancarDespesaEmLoteAsync(LancarDespesaLoteDTO dto)`:
  - Lógica de **Parcelamento**: loop dividindo `ValorTotal / QuantidadeMeses`, incrementando `Mes`/`Ano` com wrap-around, gerando `DespesaOrigemId` único
  - Lógica de **Recorrência**: loop mantendo `ValorTotal` integral, mesma lógica de incremento de `Mes`/`Ano`

- [ ] **2.2** Implementar `AtualizarDespesaEmLoteAsync(string id, AtualizarLoteDespesaDTO dto)`:
  - `ApenasEsta`: update convencional no `Id`
  - `EstaEProximas`: busca despesaAlvo, filtra por `ParcelaAtual >=` (parceladas) ou `Ano/Mes >=` (recorrentes), `UpdateManyAsync`
  - `TodasDoLote`: filtra por `DespesaOrigemId`, `UpdateManyAsync`

- [ ] **2.3** Implementar `ExcluirDespesaEmLoteAsync(string id, ModificadorLote modificador)`:
  - Mesma lógica de filtro da atualização
  - Usar `IClientSessionHandle` (Transaction) para garantir atomicidade no `DeleteManyAsync`

---

### Fase 3 — Back-End: Endpoints e Repository

- [ ] **3.1** `Infra.data\Mongo\Repositorys\DespesaRepository.cs` — Preparar métodos de persistência:
  - `InsertManyAsync` para criação em lote
  - `UpdateManyAsync` para atualização em lote
  - `DeleteManyAsync` para exclusão em lote

- [ ] **3.2** `WebApi\Controllers\Despesa.cs` — Criar endpoint `POST /api/despesa/lote` recebendo `LancarDespesaLoteDTO`

- [ ] **3.3** Criar endpoint `PUT /api/despesa/{id}/lote` recebendo `AtualizarLoteDespesaDTO`

- [ ] **3.4** Ajustar endpoint `DELETE /api/despesa/{id}` para aceitar `?modificador={0|1|2}` via QueryString (ou criar `DELETE /api/despesa/{id}/lote`)

- [ ] **3.5** Garantir que o `GET /api/despesas` retorne os novos campos (`despesaOrigemId`, `isParcelado`, `isRecorrente`, `parcelaAtual`, `totalParcelas`) nos registros de resposta

---

### Fase 4 — Front-End

- [ ] **4.1** `src/Model/Transacao.ts` — Atualizar `DespesaResult` com os novos campos opcionais (`despesaOrigemId`, `isParcelado`, `isRecorrente`, `parcelaAtual`, `totalParcelas`)

- [ ] **4.2** `src/Model/Transacao.ts` — Criar as novas interfaces e enum: `LancarDespesaLoteDTO`, `AtualizarLoteDespesaDTO`, `ModificadorLote`

- [ ] **4.3** `src/services/transacao/DespesaService.ts` — Adicionar os 3 novos métodos na classe `DespesaService`:
  - `criarEmLote(dto)` → `POST /despesa/lote`
  - `atualizarLote(id, dto)` → `PUT /despesa/{id}/lote`
  - `excluirLote(id, modificador)` → `DELETE /despesa/{id}?modificador=X`

- [ ] **4.4** `src/components/Despesa/ModalCreateUpdateDespesa.vue` — Implementar modo lote no formulário de criação:
  - Toggle `modoLote` (visível apenas quando `!ehEdicao`)
  - Radios `PARCELADO` / `RECORRENTE`
  - Input `quantidadeMeses` com validações (`rules`)
  - Banner de resumo preditivo (`resumoLancamento` computed)
  - Novo emit `onSubmitAddLote` + lógica de submissão condicional

- [ ] **4.5** `src/pages/GerenciamentoMensal/DespesaPage.vue` — Conectar evento `@on-submit-add-lote` do modal à função `adicionarEmLote()` que chama `despesaservice.criarEmLote(dto)`

- [ ] **4.6** `src/pages/GerenciamentoMensal/DespesaPage.vue` — Criar a função utilitária `abrirDialogModificadorLote(mensagem)` com `q-dialog` de 3 opções radio (conforme seção 2.7)

- [ ] **4.7** `src/pages/GerenciamentoMensal/DespesaPage.vue` — Ajustar a função `editar()` para verificar `despesaOrigemId` e, se vinculada, abrir o dialog de raio de impacto antes de chamar `despesaservice.update()` ou `despesaservice.atualizarLote()`

- [ ] **4.8** `src/pages/GerenciamentoMensal/DespesaPage.vue` — Ajustar a função `excluir()` para verificar `despesaOrigemId` e, se vinculada, abrir o dialog de raio de impacto antes de chamar `despesaservice.excluirLote()`

- [ ] **4.9** `src/components/Despesa/DespesaTableRow.vue` — Adicionar na coluna de descrição:
  - `q-badge` com `parcelaAtual/totalParcelas` (quando `isParcelado && totalParcelas > 0`)
  - `q-icon` com tooltip "Despesa Recorrente" (quando `isRecorrente`)

