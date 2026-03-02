# 📋 Refinamento — Integração do Agrupamento com Recorrência e Parcelamento

> **Objetivo**: Permitir que despesas criadas em lote (parcelamento ou recorrência) sejam **automaticamente vinculadas** a uma despesa agrupadora por categoria, mantendo a organização visual e contábil que o usuário já utiliza para planejar seus gastos mensais (ex: despesas do cartão de crédito agrupadas sob "Cartão Nubank").

---

## 📖 Contexto e Problema

### Situação Atual

O sistema possui **dois conceitos independentes** para organizar despesas:

1. **Agrupamento (`IdDespesaAgrupadora`)**: Uma despesa pode ser "agrupadora" (pai) e ter despesas filhas vinculadas. Isso é usado para organizar, por exemplo, todas as compras do cartão de crédito sob uma única linha que mostra o total. O valor da agrupadora é a soma das filhas.

2. **Lote (`DespesaOrigemId`)**: Uma despesa pode pertencer a um lote de parcelas ou recorrências. Isso é usado para lançar 12x de uma compra parcelada ou uma assinatura mensal, gerando automaticamente os registros nos meses futuros.

### O Problema

Quando o usuário cadastra uma despesa recorrente (ex: academia no cartão) ou parcelada (ex: tênis em 6x no cartão), essas despesas **não são vinculadas à despesa agrupadora** do cartão. O resultado é:

- As parcelas/recorrências ficam "soltas" na listagem, fora do grupo do cartão.
- O usuário precisa vincular manualmente cada parcela à agrupadora em cada mês — exatamente o trabalho repetitivo que o sistema de lote deveria evitar.
- O valor total do cartão fica incorreto, pois não considera as parcelas/recorrências geradas automaticamente.

### Exemplo Prático

> O usuário paga a academia mensalmente no cartão Nubank. Hoje ele tem a despesa agrupadora "Cartão Nubank" (valor = R$ 800) com despesas filhas como "Netflix", "Spotify", etc. Ao cadastrar "Academia" como recorrente por 12 meses, as 12 despesas são criadas corretamente nos meses futuros, **mas ficam fora do agrupamento do cartão**. O usuário esperaria que cada despesa "Academia" de cada mês fosse automaticamente filha do "Cartão Nubank" daquele mês.

---

## 🏗️ 1. Back-End: Alterações Necessárias

### 1.1 Atualização do DTO — `LancarDespesaLoteDTO`

Adicionar o campo opcional `IdDespesaAgrupadora` para que o usuário possa definir, no momento do lançamento em lote, a qual despesa agrupadora as parcelas/recorrências devem ser vinculadas.

**Arquivo:** `Application\Despesa\DTOs\LancarDespesaLoteDTO.cs`

```csharp
public class LancarDespesaLoteDTO
{
    public string Descricao { get; set; }
    public decimal ValorTotal { get; set; }
    public string CategoriaId { get; set; }
    public int AnoInicial { get; set; }
    public int MesInicial { get; set; }

    public bool IsParcelado { get; set; }
    public int QuantidadeMeses { get; set; }
    public bool IsRecorrenteFixa { get; set; }

    // NOVO: Vincular automaticamente as despesas geradas a uma agrupadora
    public string? IdDespesaAgrupadora { get; set; }
}
```

### 1.2 Lógica de Negócio — `DespesaService.LancarDespesaEmLoteAsync`

A lógica de criação em lote deve ser adaptada para:

1. Quando `IdDespesaAgrupadora` for informado, buscar a despesa agrupadora do mês/ano inicial.
2. Para cada mês futuro do lote, **buscar ou criar a despesa agrupadora correspondente** naquele mês.
3. Vincular cada despesa gerada à agrupadora do respectivo mês.
4. Atualizar o valor da agrupadora de cada mês somando o valor da nova filha.

**Arquivo:** `Application\Despesa\Services\DespesaService.cs`

