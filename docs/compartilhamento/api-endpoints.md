# API Endpoints - Compartilhamento

## 📡 Base URL

```
http://localhost:5000/api
```

## 🔐 Autenticação

Todos os endpoints requerem autenticação via JWT:

```http
Authorization: Bearer {jwt-token}
```

## 📋 Endpoints

### 1. Criar Compartilhamento (Enviar Convite)

**Endpoint**: `POST /compartilhamento`

**Descrição**: Proprietário envia convite para compartilhar dados

**Headers**:
```http
Authorization: Bearer {jwt-token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "convidadoEmail": "usuario@example.com",
  "permissao": 0
}
```

**Response**: `200 OK`
```json
{
  "id": "abc123",
  "proprietarioId": "user-1",
  "proprietarioEmail": "proprietario@example.com",
  "proprietarioNome": "João Silva",
  "convidadoId": "user-2",
  "convidadoEmail": "usuario@example.com",
  "permissao": 0,
  "status": 0,
  "dataCriacao": "2026-02-17T19:00:00Z"
}
```

**Erros**:
- `404 Not Found`: Email não encontrado
- `422 Unprocessable Entity`: Compartilhamento já existe
- `401 Unauthorized`: Token inválido

---

### 2. Responder Convite

**Endpoint**: `PUT /compartilhamento/responder`

**Descrição**: Convidado aceita ou recusa convite

**Headers**:
```http
Authorization: Bearer {jwt-token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "compartilhamentoId": "abc123",
  "aceitar": true
}
```

**Response**: `200 OK` (sem body)

**Erros**:
- `404 Not Found`: Compartilhamento não encontrado
- `403 Forbidden`: Usuário não é o convidado
- `422 Unprocessable Entity`: Convite já foi respondido

---

### 3. Atualizar Permissão

**Endpoint**: `PUT /compartilhamento/permissao`

**Descrição**: Proprietário altera permissão de compartilhamento aceito

**Headers**:
```http
Authorization: Bearer {jwt-token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "compartilhamentoId": "abc123",
  "permissao": 1
}
```

**Response**: `200 OK` (sem body)

**Erros**:
- `404 Not Found`: Compartilhamento não encontrado
- `403 Forbidden`: Usuário não é o proprietário
- `422 Unprocessable Entity`: Compartilhamento não está aceito

---

### 4. Excluir Compartilhamento

**Endpoint**: `DELETE /compartilhamento/{id}`

**Descrição**: Proprietário revoga ou convidado sai do compartilhamento

**Headers**:
```http
Authorization: Bearer {jwt-token}
```

**URL Parameters**:
- `id`: ID do compartilhamento

**Response**: `200 OK` (sem body)

**Erros**:
- `404 Not Found`: Compartilhamento não encontrado
- `403 Forbidden`: Usuário não é proprietário nem convidado

---

### 5. Listar Meus Compartilhamentos

**Endpoint**: `GET /compartilhamento/meus`

**Descrição**: Lista compartilhamentos criados pelo usuário (como proprietário)

**Headers**:
```http
Authorization: Bearer {jwt-token}
```

**Response**: `200 OK`
```json
[
  {
    "id": "abc123",
    "proprietarioId": "user-1",
    "proprietarioEmail": "proprietario@example.com",
    "proprietarioNome": "João Silva",
    "convidadoId": "user-2",
    "convidadoEmail": "usuario@example.com",
    "permissao": 0,
    "status": 1,
    "dataCriacao": "2026-02-17T19:00:00Z",
    "dataAtualizacao": "2026-02-17T19:30:00Z"
  }
]
```

---

### 6. Listar Convites Recebidos

**Endpoint**: `GET /compartilhamento/recebidos`

**Descrição**: Lista compartilhamentos recebidos pelo usuário (como convidado)

**Headers**:
```http
Authorization: Bearer {jwt-token}
```

**Response**: `200 OK`
```json
[
  {
    "id": "def456",
    "proprietarioId": "user-3",
    "proprietarioEmail": "outro@example.com",
    "proprietarioNome": "Maria Santos",
    "convidadoId": "user-1",
    "convidadoEmail": "proprietario@example.com",
    "permissao": 1,
    "status": 0,
    "dataCriacao": "2026-02-17T20:00:00Z"
  }
]
```

---

## 🔄 Contexto Compartilhado

### Header Especial

Para acessar dados compartilhados, adicione o header:

