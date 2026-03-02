# 📋 Refinamento — Metas e Objetivos Financeiros (Back-End)

> **Objetivo**: Criar e gerenciar metas financeiras pessoais, permitindo ao usuário definir objetivos com valor alvo, data limite e categoria, registrar contribuições, acompanhar o progresso e receber notificações motivacionais automáticas.

---

## 📖 Contexto e Solução Escolhida

Atualmente o FinanMap permite ao usuário ver o quanto gasta, ganha e investe mês a mês, mas **não existe forma de vincular essa sobra a um sonho ou objetivo** (ex: "Viagem para Europa", "Reserva de Emergência"). A feature de **Metas Financeiras** resolve isso criando uma entidade independente no domínio, com seu próprio ciclo de vida.

**Decisões Técnicas:**
- A `MetaFinanceira` é uma entidade **independente** de `Transacao`. Não herda de `Transacao` pois possui regras de negócio distintas (valor alvo, prazo, progresso).
- As **contribuições** são registradas como sub-entidades dentro da meta (`Contribuicao`), contendo valor e data.
- O progresso (percentual) é **calculado no servidor** e retornado nos DTOs de resultado.
- As **notificações de incentivo** são geradas pelo back-end ao registrar uma contribuição que cruze marcos (50%, 80%, 100%).