```csharp
public async Task<Result> LancarDespesaEmLoteAsync(LancarDespesaLoteDTO dto)
{
    // Validações existentes (permissão, categoria) ...

    string despesaOrigemId = Guid.NewGuid().ToString();
    
    // Se tem agrupadora, buscar a agrupadora do mês inicial como referência
    Despesa? agrupadoaReferencia = null;
    if (!string.IsNullOrEmpty(dto.IdDespesaAgrupadora))
    {
        agrupadoaReferencia = await _repository.GetById(dto.IdDespesaAgrupadora);
        if (agrupadoaReferencia == null)
            return Result.Failure(Error.NotFound("Despesa agrupadora não encontrada."));
    }

    int anoCorrente = dto.AnoInicial;
    int mesCorrente = dto.MesInicial;

    decimal valorParcelaNormal = dto.IsParcelado 
        ? Math.Round(dto.ValorTotal / dto.QuantidadeMeses, 2) 
        : dto.ValorTotal;
    decimal valorAcumulado = 0;

    for (int i = 1; i <= dto.QuantidadeMeses; i++)
    {
        decimal valor = valorParcelaNormal;

        if (dto.IsParcelado)
        {
            if (i == dto.QuantidadeMeses)
                valor = dto.ValorTotal - valorAcumulado;
            valorAcumulado += valor;
        }

        string descricao = dto.IsParcelado 
            ? $"{dto.Descricao} ({i}/{dto.QuantidadeMeses})" 
            : dto.Descricao;

        var despesa = new Despesa(anoCorrente, mesCorrente, descricao, valor, categoria, 
                                  _usuarioLogado.UsuarioContextoDados)
        {
            DespesaOrigemId = despesaOrigemId,
            IsParcelado = dto.IsParcelado,
            IsRecorrente = dto.IsRecorrenteFixa,
            ParcelaAtual = dto.IsParcelado ? i : null,
            TotalParcelas = dto.IsParcelado ? dto.QuantidadeMeses : null
        };

        // NOVO: Vincular à agrupadora do mês correspondente
        if (agrupadoaReferencia != null)
        {
            var agrupadoaDoMes = await ObterOuClonarAgrupadora(
                agrupadoaReferencia, anoCorrente, mesCorrente);
            
            despesa.AdicionarDespesaAgrupadora(agrupadoaDoMes);
            agrupadoaDoMes.MarcarDespesaComoAgrupadora();
            
            // Atualizar o valor da agrupadora somando a nova filha
            agrupadoaDoMes.AtualizarValor(agrupadoaDoMes.Valor + valor);
            await _repository.Update(agrupadoaDoMes);
        }

        await _repository.Add(despesa);

        mesCorrente++;
        if (mesCorrente > 12) { mesCorrente = 1; anoCorrente++; }
    }

    return Result.Success();
}
```

### 1.3 Novo Método Auxiliar — `ObterOuClonarAgrupadora`

Este método resolve o problema central: nos meses futuros, a despesa agrupadora (ex: "Cartão Nubank") pode ou não já existir. O método busca a agrupadora existente no mês/ano alvo ou, se não existir, sinaliza que não será feito o vínculo naquele mês (pois a agrupadora pode ser criada pelo usuário ou pelo `ReplicarTransacao` futuramente).

> [!NOTE]
> **Abordagem definida**: Se a agrupadora não existir no mês futuro, o sistema **clona automaticamente** a agrupadora de referência para aquele mês/ano, garantindo que o vínculo estará sempre correto.

**Implementação:**

