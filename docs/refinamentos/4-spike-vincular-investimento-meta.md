# 🔬 Spike — Vincular Investimento a Contribuição de Meta Financeira

> **Objetivo**: Permitir que um investimento realizado sirva como contribuição para uma meta financeira, cruzando os domínios `Investimento` (herda de `Transacao`) e `MetaFinanceira` (entidade independente) com o **mínimo de acoplamento**.

---

## 📖 Problema

Hoje os dois domínios são isolados:
- **Investimento** vive em `Domain/Investimento`, herda de `Transacao`, e é gerenciado pelo `InvestimentoService`.
- **MetaFinanceira** viverá em `Domain/MetaFinanceira`, com entidade própria e `Contribuicao` embedded.

O usuário quer poder dizer: *"Este investimento que fiz de R$ 500 no mês de Janeiro conta como contribuição para minha meta 'Reserva de Emergência'"*.

Além disso, o usuário deseja **vincular um investimento a uma meta já no momento do cadastro**, evitando a necessidade de dois cadastros separados.

---

## 🏗️ Solução: Referência Fraca na Contribuição

### Conceito

A contribuição ocorre **apenas no domínio da MetaFinanceira**. O `Investimento` não sofre nenhuma alteração na sua entidade. O vínculo é feito de **duas formas complementares**:

1. **Na tela de Metas** — Ao contribuir, o usuário pode selecionar um investimento existente
2. **Na tela de Investimentos** — Ao cadastrar um investimento, o usuário pode opcionalmente vincular a uma meta

```
┌──────────────────┐                   ┌──────────────────────┐
│   Investimento   │                   │   MetaFinanceira     │
│   (Transacao)    │  ── referência ── │   └─ Contribuicao    │
│                  │   fraca (ID)      │      ├─ Valor         │
│  Não muda nada   │                   │      ├─ Data          │
│  na entidade     │                   │      ├─ InvestimentoId?│
│                  │                   │      ├─ NomeInvestimento?│
│                  │                   │      └─ Origem         │
└──────────────────┘                   └──────────────────────┘
```

O campo `InvestimentoId` na `Contribuicao` é **opcional** e puramente informativo (soft reference). Ele existe apenas para rastreabilidade. O `NomeInvestimento` armazena o nome do investimento no momento da vinculação (snapshot), evitando consultas adicionais.

---

### Alterações Necessárias

#### Back-End

**1. Modificar `Contribuicao` (subdocumento)**

Adicionar campos opcionais:

```csharp
public class Contribuicao
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public decimal Valor { get; set; }
    public DateTime Data { get; set; }

    // Referência fraca ao investimento (o investimento não sabe disso)
    public string? InvestimentoId { get; set; }
    public string? NomeInvestimento { get; set; }
    public OrigemContribuicao Origem { get; set; } = OrigemContribuicao.Manual;
}

public enum OrigemContribuicao
{
    Manual = 0,          // Contribuição avulsa digitada pelo usuário
    Investimento = 1     // Veio de um investimento existente
}
```

**2. Modificar `ContribuicaoDTO`**

```csharp
public class ContribuicaoDTO
{
    public decimal Valor { get; set; }
    public DateTime Data { get; set; }
    public string? InvestimentoId { get; set; }
    public string? NomeInvestimento { get; set; }
}
```

**3. Ajustar `MetaFinanceira.AdicionarContribuicao()`**

```csharp
public NotificacaoMeta? AdicionarContribuicao(decimal valor, DateTime data, 
                                               string? investimentoId = null,
                                               string? nomeInvestimento = null)
{
    // ... validação existente ...

    var contribuicao = new Contribuicao(valor, data)
    {
        InvestimentoId = investimentoId,
        NomeInvestimento = nomeInvestimento,
        Origem = investimentoId != null 
            ? OrigemContribuicao.Investimento 
            : OrigemContribuicao.Manual
    };

    Contribuicoes.Add(contribuicao);

    // ... lógica de notificação existente ...
}
```

**4. Ajustar `ContribuicaoResultDTO`**