```http
X-Proprietario-Id: {id-do-proprietario}
```

**Exemplo**:
```http
GET /api/rendimento/mes/2/2026 HTTP/1.1
Authorization: Bearer {jwt-token}
X-Proprietario-Id: user-1
```

**Comportamento**:
- Backend valida se existe compartilhamento aceito
- Se válido, retorna dados do proprietário
- Se inválido, retorna `403 Forbidden`

---

## 📊 Códigos de Status HTTP

| Código | Significado | Quando Ocorre |
|--------|-------------|---------------|
| `200 OK` | Sucesso | Operação bem-sucedida |
| `401 Unauthorized` | Não autenticado | Token JWT inválido ou ausente |
| `403 Forbidden` | Sem permissão | Tentativa de ação não autorizada |
| `404 Not Found` | Não encontrado | Recurso não existe |
| `422 Unprocessable Entity` | Validação falhou | Dados inválidos ou regra de negócio violada |
| `500 Internal Server Error` | Erro do servidor | Erro inesperado no backend |

---

## 🔍 Exemplos de Uso

### Exemplo 1: Fluxo Completo de Convite

```bash
# 1. Proprietário envia convite
curl -X POST http://localhost:5000/api/compartilhamento \
  -H "Authorization: Bearer {token-proprietario}" \
  -H "Content-Type: application/json" \
  -d '{
    "convidadoEmail": "convidado@example.com",
    "permissao": 0
  }'

# 2. Convidado lista convites recebidos
curl -X GET http://localhost:5000/api/compartilhamento/recebidos \
  -H "Authorization: Bearer {token-convidado}"

# 3. Convidado aceita convite
curl -X PUT http://localhost:5000/api/compartilhamento/responder \
  -H "Authorization: Bearer {token-convidado}" \
  -H "Content-Type: application/json" \
  -d '{
    "compartilhamentoId": "abc123",
    "aceitar": true
  }'

# 4. Convidado acessa dados compartilhados
curl -X GET http://localhost:5000/api/rendimento/mes/2/2026 \
  -H "Authorization: Bearer {token-convidado}" \
  -H "X-Proprietario-Id: user-proprietario"
```

### Exemplo 2: Gerenciamento de Permissões

```bash
# 1. Proprietário altera permissão para Editar
curl -X PUT http://localhost:5000/api/compartilhamento/permissao \
  -H "Authorization: Bearer {token-proprietario}" \
  -H "Content-Type: application/json" \
  -d '{
    "compartilhamentoId": "abc123",
    "permissao": 1
  }'

# 2. Proprietário revoga acesso
curl -X DELETE http://localhost:5000/api/compartilhamento/abc123 \
  -H "Authorization: Bearer {token-proprietario}"
```

---

## 📝 DTOs (Data Transfer Objects)

### CriarCompartilhamentoDTO

```csharp
public class CriarCompartilhamentoDTO
{
    public string ConvidadoEmail { get; set; }
    public NivelPermissao Permissao { get; set; }
}
```

### ResponderConviteDTO

```csharp
public class ResponderConviteDTO
{
    public string CompartilhamentoId { get; set; }
    public bool Aceitar { get; set; }
}
```

### AtualizarPermissaoDTO

```csharp
public class AtualizarPermissaoDTO
{
    public string CompartilhamentoId { get; set; }
    public NivelPermissao Permissao { get; set; }
}
```

### ResultCompartilhamentoDTO

```csharp
public class ResultCompartilhamentoDTO
{
    public string Id { get; set; }
    public string ProprietarioId { get; set; }
    public string ProprietarioEmail { get; set; }
    public string ProprietarioNome { get; set; }
    public string ConvidadoId { get; set; }
    public string ConvidadoEmail { get; set; }
    public NivelPermissao Permissao { get; set; }
    public StatusConvite Status { get; set; }
    public DateTime DataCriacao { get; set; }
    public DateTime? DataAtualizacao { get; set; }
}
```

---

## 🔗 Relacionados

- [01-enviar-convite.md](./01-enviar-convite.md) - Fluxo de envio de convite
- [02-responder-convite.md](./02-responder-convite.md) - Fluxo de resposta
- [05-gerenciar-compartilhamentos.md](./05-gerenciar-compartilhamentos.md) - Gerenciamento
- [arquitetura.md](./arquitetura.md) - Arquitetura geral