```csharp
/// <summary>
/// Busca a despesa agrupadora para o mês/ano informado.
/// Se não existir, clona a agrupadora de referência para aquele mês/ano.
/// </summary>
private async Task<Despesa> ObterOuClonarAgrupadora(
    Despesa agrupadoaReferencia, int ano, int mes)
{
    // Caso 1: A agrupadora é do próprio mês que estamos criando
    if (agrupadoaReferencia.Ano == ano && agrupadoaReferencia.Mes == mes)
        return agrupadoaReferencia;

    // Caso 2: Buscar agrupadora existente no mês/ano alvo
    // Buscar pela mesma descrição e categoria no mês/ano
    var agrupadorasNoMes = await _repository.GetWhere(
        x => x.Ano == ano 
             && x.Mes == mes 
             && x.Descricao == agrupadoaReferencia.Descricao
             && x.CategoriaId == agrupadoaReferencia.CategoriaId
             && x.UsuarioId == agrupadoaReferencia.UsuarioId);

    var agrupadoaExistente = agrupadorasNoMes.FirstOrDefault(x => x.EhAgrupadora() 
        || x.Descricao == agrupadoaReferencia.Descricao);
    
    if (agrupadoaExistente != null)
        return agrupadoaExistente;

    // Caso 3: Clonar a agrupadora para o mês futuro
    var clone = agrupadoaReferencia.Clone();
    clone.Ano = ano;
    clone.Mes = mes;
    clone.AtualizarValor(0); // Inicia com valor zero, será incrementado pelas filhas
    clone.MarcarDespesaComoAgrupadora();
    
    // Limpar dados de lote da agrupadora clonada (agrupadora não faz parte de lote)
    clone.DespesaOrigemId = null;
    clone.IsParcelado = false;
    clone.IsRecorrente = false;
    clone.ParcelaAtual = null;
    clone.TotalParcelas = null;

    await _repository.Add(clone);
    return clone;
}
```

### 1.4 Atualização em Lote com Agrupadora — `AtualizarDespesaEmLoteAsync`

Quando o usuário edita uma despesa em lote que está agrupada, o sistema deve:

- **Ao alterar valor**: Recalcular o valor da agrupadora de cada mês afetado.
- **Ao alterar categoria**: Questionar se a despesa deve ser desvinculada da agrupadora atual (já que a categoria mudou — pode não fazer mais sentido estar naquele grupo).

**Adição no método existente:**

```csharp
// Após o UpdateManyAsync das despesas do lote:
// Recalcular o valor de cada agrupadora afetada
var agrupadorasAfetadas = new HashSet<string>();

foreach (var despesa in despesasParaAtualizar)
{
    if (despesa.EstaAgrupada() && !string.IsNullOrEmpty(despesa.IdDespesaAgrupadora))
        agrupadorasAfetadas.Add(despesa.IdDespesaAgrupadora);
}

foreach (var idAgrupadora in agrupadorasAfetadas)
{
    var agrupadora = await _repository.GetById(idAgrupadora);
    if (agrupadora != null)
    {
        var valorTotal = await _repository.GetValorTotalDespesasDaAgrupadora(idAgrupadora);
        
        if (agrupadora.Valor < valorTotal)
        {
            agrupadora.AtualizarValor(valorTotal);
            await _repository.Update(agrupadora);
        }
    }
}
```

### 1.5 Exclusão em Lote com Agrupadora — `ExcluirDespesaEmLoteAsync`

Quando excluímos despesas em lote que estão agrupadas, devemos atualizar as agrupadoras afetadas:

```csharp
// Antes do DeleteManyAsync:
// Coletar as agrupadoras que precisam ser atualizadas
var agrupadorasParaAtualizar = new Dictionary<string, decimal>();

foreach (var despesa in despesasParaExcluir)
{
    if (despesa.EstaAgrupada())
    {
        if (!agrupadorasParaAtualizar.ContainsKey(despesa.IdDespesaAgrupadora))
            agrupadorasParaAtualizar[despesa.IdDespesaAgrupadora] = 0;
        
        agrupadorasParaAtualizar[despesa.IdDespesaAgrupadora] += despesa.Valor;
    }
}

// Após o DeleteManyAsync:
foreach (var (idAgrupadora, valorRemovido) in agrupadorasParaAtualizar)
{
    var agrupadora = await _repository.GetById(idAgrupadora);
    if (agrupadora != null)
    {
        agrupadora.DiminuirAgrupamento(...); // Ajustar valor e contadores
        await _repository.Update(agrupadora);
    }
}
```