```csharp
public class ContribuicaoResultDTO
{
    public string Id { get; set; }
    public decimal Valor { get; set; }
    public DateTime Data { get; set; }
    public string? InvestimentoId { get; set; }
    public string? NomeInvestimento { get; set; }
    public string Origem { get; set; }  // "Manual" ou "Investimento"
}
```

**5. Ajustar `CreateInvestimentoDTO` — Vínculo no Cadastro**

O DTO `CreateInvestimentoDTO` (que herda de `CreateTransacaoDTO`) ganha um campo opcional para indicar a meta destino:

```csharp
public class CreateInvestimentoDTO : CreateTransacaoDTO
{
    public string? MetaFinanceiraId { get; set; }  // Opcional: vincular a uma meta ao cadastrar
}
```

**6. Ajustar `InvestimentoService.Adicionar()` — Orquestração no Service**

Após criar o investimento com sucesso, se `MetaFinanceiraId` estiver preenchido, o service chama o `IMetaFinanceiraService.AdicionarContribuicao()`:

```csharp
public async Task<Result<ResultInvestimentoDTO>> Adicionar(CreateInvestimentoDTO createDTO)
{
    // ... lógica existente de criação do investimento ...

    await _investimentoRepository.Add(investimento);

    // NOVO: Se houver meta vinculada, adicionar contribuição automaticamente
    if (!string.IsNullOrEmpty(createDTO.MetaFinanceiraId))
    {
        await _metaFinanceiraService.AdicionarContribuicao(
            createDTO.MetaFinanceiraId,
            new ContribuicaoDTO
            {
                Valor = investimento.Valor,
                Data = DateTime.Now,
                InvestimentoId = investimento.Id,
                NomeInvestimento = investimento.Descricao
            });
    }

    // ... retorno existente ...
}
```

> [!NOTE]
> Aqui o `InvestimentoService` recebe o `IMetaFinanceiraService` via injeção de dependência. Esse é o **único ponto de acoplamento** e é na **camada Application** (não no Domain). A entidade `Investimento` permanece sem conhecimento algum de `MetaFinanceira`.

---

#### Front-End

**1. Atualizar Models**

Em `MetaFinanceira.ts`:

```typescript
export enum OrigemContribuicao {
  Manual = 0,
  Investimento = 1,
}

export interface ContribuicaoDTO {
  valor: number;
  data: string;
  investimentoId?: string;
  nomeInvestimento?: string;
}

export interface ContribuicaoResult {
  id: string;
  valor: number;
  data: string;
  investimentoId?: string;
  nomeInvestimento?: string;
  origem: string;  // 'Manual' | 'Investimento'
}
```

Em `Transacao.ts` — Adicionar campo opcional no `InvestimentoCreate`:

```typescript
export interface InvestimentoCreate extends TransacaoCreate {
  metaFinanceiraId?: string;  // Opcional: vincular ao cadastrar
}
```

**2. Alterar `ModalContribuir.vue` (Tela de Metas)**

Adicionar toggle/checkbox **"Vincular a um investimento existente"**. Ao ativar:
- Lista investimentos do mês corrente via `InvestimentoService`
- Exibe `q-select` com investimentos (descrição + valor)
- Ao selecionar, preenche `valor` e `nomeInvestimento` automaticamente

```html
<q-toggle
  v-model="vincularInvestimento"
  label="Vincular a um investimento existente"
/>

<q-select
  v-if="vincularInvestimento"
  v-model="investimentoSelecionado"
  :options="investimentosDisponiveis"
  option-label="label"
  option-value="id"
  outlined rounded dense
  label="Selecionar investimento"
  @update:model-value="preencherValor"
/>
```

**3. Alterar Modal de Cadastro de Investimento (Tela Mês a Mês)**

No modal de criação de investimento, adicionar um `q-select` **opcional** para vincular a uma meta existente:

```html
<q-select
  v-model="metaVinculada"
  :options="metasDisponiveis"
  option-label="nome"
  option-value="id"
  outlined rounded dense
  label="Vincular a uma Meta (opcional)"
  clearable
  emit-value map-options
>
  <template v-slot:option="{ opt, itemProps }">
    <q-item v-bind="itemProps">
      <q-item-section avatar>
        <q-icon :name="getCategoriaIcon(opt.categoria)" />
      </q-item-section>
      <q-item-section>
        <q-item-label>{{ opt.nome }}</q-item-label>
        <q-item-label caption>
          R$ {{ formatarValor(opt.valorAtual) }} / R$ {{ formatarValor(opt.valorAlvo) }}
        </q-item-label>
      </q-item-section>
    </q-item>
  </template>
</q-select>
```