> [!IMPORTANT]
> **Vincular Investimento a Meta (Spike Aprovada)**: Foi realizada uma [spike dedicada](file:///d:/GitHubProjects/FinanMap-Front-End/docs/refinamentos/4-spike-vincular-investimento-meta.md) para cruzar os domínios `Investimento` ↔ `MetaFinanceira` com baixo acoplamento. A solução utiliza **referência fraca na Contribuição** (`InvestimentoId?`, `NomeInvestimento?`, `Origem`) e permite vincular um investimento a uma meta **tanto na tela de metas quanto no cadastro de investimento**. As alterações descritas na spike devem ser implementadas **após** a conclusão deste refinamento base.

---

## 🏗️ 1. Modelagem de Domínio

### 1.1 Nova Entidade `MetaFinanceira`

**Caminho:** `Domain/MetaFinanceira/Entity/MetaFinanceira.cs`

A entidade herda de `EntityBase` (como todas as entidades do sistema) e possui suas próprias regras de validação.

```csharp
using Domain.Validator;
using Domain.Exceptions;

namespace Domain.Entity;

public class MetaFinanceira : EntityBase
{
    public string Nome { get; private set; }
    public decimal ValorAlvo { get; private set; }
    public DateTime DataLimite { get; private set; }
    public CategoriaIconeMeta Categoria { get; private set; }
    public string UsuarioId { get; private set; }
    public DateTime DataCriacao { get; private set; }
    public List<Contribuicao> Contribuicoes { get; private set; } = new();

    // Campos calculados (não persistidos, preenchidos no Service/DTO)
    public decimal ValorAtual => Contribuicoes.Sum(c => c.Valor);
    public decimal PercentualProgresso => ValorAlvo > 0 ? Math.Min((ValorAtual / ValorAlvo) * 100, 100) : 0;
    public bool Concluida => ValorAtual >= ValorAlvo;

    protected MetaFinanceira() { }

    public MetaFinanceira(string nome, decimal valorAlvo, DateTime dataLimite, 
                          CategoriaIconeMeta categoria, Usuario usuario)
    {
        Nome = nome;
        ValorAlvo = valorAlvo;
        DataLimite = dataLimite;
        Categoria = categoria;
        UsuarioId = usuario.Id;
        DataCriacao = DateTime.Now;
        ValidarDados();
    }

    public void Atualizar(string nome, decimal valorAlvo, DateTime dataLimite, 
                          CategoriaIconeMeta categoria)
    {
        Nome = nome;
        ValorAlvo = valorAlvo;
        DataLimite = dataLimite;
        Categoria = categoria;
        ValidarDados();
    }

    public NotificacaoMeta? AdicionarContribuicao(decimal valor, DateTime data)
    {
        var validator = DomainValidator.Create();
        validator.Validar(() => valor <= 0, "O valor da contribuição deve ser positivo.");
        validator.LancarExceptionSePossuiErro();

        decimal percentualAntes = PercentualProgresso;

        Contribuicoes.Add(new Contribuicao(valor, data));

        decimal percentualDepois = PercentualProgresso;

        // Gerar notificação de marco, se aplicável
        return GerarNotificacaoMarco(percentualAntes, percentualDepois);
    }

    public void RemoverContribuicao(string contribuicaoId)
    {
        var contribuicao = Contribuicoes.FirstOrDefault(c => c.Id == contribuicaoId);
        if (contribuicao == null)
            throw new DomainValidatorException("Contribuição não encontrada.");
        Contribuicoes.Remove(contribuicao);
    }

    private NotificacaoMeta? GerarNotificacaoMarco(decimal percentualAntes, decimal percentualDepois)
    {
        if (percentualAntes < 100 && percentualDepois >= 100)
            return new NotificacaoMeta(TipoNotificacaoMeta.MetaAlcancada, Nome, ValorAlvo, ValorAtual);

        if (percentualAntes < 80 && percentualDepois >= 80)
            return new NotificacaoMeta(TipoNotificacaoMeta.QuaseLa, Nome, ValorAlvo, ValorAtual);

        if (percentualAntes < 50 && percentualDepois >= 50)
            return new NotificacaoMeta(TipoNotificacaoMeta.MetadeCaminho, Nome, ValorAlvo, ValorAtual);

        return null;
    }

    private void ValidarDados()
    {
        var validator = DomainValidator.Create();
        validator.Validar(() => string.IsNullOrWhiteSpace(Nome), "O nome da meta é obrigatório.");
        validator.Validar(() => ValorAlvo <= 0, "O valor alvo deve ser positivo.");
        validator.Validar(() => DataLimite < DateTime.Today, "A data limite não pode ser no passado.");
        validator.LancarExceptionSePossuiErro();
    }
}
```

### 1.2 Entidade Embarcada `Contribuicao`

**Caminho:** `Domain/MetaFinanceira/Entity/Contribuicao.cs`

Contribuição é um **subdocumento** dentro de `MetaFinanceira` (embedded document no MongoDB).

```csharp
namespace Domain.Entity;

public class Contribuicao
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public decimal Valor { get; set; }
    public DateTime Data { get; set; }

    protected Contribuicao() { }

    public Contribuicao(decimal valor, DateTime data)
    {
        Valor = valor;
        Data = data;
    }
}
```

### 1.3 Enum `CategoriaIconeMeta`

**Caminho:** `Domain/MetaFinanceira/Entity/CategoriaIconeMeta.cs`

Define as categorias de ícone da meta (conforme protótipo visual).

```csharp
namespace Domain.Entity;

public enum CategoriaIconeMeta
{
    Viagem = 0,
    Emergencia = 1,
    Educacao = 2,
    Veiculo = 3,
    Moradia = 4,
    Investimento = 5,
    Outro = 6
}
```

### 1.4 Value Object `NotificacaoMeta`

**Caminho:** `Domain/MetaFinanceira/Entity/NotificacaoMeta.cs`

Objeto de retorno temporário (não é persistido), usado para comunicar as notificações de incentivo ao front-end.

```csharp
namespace Domain.Entity;

public enum TipoNotificacaoMeta
{
    MetadeCaminho,   // 50%
    QuaseLa,         // 80%
    MetaAlcancada    // 100%
}

public class NotificacaoMeta
{
    public TipoNotificacaoMeta Tipo { get; set; }
    public string NomeMeta { get; set; }
    public decimal ValorAlvo { get; set; }
    public decimal ValorAtual { get; set; }
    public string Mensagem { get; set; }

    public NotificacaoMeta(TipoNotificacaoMeta tipo, string nomeMeta, decimal valorAlvo, decimal valorAtual)
    {
        Tipo = tipo;
        NomeMeta = nomeMeta;
        ValorAlvo = valorAlvo;
        ValorAtual = valorAtual;
        Mensagem = tipo switch
        {
            TipoNotificacaoMeta.MetadeCaminho => $"Metade do caminho! 💪 Você já juntou R$ {valorAtual:N2} para \"{nomeMeta}\".",
            TipoNotificacaoMeta.QuaseLa => $"Quase lá! 🔥 Faltam apenas R$ {(valorAlvo - valorAtual):N2} para \"{nomeMeta}\".",
            TipoNotificacaoMeta.MetaAlcancada => $"Parabéns! 🎉 Você atingiu a meta \"{nomeMeta}\"!",
            _ => string.Empty
        };
    }
}
```

---

## 🏗️ 2. Camada Application — DTOs

### 2.1 `CreateMetaFinanceiraDTO`

**Caminho:** `Application/MetaFinanceira/DTOs/CreateMetaFinanceiraDTO.cs`

```csharp
namespace Application.MetaFinanceira.DTOs;

public class CreateMetaFinanceiraDTO
{
    public string Nome { get; set; }
    public decimal ValorAlvo { get; set; }
    public DateTime DataLimite { get; set; }
    public int Categoria { get; set; } // CategoriaIconeMeta enum value
}
```

### 2.2 `UpdateMetaFinanceiraDTO`

**Caminho:** `Application/MetaFinanceira/DTOs/UpdateMetaFinanceiraDTO.cs`

```csharp
namespace Application.MetaFinanceira.DTOs;

public class UpdateMetaFinanceiraDTO
{
    public string Id { get; set; }
    public string Nome { get; set; }
    public decimal ValorAlvo { get; set; }
    public DateTime DataLimite { get; set; }
    public int Categoria { get; set; }
}
```

### 2.3 `ContribuicaoDTO`

**Caminho:** `Application/MetaFinanceira/DTOs/ContribuicaoDTO.cs`

```csharp
namespace Application.MetaFinanceira.DTOs;

public class ContribuicaoDTO
{
    public decimal Valor { get; set; }
    public DateTime Data { get; set; }
}
```

### 2.4 `ResultMetaFinanceiraDTO`

**Caminho:** `Application/MetaFinanceira/DTOs/ResultMetaFinanceiraDTO.cs`

```csharp
using Domain.Entity;

namespace Application.MetaFinanceira.DTOs;

public class ResultMetaFinanceiraDTO
{
    public string Id { get; set; }
    public string Nome { get; set; }
    public decimal ValorAlvo { get; set; }
    public DateTime DataLimite { get; set; }
    public CategoriaIconeMeta Categoria { get; set; }
    public decimal ValorAtual { get; set; }
    public decimal PercentualProgresso { get; set; }
    public bool Concluida { get; set; }
    public int DiasRestantes { get; set; }
    public decimal ValorFaltante { get; set; }
    public List<ContribuicaoResultDTO> Contribuicoes { get; set; } = new();
    public DateTime DataCriacao { get; set; }
}

public class ContribuicaoResultDTO
{
    public string Id { get; set; }
    public decimal Valor { get; set; }
    public DateTime Data { get; set; }
}
```

### 2.5 `ResumoMetasDTO`

**Caminho:** `Application/MetaFinanceira/DTOs/ResumoMetasDTO.cs`

DTO para o painel de resumo (3 cards no topo).

```csharp
namespace Application.MetaFinanceira.DTOs;

public class ResumoMetasDTO
{
    public decimal TotalMetas { get; set; }         // Soma de todos os ValorAlvo
    public decimal TotalInvestido { get; set; }      // Soma de todos os ValorAtual
    public decimal PercentualGeral { get; set; }     // TotalInvestido / TotalMetas * 100
    public int MetasConcluidas { get; set; }
    public int TotalDeMetasAtivas { get; set; }
}
```

---

## 🏗️ 3. Camada Application — Interface e Service

### 3.1 Interface `IMetaFinanceiraService`

**Caminho:** `Application/MetaFinanceira/Interface/IMetaFinanceiraService.cs`

```csharp
using Application.MetaFinanceira.DTOs;

namespace Application.MetaFinanceira.Interface;

public interface IMetaFinanceiraService
{
    Task<Result<ResultMetaFinanceiraDTO>> Adicionar(CreateMetaFinanceiraDTO dto);
    Task<Result<ResultMetaFinanceiraDTO>> Atualizar(UpdateMetaFinanceiraDTO dto);
    Task<Result> Excluir(string id);
    Task<Result<ResultMetaFinanceiraDTO>> ObterPeloID(string id);
    Task<List<ResultMetaFinanceiraDTO>> ObterTodas();
    Task<ResumoMetasDTO> ObterResumo();
    Task<Result<ResultContribuicaoDTO>> AdicionarContribuicao(string metaId, ContribuicaoDTO dto);
    Task<Result> RemoverContribuicao(string metaId, string contribuicaoId);
}

public class ResultContribuicaoDTO
{
    public ResultMetaFinanceiraDTO MetaAtualizada { get; set; }
    public NotificacaoMetaDTO? Notificacao { get; set; }
}

public class NotificacaoMetaDTO
{
    public string Tipo { get; set; }
    public string Mensagem { get; set; }
}
```

### 3.2 Service `MetaFinanceiraService`

**Caminho:** `Application/MetaFinanceira/Service/MetaFinanceiraService.cs`

Segue o **mesmo padrão** de `InvestimentoService`:
- Injeção de dependência via construtor
- Verificação de permissão em modo compartilhado (`_usuarioLogado`)
- Result Pattern para retornos
- Mapeamento manual de Entity → DTO

```csharp
using Application.MetaFinanceira.DTOs;
using Application.MetaFinanceira.Interface;
using Domain.Compartilhamento.Entity;
using Domain.Entity;
using Domain.Login.Interfaces;
using Domain.MetaFinanceira.Repository;

namespace Application.MetaFinanceira.Service;

public class MetaFinanceiraService : IMetaFinanceiraService
{
    private readonly IMetaFinanceiraRepository _repository;
    private readonly IUsuarioLogado _usuarioLogado;

    public MetaFinanceiraService(
        IMetaFinanceiraRepository repository,
        IUsuarioLogado usuarioLogado)
    {
        _repository = repository;
        _usuarioLogado = usuarioLogado;
    }

    public async Task<Result<ResultMetaFinanceiraDTO>> Adicionar(CreateMetaFinanceiraDTO dto)
    {
        if (_usuarioLogado.EmModoCompartilhado && _usuarioLogado.PermissaoAtual != NivelPermissao.Editar)
            return Result.Failure<ResultMetaFinanceiraDTO>(
                Error.Forbidden("Você não tem permissão para editar os dados deste usuário."));

        var categoria = (CategoriaIconeMeta)dto.Categoria;

        var meta = new MetaFinanceira(
            dto.Nome, dto.ValorAlvo, dto.DataLimite,
            categoria, _usuarioLogado.UsuarioContextoDados);

        await _repository.Add(meta);

        return Result.Success(MapearParaDTO(meta));
    }

    public async Task<Result<ResultMetaFinanceiraDTO>> Atualizar(UpdateMetaFinanceiraDTO dto)
    {
        if (_usuarioLogado.EmModoCompartilhado && _usuarioLogado.PermissaoAtual != NivelPermissao.Editar)
            return Result.Failure<ResultMetaFinanceiraDTO>(
                Error.Forbidden("Você não tem permissão para editar os dados deste usuário."));

        var meta = await _repository.GetById(dto.Id);
        if (meta == null)
            return Result.Failure<ResultMetaFinanceiraDTO>(Error.NotFound("Meta financeira não encontrada."));

        var categoria = (CategoriaIconeMeta)dto.Categoria;
        meta.Atualizar(dto.Nome, dto.ValorAlvo, dto.DataLimite, categoria);

        await _repository.Update(meta);

        return Result.Success(MapearParaDTO(meta));
    }

    public async Task<Result> Excluir(string id)
    {
        if (_usuarioLogado.EmModoCompartilhado && _usuarioLogado.PermissaoAtual != NivelPermissao.Editar)
            return Result.Failure(Error.Forbidden("Você não tem permissão para editar os dados deste usuário."));

        var meta = await _repository.GetById(id);
        if (meta == null)
            return Result.Failure(Error.NotFound("Meta financeira não encontrada."));

        await _repository.Delete(meta);
        return Result.Success();
    }

    public async Task<Result<ResultMetaFinanceiraDTO>> ObterPeloID(string id)
    {
        var meta = await _repository.GetById(id);
        if (meta == null)
            return Result.Failure<ResultMetaFinanceiraDTO>(Error.NotFound("Meta financeira não encontrada."));

        return Result.Success(MapearParaDTO(meta));
    }

    public async Task<List<ResultMetaFinanceiraDTO>> ObterTodas()
    {
        var metas = await _repository.ObterPorUsuario(_usuarioLogado.IdContextoDados);
        return metas.Select(MapearParaDTO).ToList();
    }

    public async Task<ResumoMetasDTO> ObterResumo()
    {
        var metas = await _repository.ObterPorUsuario(_usuarioLogado.IdContextoDados);

        return new ResumoMetasDTO
        {
            TotalMetas = metas.Sum(m => m.ValorAlvo),
            TotalInvestido = metas.Sum(m => m.ValorAtual),
            PercentualGeral = metas.Sum(m => m.ValorAlvo) > 0
                ? (metas.Sum(m => m.ValorAtual) / metas.Sum(m => m.ValorAlvo)) * 100
                : 0,
            MetasConcluidas = metas.Count(m => m.Concluida),
            TotalDeMetasAtivas = metas.Count
        };
    }

    public async Task<Result<ResultContribuicaoDTO>> AdicionarContribuicao(string metaId, ContribuicaoDTO dto)
    {
        if (_usuarioLogado.EmModoCompartilhado && _usuarioLogado.PermissaoAtual != NivelPermissao.Editar)
            return Result.Failure<ResultContribuicaoDTO>(
                Error.Forbidden("Você não tem permissão para editar os dados deste usuário."));

        var meta = await _repository.GetById(metaId);
        if (meta == null)
            return Result.Failure<ResultContribuicaoDTO>(Error.NotFound("Meta financeira não encontrada."));

        var notificacao = meta.AdicionarContribuicao(dto.Valor, dto.Data);

        await _repository.Update(meta);

        var resultado = new ResultContribuicaoDTO
        {
            MetaAtualizada = MapearParaDTO(meta),
            Notificacao = notificacao != null ? new NotificacaoMetaDTO
            {
                Tipo = notificacao.Tipo.ToString(),
                Mensagem = notificacao.Mensagem
            } : null
        };

        return Result.Success(resultado);
    }

    public async Task<Result> RemoverContribuicao(string metaId, string contribuicaoId)
    {
        if (_usuarioLogado.EmModoCompartilhado && _usuarioLogado.PermissaoAtual != NivelPermissao.Editar)
            return Result.Failure(Error.Forbidden("Você não tem permissão para editar os dados deste usuário."));

        var meta = await _repository.GetById(metaId);
        if (meta == null)
            return Result.Failure(Error.NotFound("Meta financeira não encontrada."));

        meta.RemoverContribuicao(contribuicaoId);
        await _repository.Update(meta);

        return Result.Success();
    }

    private ResultMetaFinanceiraDTO MapearParaDTO(MetaFinanceira meta)
    {
        return new ResultMetaFinanceiraDTO
        {
            Id = meta.Id,
            Nome = meta.Nome,
            ValorAlvo = meta.ValorAlvo,
            DataLimite = meta.DataLimite,
            Categoria = meta.Categoria,
            ValorAtual = meta.ValorAtual,
            PercentualProgresso = Math.Round(meta.PercentualProgresso, 1),
            Concluida = meta.Concluida,
            DiasRestantes = Math.Max(0, (meta.DataLimite - DateTime.Today).Days),
            ValorFaltante = Math.Max(0, meta.ValorAlvo - meta.ValorAtual),
            Contribuicoes = meta.Contribuicoes
                .OrderByDescending(c => c.Data)
                .Select(c => new ContribuicaoResultDTO
                {
                    Id = c.Id,
                    Valor = c.Valor,
                    Data = c.Data
                }).ToList(),
            DataCriacao = meta.DataCriacao
        };
    }
}
```

---

## 🏗️ 4. Camada Infra — Repository

### 4.1 Interface `IMetaFinanceiraRepository`

**Caminho:** `Domain/MetaFinanceira/Repository/IMetaFinanceiraRepository.cs`

```csharp
using Domain.Entity;
using SharedDomain.IRepository;

namespace Domain.MetaFinanceira.Repository;

public interface IMetaFinanceiraRepository : IRepositoryBase<MetaFinanceira>
{
    Task<List<MetaFinanceira>> ObterPorUsuario(string usuarioId);
}
```

### 4.2 Mapping `MetaFinanceiraMapping`

**Caminho:** `Infra.data/Mongo/Mappings/MetaFinanceiraMapping.cs`

Registrar o BsonClassMap para `MetaFinanceira` e `Contribuicao`.

```csharp
using Domain.Entity;
using MongoDB.Bson.Serialization;

namespace Infra.Data.Mongo.Mappings;

public class MetaFinanceiraMapping
{
    public static void Configure()
    {
        BsonClassMap.RegisterClassMap<MetaFinanceira>(cm =>
        {
            cm.AutoMap();
            cm.SetIgnoreExtraElements(true);
            cm.MapMember(c => c.Nome);
            cm.MapMember(c => c.ValorAlvo);
            cm.MapMember(c => c.DataLimite);
            cm.MapMember(c => c.Categoria);
            cm.MapMember(c => c.UsuarioId);
            cm.MapMember(c => c.DataCriacao);
            cm.MapMember(c => c.Contribuicoes);
        });

        BsonClassMap.RegisterClassMap<Contribuicao>(cm =>
        {
            cm.AutoMap();
            cm.MapMember(c => c.Id);
            cm.MapMember(c => c.Valor);
            cm.MapMember(c => c.Data);
        });
    }
}
```

### 4.3 Repository `MetaFinanceiraRepository`

**Caminho:** `Infra.data/Mongo/Repositorys/MetaFinanceiraRepository.cs`

Segue o mesmo padrão dos repositórios existentes. **Não** herda de `RepositoryTransacaoBase` pois `MetaFinanceira` não é `Transacao`.

```csharp
using Domain.Entity;
using Domain.MetaFinanceira.Repository;
using MongoDB.Driver;

namespace Infra.Data.Mongo.Repositorys;

public class MetaFinanceiraRepository : IMetaFinanceiraRepository
{
    private readonly IMongoCollection<MetaFinanceira> _collection;

    public MetaFinanceiraRepository(IMongoClient mongoClient)
    {
        var database = mongoClient.GetDatabase("FinanMap");
        _collection = database.GetCollection<MetaFinanceira>("MetaFinanceira");
    }

    public async Task Add(MetaFinanceira entity)
    {
        await _collection.InsertOneAsync(entity);
    }

    public async Task Update(MetaFinanceira entity)
    {
        await _collection.ReplaceOneAsync(
            Builders<MetaFinanceira>.Filter.Eq(m => m.Id, entity.Id),
            entity);
    }

    public async Task Delete(MetaFinanceira entity)
    {
        await _collection.DeleteOneAsync(
            Builders<MetaFinanceira>.Filter.Eq(m => m.Id, entity.Id));
    }

    public async Task<MetaFinanceira?> GetById(string id)
    {
        return await _collection
            .Find(Builders<MetaFinanceira>.Filter.Eq(m => m.Id, id))
            .FirstOrDefaultAsync();
    }

    public async Task<List<MetaFinanceira>> ObterPorUsuario(string usuarioId)
    {
        return await _collection
            .Find(Builders<MetaFinanceira>.Filter.Eq(m => m.UsuarioId, usuarioId))
            .ToListAsync();
    }
}
```

---

## 🏗️ 5. Camada WebApi — Controller

### 5.1 Endpoints `MetaFinanceira`

**Caminho:** `WebApi/Controllers/MetaFinanceira.cs`

Segue o padrão de Minimal API (ex: `Investimento.cs`):

```csharp
using Application.MetaFinanceira.DTOs;
using Application.MetaFinanceira.Interface;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.Controllers;

public static class MetaFinanceira
{
    public static RouteGroupBuilder MapMetaFinanceiraEndpoints(this IEndpointRouteBuilder builder)
    {
        var group = builder.MapGroup("/api/MetasFinanceiras");

        // GET /api/MetasFinanceiras — Listar todas as metas do usuário
        group.MapGet("/", async (IMetaFinanceiraService service) =>
        {
            var result = await service.ObterTodas();
            return Results.Ok(result);
        });

        // GET /api/MetasFinanceiras/resumo — Painel de resumo (3 cards)
        group.MapGet("/resumo", async (IMetaFinanceiraService service) =>
        {
            var result = await service.ObterResumo();
            return Results.Ok(result);
        });

        // GET /api/MetasFinanceiras/{id} — Obter meta por ID
        group.MapGet("/{id:length(24)}", async (string id, IMetaFinanceiraService service) =>
        {
            var result = await service.ObterPeloID(id);
            return result.MapResult();
        });

        // POST /api/MetasFinanceiras — Criar meta
        group.MapPost("/", async (CreateMetaFinanceiraDTO dto, IMetaFinanceiraService service) =>
        {
            var result = await service.Adicionar(dto);
            return result.MapResultCreated();
        });

        // PUT /api/MetasFinanceiras — Atualizar meta
        group.MapPut("/", async (UpdateMetaFinanceiraDTO dto, IMetaFinanceiraService service) =>
        {
            var result = await service.Atualizar(dto);
            return result.MapResult();
        });

        // DELETE /api/MetasFinanceiras/{id} — Excluir meta
        group.MapDelete("/{id:length(24)}", async (string id, IMetaFinanceiraService service) =>
        {
            var result = await service.Excluir(id);
            return result.MapResult();
        });

        // POST /api/MetasFinanceiras/{id}/contribuicoes — Adicionar contribuição
        group.MapPost("/{id:length(24)}/contribuicoes", async (
            string id,
            ContribuicaoDTO dto,
            IMetaFinanceiraService service) =>
        {
            var result = await service.AdicionarContribuicao(id, dto);
            return result.MapResultCreated();
        });

        // DELETE /api/MetasFinanceiras/{metaId}/contribuicoes/{contribId}
        group.MapDelete("/{metaId:length(24)}/contribuicoes/{contribId}", async (
            string metaId,
            string contribId,
            IMetaFinanceiraService service) =>
        {
            var result = await service.RemoverContribuicao(metaId, contribId);
            return result.MapResult();
        });

        return group;
    }
}
```

### 5.2 Registro no `Program.cs`

Adicionar ao `Program.cs` (junto das demais rotas e DI):

```csharp
// DI  
builder.Services.AddScoped<IMetaFinanceiraRepository, MetaFinanceiraRepository>();
builder.Services.AddScoped<IMetaFinanceiraService, MetaFinanceiraService>();

// Endpoints
app.MapMetaFinanceiraEndpoints().RequireAuthorization();
```

### 5.3 Registro do Mapping

No `Configure` de BsonMappings (onde os demais mappings são registrados):

```csharp
MetaFinanceiraMapping.Configure();
```

---

## 📊 6. Resumo dos Endpoints da API

| Método | Rota | Descrição |
|:---|:---|:---|
| `GET` | `/api/MetasFinanceiras` | Listar todas as metas do usuário |
| `GET` | `/api/MetasFinanceiras/resumo` | Painel de resumo (total metas, investido, concluídas) |
| `GET` | `/api/MetasFinanceiras/{id}` | Obter meta específica |
| `POST` | `/api/MetasFinanceiras` | Criar nova meta |
| `PUT` | `/api/MetasFinanceiras` | Atualizar meta |
| `DELETE` | `/api/MetasFinanceiras/{id}` | Excluir meta |
| `POST` | `/api/MetasFinanceiras/{id}/contribuicoes` | Adicionar contribuição |
| `DELETE` | `/api/MetasFinanceiras/{metaId}/contribuicoes/{contribId}` | Remover contribuição |

---

## 🚀 Checklist de Execução — Back-End

### Fase 1 — Domínio (Entity)

- [ ] **1.1** Criar `Domain/MetaFinanceira/Entity/CategoriaIconeMeta.cs` (enum)
- [ ] **1.2** Criar `Domain/MetaFinanceira/Entity/Contribuicao.cs` (subdocumento)
- [ ] **1.3** Criar `Domain/MetaFinanceira/Entity/NotificacaoMeta.cs` (value object + enum `TipoNotificacaoMeta`)
- [ ] **1.4** Criar `Domain/MetaFinanceira/Entity/MetaFinanceira.cs` (entidade principal)
- [ ] **1.5** Criar `Domain/MetaFinanceira/Repository/IMetaFinanceiraRepository.cs` (interface)

### Fase 2 — Application (DTOs + Service)

- [ ] **2.1** Criar `Application/MetaFinanceira/DTOs/CreateMetaFinanceiraDTO.cs`
- [ ] **2.2** Criar `Application/MetaFinanceira/DTOs/UpdateMetaFinanceiraDTO.cs`
- [ ] **2.3** Criar `Application/MetaFinanceira/DTOs/ContribuicaoDTO.cs`
- [ ] **2.4** Criar `Application/MetaFinanceira/DTOs/ResultMetaFinanceiraDTO.cs` (+ `ContribuicaoResultDTO`)
- [ ] **2.5** Criar `Application/MetaFinanceira/DTOs/ResumoMetasDTO.cs`
- [ ] **2.6** Criar `Application/MetaFinanceira/Interface/IMetaFinanceiraService.cs` (+ `ResultContribuicaoDTO`, `NotificacaoMetaDTO`)
- [ ] **2.7** Criar `Application/MetaFinanceira/Service/MetaFinanceiraService.cs`

### Fase 3 — Infra (Repository + Mapping)

- [ ] **3.1** Criar `Infra.data/Mongo/Mappings/MetaFinanceiraMapping.cs`
- [ ] **3.2** Registrar o mapping no ponto de configuração existente
- [ ] **3.3** Criar `Infra.data/Mongo/Repositorys/MetaFinanceiraRepository.cs`

### Fase 4 — WebApi (Controller + DI)

- [ ] **4.1** Criar `WebApi/Controllers/MetaFinanceira.cs` com todos os endpoints
- [ ] **4.2** Registrar DI e mapear endpoints no `Program.cs`
- [ ] **4.3** Testar endpoints via Postman/Swagger