---

## 🌐 2. Front-End: Alterações Necessárias

### 2.1 Atualização das Interfaces TypeScript

**Arquivo:** `src/Model/Transacao.ts`

Adicionar o campo `idDespesaAgrupadora` ao DTO de criação em lote:

```typescript
export interface LancarDespesaLoteDTO {
  descricao: string;
  valorTotal: number;
  categoriaId: string;
  anoInicial: number;
  mesInicial: number;
  isParcelado: boolean;
  quantidadeMeses: number;
  isRecorrenteFixa: boolean;
  // NOVO: Vincular as despesas geradas a uma agrupadora
  idDespesaAgrupadora?: string;
}
```

### 2.2 Modificações no Modal de Criação de Despesa

**Arquivo:** `src/components/Despesa/ModalCreateUpdateDespesa.vue`

O campo "Selecione a despesa agrupadora" (`CampoSelect` com `despesaAgrupadora`) **já existe** no formulário. O que falta é:

1. **Não ocultar** o campo de agrupadora quando o modo lote está ativo.
2. Incluir o `idDespesaAgrupadora` no DTO de `onSubmitAddLote`.

**Ajuste na submissão do formulário:**

```typescript
const submitFormulario = () => {
  if (props.ehEdicao) {
    dadosFormulario.value.idDespesaAgrupadora = despesaAgrupadora.value?.id ?? '';
    emit('onSubmitEdit', dadosFormulario.value as DespesaCreate);
  } else {
    if (modoLote.value) {
      const dtoLote: LancarDespesaLoteDTO = {
        descricao: dadosFormulario.value.descricao,
        valorTotal: Number(dadosFormulario.value.valor),
        categoriaId: categoriaSelecionada.value?.id ?? '',
        anoInicial: props.ano,
        mesInicial: props.mes,
        isParcelado: tipoLote.value === 'parcelado',
        quantidadeMeses: Number(quantidadeMeses.value),
        isRecorrenteFixa: tipoLote.value === 'recorrente',
        // NOVO: Passar o ID da agrupadora
        idDespesaAgrupadora: despesaAgrupadora.value?.id ?? undefined,
      };
      emit('onSubmitAddLote', dtoLote);
    } else {
      dadosFormulario.value.idDespesaAgrupadora = despesaAgrupadora.value?.id ?? '';
      emit('onSubmitAdd', dadosFormulario.value as DespesaCreate);
    }
  }
};
```

### 2.3 Ajuste Visual — Banner Informativo de Agrupamento no Lote

Quando o usuário selecionar uma agrupadora E ativar modo lote, exibir um banner explicativo:

```html
<!-- Após o banner de resumo do lote -->
<q-banner 
  v-if="modoLote && despesaAgrupadora" 
  class="bg-blue-1 q-mb-md rounded-borders"
>
  <template v-slot:avatar>
    <q-icon name="account_tree" color="blue" />
  </template>
  <div class="text-caption">
    As {{ quantidadeMeses }} despesas serão automaticamente vinculadas a
    <strong>"{{ despesaAgrupadora.descricao }}"</strong> em cada mês.
    Nos meses onde a agrupadora ainda não existir, ela será criada automaticamente.
  </div>
</q-banner>
```

### 2.4 Indicação Visual na Tabela

**Arquivo:** `src/components/Despesa/DespesaTableRow.vue`

Despesas que são **ao mesmo tempo** agrupadas E parte de um lote devem ter indicação visual clara. Atualmente já existem os badges de parcela e recorrência. Podendo manter o comportamento como está (eles aparecem na coluna de descrição).

Nenhuma alteração adicional necessária nesse componente para esta feature.

---

## 🔀 3. Fluxo de Integração Completo

### Cenário: Cadastrar Academia como Recorrente no Cartão Nubank