O `metaFinanceiraId` é enviado junto com o `InvestimentoCreate` no submit.

**4. Exibir origem no `MetaCard.vue`**

Na lista de contribuições, exibir ícone diferenciador:

```html
<q-icon
  v-if="contrib.origem === 'Investimento'"
  name="trending_up" color="green" size="14px"
>
  <q-tooltip>
    Vinculado ao investimento: {{ contrib.nomeInvestimento }}
  </q-tooltip>
</q-icon>
```

---

## 🔒 Regras de Integridade

| Cenário | Comportamento |
|:---|:---|
| Investimento é excluído | A contribuição **permanece** na meta (snapshot do valor + nome) |
| Investimento tem valor alterado | A contribuição **não** é atualizada (snapshot no momento da vinculação) |
| Mesmo investimento vinculado 2x | Front-end deve **bloquear** duplicatas verificando `investimentoId` |
| Contribuição vinculada é excluída | Nenhum impacto no investimento original |

> [!TIP]
> A filosofia é de **snapshot**: a contribuição captura o valor e nome do investimento no momento da vinculação. Se o investimento mudar depois, a contribuição não é afetada.

---

## 📊 Resumo de Impacto

| Aspecto | Resultado |
|:---|:---|
| Alteração na entidade `Investimento`? | ❌ Nenhuma |
| Alteração no `CreateInvestimentoDTO`? | ✅ +1 campo opcional (`MetaFinanceiraId?`) |
| Alteração no `InvestimentoService`? | ✅ Injeção do `IMetaFinanceiraService` + chamada condicional no `Adicionar()` |
| Alteração na `Contribuicao`? | ✅ +3 campos opcionais |
| Nova Collection MongoDB? | ❌ Nenhuma |
| Novo Endpoint? | ❌ Nenhum |
| Acoplamento entre domínios? | 🟡 Mínimo (apenas na camada Application via DI, não no Domain) |

---

## 🚀 Checklist de Implementação

> Estas tarefas devem ser executadas **após** o refinamento base de Metas Financeiras.

### Back-End
- [ ] Criar enum `OrigemContribuicao` em `Domain/MetaFinanceira/Entity/`
- [ ] Adicionar `InvestimentoId?`, `NomeInvestimento?` e `Origem` na entidade `Contribuicao`
- [ ] Adicionar `InvestimentoId?` e `NomeInvestimento?` no `ContribuicaoDTO`
- [ ] Adicionar `InvestimentoId?`, `NomeInvestimento?` e `Origem` no `ContribuicaoResultDTO`
- [ ] Ajustar assinatura de `MetaFinanceira.AdicionarContribuicao()` para receber `investimentoId?` e `nomeInvestimento?`
- [ ] Ajustar `MetaFinanceiraService.AdicionarContribuicao()` para repassar os campos
- [ ] Adicionar `MetaFinanceiraId?` no `CreateInvestimentoDTO`
- [ ] Injetar `IMetaFinanceiraService` no `InvestimentoService`
- [ ] Ajustar `InvestimentoService.Adicionar()` para chamar contribuição se `MetaFinanceiraId` preenchido

### Front-End
- [ ] Atualizar `MetaFinanceira.ts` com novos campos e enum `OrigemContribuicao`
- [ ] Atualizar `InvestimentoCreate` em `Transacao.ts` com `metaFinanceiraId?`
- [ ] Adicionar lógica de toggle + select em `ModalContribuir.vue`
- [ ] Adicionar `q-select` de meta opcional no modal de cadastro de investimento
- [ ] Buscar metas disponíveis via `MetaFinanceiraService` no modal de investimento
- [ ] Bloquear vinculação duplicada do mesmo investimento
- [ ] Exibir ícone diferenciador de origem + nome do investimento na UI
