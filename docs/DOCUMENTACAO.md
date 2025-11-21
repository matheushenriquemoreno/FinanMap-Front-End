# 📚 Documentação FinanMap Front-End

> **FinanMap** é uma aplicação web para gerenciamento de finanças pessoais voltado a qualquer tipo de publico que queria realizar o gerenciamento de suas finanças, o sistema permite o controle de rendimentos, despesas e investimentos de forma mensal.

---

## 📋 Índice

1. [Visão Geral](#-visão-geral)
2. [Tecnologias Utilizadas](#-tecnologias-utilizadas)
3. [Estrutura do Projeto](#-estrutura-do-projeto)
4. [Páginas e Funcionalidades](#-páginas-e-funcionalidades)
5. [Componentes Principais](#-componentes-principais)
6. [Serviços e API](#-serviços-e-api)
7. [Gerenciamento de Estado](#-gerenciamento-de-estado)
17. [Modo Escuro/Claro](#-modo-escuroclaro)
8. [Padrões e Convenções](#-padrões-e-convenções)
9. [Como Iniciar](#-como-iniciar)
10. [Estrutura de Rotas](#-estrutura-de-rotas)

---

## 🎯 Visão Geral

O **FinanMap** é uma aplicação completa para gestão financeira pessoal que permite:
- ✅ Acompanhamento de rendimentos, despesas e investimentos mensais
- ✅ Controle de categorias para cada tipo
- ✅ Gerenciamento de investimentos
- ✅ Visualização de dados através de dashboards interativos
- ✅ Autenticação segura com verificação de código
- ✅ Suporte a Docker para deploy facilitado
- ✅ Modo escuro/claro com persistência de preferência

---

## 🛠 Tecnologias Utilizadas

### Framework e Bibliotecas Principais

| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| **Vue 3** | 3.4.18 | Framework JavaScript progressivo |
| **Quasar** | 2.16.0 | Framework UI baseado em Vue |
| **TypeScript** | 5.5.3 | Superset JavaScript com tipagem estática |
| **Pinia** | 3.0.1 | Gerenciamento de estado para Vue 3 |
| **Vue Router** | 4.0.12 | Sistema de roteamento oficial do Vue |
| **Axios** | 1.2.1 | Cliente HTTP para requisições à API |
| **ApexCharts** | 4.5.0 | Biblioteca de gráficos interativos |

### Ferramentas de Desenvolvimento

- **Quasar** - Framework UI baseado em Vue, que permite a criação de interfaces de usuário modernas e responsivas.
- **ESLint** - Linter para garantir qualidade do código
- **Prettier** - Formatador de código automático
- **Docker** - Containerização da aplicação
- **TypeScript Strict Mode** - Tipagem rigorosa habilitada

---

## 📁 Estrutura do Projeto

```
FinanMap-Front-End/
│
├── public/                    # Arquivos públicos estáticos
│   ├── favicon.ico
│   └── avatar.svg
│
├── src/                      # Código fonte da aplicação
│   ├── assets/              # Recursos estáticos (imagens, etc)
│   ├── boot/                # Arquivos de inicialização do Quasar
│   │   ├── axios.ts        # Configuração do Axios
│   │   └── apexchart.ts    # Configuração do ApexCharts
│   │
│   ├── components/          # Componentes reutilizáveis
│   │   ├── CampoSelect/    # Componentes de seleção
│   │   ├── Configuracoes/  # Componentes de configuração
│   │   ├── Dashbord/       # Componentes do dashboard
│   │   ├── Despesa/        # Componentes de despesas
│   │   ├── Inputs/         # Componentes de entrada de dados
│   │   ├── Transacao/      # Componentes de transações
│   │   ├── CardValores.vue
│   │   ├── MothYearSelector.vue
│   │   └── ValorPadraoBR.vue
│   │
│   ├── css/                 # Estilos globais
│   │   └── app.scss
│   │
│   ├── helpers/             # Funções auxiliares
│   │   ├── IconesGerenciamentoMensal.ts
│   │   ├── Loading.ts
│   │   └── Notificacao.ts
│   │
│   ├── layouts/             # Layouts da aplicação
│   │   └── MainLayout.vue  # Layout principal com menu
│   │
│   ├── Model/               # Modelos de dados TypeScript
│   │   ├── ApexChartsType.ts
│   │   ├── Categoria.ts
│   │   ├── CriarRegistro.ts
│   │   └── Transacao.ts
│   │
│   ├── pages/               # Páginas da aplicação
│   │   ├── Autenticacao/   # Páginas de autenticação
│   │   │   ├── LoginPage.vue
│   │   │   ├── CadastroPage.vue
│   │   │   └── ConfirmarCodigoLoginPage.vue
│   │   ├── Dashbord/       # Páginas de dashboard
│   │   │   └── dashbord-Gerenciamento-Mensal.vue
│   │   ├── GerenciamentoMensal/  # Páginas de gerenciamento
│   │   │   ├── GerenciamentoMensalPageIndex.vue
│   │   │   ├── RendimentoPage.vue
│   │   │   ├── DespesaPage.vue
│   │   │   └── InvestimentoPage.vue
│   │   └── ErrorNotFound.vue
│   │
│   ├── router/              # Configuração de rotas
│   │   ├── index.ts
│   │   └── routes.ts
│   │
│   ├── services/            # Serviços de comunicação com API
│   │   ├── api/
│   │   ├── base/
│   │   ├── transacao/
│   │   ├── AcumuladoMensalService.ts
│   │   ├── AuthService.ts
│   │   ├── CategoriaService.ts
│   │   ├── ObterSusgentaoCategorias.ts
│   │   └── ReplicarTranscoes.ts
│   │
│   ├── stores/              # Stores Pinia
│   │   ├── GerenciamentoMensal-store.ts
│   │   ├── UserEmail-Store.ts
│   │   └── index.ts
│   │
│   ├── App.vue             # Componente raiz
│   └── env.d.ts            # Declarações de tipos de ambiente
│
├── .dockerignore
├── .editorconfig
├── .eslintrc
├── .gitignore
├── .prettierrc.json
├── Docker-compose.yml
├── Dockerfile
├── package.json
├── quasar.config.ts       # Configuração principal do Quasar
├── tsconfig.json
└── README.md
```

---

## 📄 Páginas e Funcionalidades

### 🔐 Autenticação

#### 1. **LoginPage** (`/login`)
- **Função**: Página de login do usuário
- **Recursos**:
  - Formulário de email e senha
  - Integração com `AuthService`
  - Redirecionamento após autenticação

#### 2. **CadastroPage** (`/register`)
- **Função**: Registro de novos usuários
- **Recursos**:
  - Formulário de cadastro
  - Validação de dados
  - Criação de nova conta

#### 3. **ConfirmarCodigoLoginPage** (`/verify`)
- **Função**: Verificação de código de autenticação
- **Recursos**:
  - Input para código de verificação
  - Autenticação em dois fatores

---

### 💰 Gerenciamento Mensal

#### 4. **GerenciamentoMensalPageIndex** (`/`)
- **Função**: Página principal com navegação entre abas
- **Sub-rotas**:
  - **RendimentoPage** (padrão): Gerenciamento de recebimentos
  - **DespesaPage** (`/Despesas`): Gerenciamento de despesas
  - **InvestimentoPage** (`/Investimentos`): Gerenciamento de investimentos

#### 5. **RendimentoPage**
- **Função**: Controle de rendimentos mensais
- **Recursos**:
  - Listagem de rendimentos
  - Adicionar/editar/excluir rendimentos
  - Categorização de rendimentos
  - Seletor de mês/ano

#### 6. **DespesaPage**
- **Função**: Controle de despesas mensais
- **Recursos**:
  - Listagem de despesas
  - Adicionar/editar/excluir despesas
  - Categorização de despesas
  - Filtros e visualizações

#### 7. **InvestimentoPage**
- **Função**: Controle de investimentos
- **Recursos**:
  - Listagem de investimentos
  - Adicionar/editar/excluir investimentos
  - Acompanhamento de rendimentos

---

### 📊 Visualização de Dados

#### 8. **Dashbord** (`/dashbord`)
- **Função**: Painel de visualização de dados financeiros
- **Recursos**:
  - Gráficos interativos com ApexCharts
  - Visão consolidada de finanças
  - Comparativos mensais
  - Métricas e indicadores

---

### ❌ Erro

#### 9. **ErrorNotFound**
- **Função**: Página 404 para rotas não encontradas
- **Exibida**: Quando usuário acessa rota inválida

---

## 🧩 Componentes Principais

### Componentes de Entrada

#### **MothYearSelector.vue**
```typescript
// Seletor de mês e ano
// Usado em todas as páginas de gerenciamento mensal
// Permite navegação entre períodos
```

#### **Inputs/**
Componentes de entrada de dados reutilizáveis:
- Campos de texto
- Campos numéricos
- Campos de data
- Validações integradas

---

### Componentes de Exibição

#### **CardValores.vue**
```typescript
// Card para exibir valores formatados
// Usado para mostrar totais e resumos
// Suporta formatação em Real (R$)
```

#### **ValorPadraoBR.vue**
```typescript
// Componente para formatação de valores em Real brasileiro
// Formata números para padrão BR: R$ 1.234,56
```

---

### Componentes de Transação

#### **Transacao/**
Componentes específicos para gerenciamento de transações:
- Formulários de criação/edição
- Listagem de transações
- Cards de transação
- Modais de detalhes

---

### Componentes de Configuração

#### **Configuracoes/ModalConfiguracoes.vue**
```typescript
// Modal de configurações do sistema
// Acessível através do botão de settings no header
// Permite ajustes de preferências do usuário
```

---

### Componentes de Dashboard

#### **Dashbord/**
Componentes de visualização:
- Gráficos
- Métricas
- Cards informativos

---

### Componentes de Seleção

#### **CampoSelect/**
Componentes personalizados de seleção:
- Seleção de categorias
- Dropdowns customizados
- Autocomplete

---

## 🔌 Serviços e API

### Configuração Base

**URL da API**: `https://api.devmoreno.online/api/`

Todos os serviços utilizam Axios configurado em `src/boot/axios.ts`

---

### Serviços Disponíveis

#### **AuthService.ts**
```typescript
// Gerenciamento de autenticação
// - login(email, senha)
// - register(dados)
// - verifyCode(codigo)
// - logout()
```

#### **CategoriaService.ts**
```typescript
// Gerenciamento de categorias
// - listarCategorias()
// - criarCategoria(dados)
// - editarCategoria(id, dados)
// - excluirCategoria(id)
```

#### **AcumuladoMensalService.ts**
```typescript
// Dados acumulados mensais
// - obterAcumulado(mes, ano)
// - obterTotais()
```

#### **ReplicarTranscoes.ts**
```typescript
// Replicação de transações
// - replicarParaProximosMeses(transacaoId, meses)
```

#### **ObterSusgentaoCategorias.ts**
```typescript
// Sugestões de categorias
// - obterSugestoes(tipo)
```

#### **transacao/**
Serviços específicos para transações:
- Criar transação
- Editar transação
- Excluir transação
- Listar transações por período

---

## 🗄 Gerenciamento de Estado

### Pinia Stores

#### **GerenciamentoMensal-store.ts**
```typescript
// Store principal para gerenciamento mensal
// State:
// - mesAtual: number
// - anoAtual: number
// - transacoes: Transacao[]
// - categorias: Categoria[]
// 
// Actions:
// - setMesAno(mes, ano)
// - carregarTransacoes()
// - adicionarTransacao(transacao)
```

#### **UserEmail-Store.ts**
```typescript
// Store para dados do usuário
// State:
// - email: string
// - userName: string
// 
// Actions:
// - setUserData(email, name)
// - clearUserData()
```

#### **theme-store.ts**
```typescript
// Store para gerenciamento de tema (modo claro/escuro)
// State:
// - isDark: boolean
// 
// Getters:
// - currentTheme: 'dark' | 'light'
// 
// Actions:
// - initTheme() - Inicializa tema do localStorage ou preferência do sistema
// - toggleTheme() - Alterna entre modo claro e escuro
// - setTheme(isDark) - Define tema manualmente
```

---

## 📐 Padrões e Convenções

### Estrutura de Arquivos

1. **Organização por Funcionalidade**
   - Componentes agrupados por área (Transacao/, Dashbord/, etc)
   - Páginas separadas por módulo
   - Serviços organizados por domínio

2. **Nomenclatura**
   - **Componentes**: PascalCase (`CardValores.vue`)
   - **Páginas**: PascalCase com sufixo Page (`LoginPage.vue`)
   - **Serviços**: PascalCase com sufixo Service (`AuthService.ts`)
   - **Stores**: kebab-case com sufixo store (`GerenciamentoMensal-store.ts`)
   - **Helpers**: PascalCase (`Loading.ts`)

---

### Padrões de Código

#### **TypeScript Strict Mode**
```typescript
// Tipagem rigorosa habilitada
// Todos os arquivos devem ter tipos explícitos
// Evitar uso de 'any'
```

#### **Composition API**
```vue
<script setup lang="ts">
// Uso exclusivo da Composition API (Vue 3)
// Não usar Options API
</script>
```

#### **Quasar Components**
```vue
<template>
  <!-- Uso de componentes Quasar -->
  <q-btn />
  <q-input />
  <q-card />
</template>
```

---

### Padrões de Estilo

#### **SCSS/SASS**
```scss
// Estilos globais em src/css/app.scss
// Estilos scoped nos componentes
// Suporte a variáveis Sass
```

#### **Formatação**
- **Prettier** configurado para formatação automática
- **ESLint** com regras Vue e TypeScript
- **EditorConfig** para consistência entre editores

---

## 🚀 Como Iniciar

### Pré-requisitos

- **Node.js**: Versão 18, 20, 22, 24, 26 ou 28
- **npm**: Versão >= 6.13.4 ou **yarn**: >= 1.21.1

---

### Instalação

```bash
# 1. Clone o repositório
git clone <url-do-repositorio>
cd FinanMap-Front-End

# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:9000` (ou porta definida pelo Quasar)

---

### Scripts Disponíveis

| Script | Comando | Descrição |
|--------|---------|-----------|
| **Desenvolvimento** | `npm run dev` | Inicia servidor de desenvolvimento |
| **Build** | `npm run build` | Cria build de produção |
| **Lint** | `npm run lint` | Executa linter ESLint |
| **Format** | `npm run format` | Formata código com Prettier |
| **Docker Dev** | `npm run dockerDev` | Inicia com Docker Compose |

---

### Docker

```bash
# Desenvolvimento com Docker
npm run dockerDev

# ou diretamente
docker-compose up --build
```

---

## 🗺 Estrutura de Rotas

```typescript
/                           → MainLayout
├── /                       → GerenciamentoMensalPageIndex
│   ├── (default)          → RendimentoPage
│   ├── /Despesas          → DespesaPage
│   └── /Investimentos     → InvestimentoPage
└── /dashbord              → dashbord-Gerenciamento-Mensal

/login                      → LoginPage
/register                   → CadastroPage
/verify                     → ConfirmarCodigoLoginPage
/*                          → ErrorNotFound (404)
```

### Rotas Protegidas

As rotas dentro do `MainLayout` são protegidas e requerem autenticação.
Rotas de autenticação (`/login`, `/register`, `/verify`) são públicas.

---

## 🎨 Layout Principal

### MainLayout

O layout principal (`src/layouts/MainLayout.vue`) inclui:

#### **Header**
- Logo do FinanMap
- Botão de menu (mobile)
- Botão de configurações
- Botão de conta/perfil

#### **Drawer (Menu Lateral)**
- Avatar e nome do usuário
- Menu de navegação:
  - 📅 Mês a Mês
  - 📊 Dashboard
- Responsivo (breakpoint: 1100px)

#### **Conteúdo**
- Área principal com `<router-view />`
- Padding configurável
- Altura total da viewport

---

## 🔧 Configurações

### Quasar Config (`quasar.config.ts`)

#### **Framework**
- Linguagem: Português Brasil (`pt-BR`)
- Plugins: Notify, Dialog
- Ícones: Material Icons
- Fonte: Roboto

#### **Build**
- Target: ES2022, Firefox 115+, Chrome 115+, Safari 14+
- TypeScript Strict Mode ativado
- Vue Router Mode: Hash

#### **Variáveis de Ambiente**
```typescript
env: {
  URL_API: 'https://api.devmoreno.online/api/',
  lOGIN_URL: '/#/login'
}
```

---

## 📊 Modelos de Dados

### **Transacao.ts**
```typescript
interface Transacao {
  id: number;
  descricao: string;
  valor: number;
  data: string;
  categoriaId: number;
  tipo: 'RENDIMENTO' | 'DESPESA' | 'INVESTIMENTO';
}
```

### **Categoria.ts**
```typescript
interface Categoria {
  id: number;
  nome: string;
  icone: string;
  cor: string;
}
```

### **ApexChartsType.ts**
Tipos para configuração de gráficos ApexCharts

### **CriarRegistro.ts**
Types para formulários de criação de registros

---

## 🎯 Helpers e Utilitários

### **Loading.ts**
```typescript
// Controle de loading global
// showLoading()
// hideLoading()
```

### **Notificacao.ts**
```typescript
// Sistema de notificações
// notifySuccess(mensagem)
// notifyError(mensagem)
// notifyWarning(mensagem)
// notifyInfo(mensagem)
```

### **IconesGerenciamentoMensal.ts**
```typescript
// Mapeamento de ícones para categorias
// getIcone(categoria)
```

---

## 🎓 Para Desenvolvedores Iniciantes

### Entendendo o Fluxo

1. **Usuário acessa a aplicação** → Roteador verifica autenticação
2. **Se não autenticado** → Redireciona para `/login`
3. **Após login** → Token armazenado, redireciona para `/`
4. **MainLayout carrega** → Menu lateral + Header
5. **Página inicial** → GerenciamentoMensalPageIndex
6. **Usuário navega** → Router atualiza componente
7. **Dados carregados** → Via serviços que chamam API
8. **Estado gerenciado** → Pinia stores mantém dados

---

### Como Adicionar uma Nova Funcionalidade

#### 1. **Criar Modelo** (se necessário)
```typescript
// src/Model/NovoModelo.ts
export interface NovoModelo {
  id: number;
  nome: string;
}
```

#### 2. **Criar Serviço**
```typescript
// src/services/NovoService.ts
import { api } from 'boot/axios';

export async function buscarDados() {
  const response = await api.get('/endpoint');
  return response.data;
}
```

#### 3. **Criar Store** (se necessário)
```typescript
// src/stores/novo-store.ts
import { defineStore } from 'pinia';

export const useNovoStore = defineStore('novo', {
  state: () => ({
    dados: []
  }),
  actions: {
    async carregarDados() {
      this.dados = await buscarDados();
    }
  }
});
```

#### 4. **Criar Componente/Página**
```vue
<!-- src/components/NovoComponente.vue -->
<template>
  <q-card>
    <q-card-section>
      {{ dados }}
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { useNovoStore } from 'stores/novo-store';

const store = useNovoStore();
store.carregarDados();
</script>
```

#### 5. **Adicionar Rota**
```typescript
// src/router/routes.ts
{
  path: '/novo',
  component: () => import('pages/NovoPage.vue')
}
```

---

## 🤖 Para IAs (Assistentes de Código)

### Contexto do Projeto

- **Stack**: Vue 3 + Quasar + TypeScript + Pinia
- **Padrão**: Composition API com `<script setup>`
- **Estilo**: Componentes Quasar + SCSS scoped
- **API**: REST via Axios
- **Estado**: Pinia stores
- **Autenticação**: Token-based (localStorage)

### Convenções Importantes

1. Sempre usar TypeScript com tipagem explícita
2. Componentes usam Composition API
3. Serviços são funções assíncronas
4. Stores usam Pinia (não Vuex)
5. UI exclusivamente com componentes Quasar
6. Formatação automática via Prettier
7. Validação via ESLint

### Estrutura de Resposta Esperada

Ao gerar código:
- ✅ Incluir imports necessários
- ✅ Usar tipagem TypeScript
- ✅ Seguir padrão de nomenclatura
- ✅ Incluir comentários em português
- ✅ Usar componentes Quasar quando aplicável
- ✅ Quando necessário, criar o proprio Css moderno e responsivo, também seguindo as cores do projeto.

## 📝 Notas Finais

Esta documentação cobre os principais aspectos do projeto FinanMap Front-End. Para questões específicas:

- Consulte os comentários no código
- Verifique a documentação do Quasar: https://quasar.dev
- Documentação do Vue 3: https://vuejs.org
- Documentação do Pinia: https://pinia.vuejs.org

---

## 🌓 Modo Escuro/Claro

### Funcionalidade

O FinanMap possui suporte completo para modo escuro e claro, permitindo que os usuários escolham sua preferência de visualização.

### Como Usar

1. **Alternar Tema**: Clique no botão de sol/lua no header do MainLayout
2. **Persistência**: A preferência é salva automaticamente no localStorage
3. **Preferência do Sistema**: Se não houver preferência salva, o app usa a preferência do sistema operacional

### Implementação Técnica

#### **Quasar Dark Plugin**
Utiliza o plugin nativo do Quasar para gerenciamento de tema:
```typescript
import { Dark } from 'quasar';
Dark.set(true); // Ativa modo escuro
```

#### **CSS Variables**
Variáveis CSS customizadas para cores do tema:
```scss
:root {
  --bg-primary: #f7f7f7;
  --bg-card: #ffffff;
  --text-primary: #1a1a1a;
  // ...
}

body.body--dark {
  --bg-primary: #1a1a1a;
  --bg-card: #2d2d2d;
  --text-primary: #e0e0e0;
  // ...
}
```

#### **Pinia Store**
Gerenciamento de estado centralizado:
```typescript
import { useThemeStore } from 'src/stores/theme-store';

const themeStore = useThemeStore();
themeStore.toggleTheme(); // Alterna tema
```

### Cores do Tema

| Variável | Modo Claro | Modo Escuro |
|----------|------------|-------------|
| `--bg-primary` | #f7f7f7 | #1a1a1a |
| `--bg-secondary` | #ffffff | #2a2a2a |
| `--bg-card` | #ffffff | #2d2d2d |
| `--text-primary` | #1a1a1a | #e0e0e0 |
| `--text-secondary` | #646464 | #b0b0b0 |
| `--border-color` | #ddd | #404040 |

### Transições

Todas as mudanças de tema incluem transições suaves de 0.3s para melhor experiência do usuário.

---

**Última atualização**: 2025-11-20