1. **Situação Inicial:** O usuário tem "Cartão Nubank" (agrupadora, R$ 800) com despesas filhas como "Netflix" (R$ 45) e "Spotify" (R$ 22).

2. **Ação:** O usuário abre "Nova Despesa", preenche "Academia" = R$ 150, e:
   - Seleciona a agrupadora "Cartão Nubank"
   - Ativa "Lançamento em Lote"
   - Escolhe "Recorrência Fixa" por 12 meses

3. **Front-End** mostra banner:
   > *As 12 despesas serão vinculadas a "Cartão Nubank" em cada mês.*
   > *A despesa de R$ 150,00 será repetida nos próximos 12 meses.*

4. **Front-End** dispara `POST /api/despesa/lote` com:  
   ```json
   { 
     "descricao": "Academia",
     "valorTotal": 150, 
     "categoriaId": "xxx",
     "anoInicial": 2026, "mesInicial": 3,
     "isRecorrenteFixa": true, "quantidadeMeses": 12,
     "idDespesaAgrupadora": "id-cartao-nubank"
   }
   ```

5. **Back-End** processa:
   - **Março/2026**: Busca "Cartão Nubank" do mês → encontra → vincula "Academia" como filha → atualiza valor para R$ 950
   - **Abril/2026**: Busca "Cartão Nubank" → não existe → clona da referência com valor R$ 0 → vincula "Academia" → atualiza valor para R$ 150
   - ... repete para os 12 meses

6. **Resultado:**
   - No mês de Março: "Cartão Nubank" mostra R$ 950 (antigos R$ 800 + R$ 150 de academia)
   - Nos meses futuros: existe uma cópia do "Cartão Nubank" já com "Academia" vinculada
   - Ao navegar pelos meses, as despesas já aparecem organizadas corretamente

### Cenário: Parcelamento de Tênis 6x no Cartão

1. **Ação:** O usuário lança "Tênis Nike" = R$ 600 em 6x, vinculado ao "Cartão Nubank"

2. **Back-End** processa:
   - Gera 6 despesas de R$ 100 cada (1/6, 2/6, ..., 6/6)
   - Cada uma é vinculada à agrupadora "Cartão Nubank" do respectivo mês
   - Em cada mês, o valor do "Cartão Nubank" é incrementado de R$ 100

---

## ⚠️ 4. Regras de Negócio e Edge Cases

### 4.1 Agrupadora Clonada vs. Existente

| Cenário | Comportamento |
|---------|--------------|
| Agrupadora existe no mês alvo | Vincula à existente e incrementa seu valor |
| Agrupadora **não** existe no mês alvo | Clona da referência com valor R$ 0 e vincula |
| Agrupadora clonada já recebeu filhas via `ReplicarTransacao` | Sem conflito — o valor é recalculado |

### 4.2 Exclusão em Lote de Despesas Agrupadas

Quando o usuário exclui parcelas futuras (ex: cancelou a academia), o sistema deve:
- Diminuir o valor da agrupadora de cada mês afetado
- Se a agrupadora ficar sem filhas, desmarcar como agrupadora
- **Não excluir a agrupadora automaticamente** — ela pode ter outras filhas

### 4.3 Edição em Lote de Despesas Agrupadas

Quando o usuário edita o valor de parcelas futuras em lote:
- Atualizar o valor de cada agrupadora afetada
- Se a categoria for alterada, questionar se deseja manter o agrupamento

### 4.4 Interação com `ReplicarTransacao`

O `ReplicarTransacaoService` já possui lógica para clonar agrupadoras e suas filhas. As despesas de lote que estão agrupadas serão clonadas normalmente por esse serviço, pois o `Clone()` mantém o `IdDespesaAgrupadora`. Não deve haver conflito entre os dois mecanismos, desde que a busca por "registro já cadastrado" funcione corretamente.

> [!WARNING]
> **Atenção**: Se o usuário usar **ambos** os mecanismos (criar lote com agrupadora E depois replicar para próximos meses), podem haver registros duplicados. O `ReplicarTransacao` busca por `Descricao + CategoriaId + Mes + Ano` para evitar duplicatas — isso já deve prevenir o cenário.

### 4.5 Modo Lote SEM Agrupadora

Se o campo de agrupadora for deixado em branco ao criar em lote, o comportamento permanece **idêntico ao atual** — despesas ficam soltas na listagem. Nenhuma regressão.

---

## 🚀 5. Checklist de Execução

> Marque cada item conforme for executando.

---

### Fase 1 — Back-End: DTO e Entidade

- [ ] **1.1** `Application\Despesa\DTOs\LancarDespesaLoteDTO.cs` — Adicionar campo `string? IdDespesaAgrupadora`

---

### Fase 2 — Back-End: Lógica de Negócio

- [ ] **2.1** `Application\Despesa\Services\DespesaService.cs` — Criar método auxiliar `ObterOuClonarAgrupadora(Despesa referencia, int ano, int mes)`:
  - Buscar agrupadora existente no mês/ano por `Descricao + CategoriaId + UsuarioId`
  - Se não encontrar, clonar da referência com valor R$ 0
  - Retornar a agrupadora encontrada ou criada

- [ ] **2.2** `Application\Despesa\Services\DespesaService.cs` — Modificar `LancarDespesaEmLoteAsync`:
  - Se `dto.IdDespesaAgrupadora` não for nulo, buscar agrupadora referência
  - No loop de criação, chamar `ObterOuClonarAgrupadora` para cada mês
  - Vincular a despesa criada à agrupadora do mês
  - Atualizar o valor da agrupadora

- [ ] **2.3** `Application\Despesa\Services\DespesaService.cs` — Modificar `AtualizarDespesaEmLoteAsync`:
  - Após atualizar as despesas, recalcular os valores das agrupadoras afetadas

- [ ] **2.4** `Application\Despesa\Services\DespesaService.cs` — Modificar `ExcluirDespesaEmLoteAsync`:
  - Antes de excluir, coletar as agrupadoras afetadas
  - Após excluir, recalcular valores e contadores das agrupadoras

---

### Fase 3 — Front-End: Interfaces

- [ ] **3.1** `src/Model/Transacao.ts` — Adicionar `idDespesaAgrupadora?: string` ao `LancarDespesaLoteDTO`

---

### Fase 4 — Front-End: UI

- [ ] **4.1** `src/components/Despesa/ModalCreateUpdateDespesa.vue` — Garantir que o campo "Selecione a despesa agrupadora" fique **visível** quando o modo lote está ativo (atualmente já aparece, apenas verificar)

- [ ] **4.2** `src/components/Despesa/ModalCreateUpdateDespesa.vue` — Na função `submitFormulario`, incluir `idDespesaAgrupadora` no `LancarDespesaLoteDTO` quando disponível

- [ ] **4.3** `src/components/Despesa/ModalCreateUpdateDespesa.vue` — Adicionar banner informativo quando `modoLote` e `despesaAgrupadora` estão ambos ativos

---

### Fase 5 — Testes e Validação

- [ ] **5.1** Testar criação em lote COM agrupadora (recorrência) — verificar que as despesas aparecem dentro da agrupadora em cada mês
- [ ] **5.2** Testar criação em lote COM agrupadora (parcelamento) — verificar valores corretos e badges de parcela
- [ ] **5.3** Testar criação em lote SEM agrupadora — verificar que o comportamento existente não regrediu
- [ ] **5.4** Testar exclusão em lote de despesas agrupadas — verificar que agrupadoras são atualizadas
- [ ] **5.5** Testar edição em lote de despesas agrupadas — verificar que valores das agrupadoras são recalculados
- [ ] **5.6** Testar cenário de agrupadora existente no mês futuro vs. agrupadora inexistente (clone)
- [ ] **5.7** Testar interação com ReplicarTransacao — sem duplicatas
