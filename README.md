# 💰 FinanMap - Front-End

> Aplicação web para gerenciamento de finanças pessoais - Descomplicando suas finanças

![Vue.js](https://img.shields.io/badge/Vue.js-3.4.18-green)
![Quasar](https://img.shields.io/badge/Quasar-2.16.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue)
![Pinia](https://img.shields.io/badge/Pinia-3.0.1-yellow)

---

## 📖 Sobre o Projeto

**FinanMap** é uma aplicação completa para controle financeiro pessoal que permite gerenciar:
- ✅ Rendimentos mensais
- ✅ Despesas categorizadas
- ✅ Investimentos
- ✅ Visualização de dados em dashboards interativos

---

## 🚀 Início Rápido

```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Build para produção
npm run build
```

---

## 🛠 Tecnologias Principais

| Tecnologia | Descrição |
|------------|-----------|
| **Vue 3** | Framework JavaScript progressivo |
| **Quasar** | Framework UI completo |
| **TypeScript** | Tipagem estática |
| **Pinia** | Gerenciamento de estado |
| **ApexCharts** | Gráficos interativos |
| **Axios** | Cliente HTTP |

---

## 📚 Documentação Completa

Para documentação detalhada sobre estrutura, componentes, padrões e funcionalidades, consulte:

### **[📖 DOCUMENTACAO.md](./DOCUMENTACAO.md)**

A documentação completa inclui:
- 📁 Estrutura detalhada do projeto
- 📄 Descrição de todas as páginas
- 🧩 Componentes e seus usos
- 🔌 Serviços e integração com API
- 📐 Padrões e convenções
- 🎓 Guias para desenvolvedores iniciantes
- 🤖 Informações para assistentes de código (IAs)

---

## 📂 Estrutura Resumida

```
src/
├── components/     # Componentes reutilizáveis
├── pages/         # Páginas da aplicação
├── layouts/       # Layouts (MainLayout)
├── router/        # Configuração de rotas
├── services/      # Serviços de API
├── stores/        # Gerenciamento de estado (Pinia)
├── Model/         # Modelos TypeScript
└── helpers/       # Funções auxiliares
```

---

## 🗺 Rotas Principais

| Rota | Descrição |
|------|-----------|
| `/login` | Autenticação |
| `/` | Gerenciamento mensal (Rendimentos/Despesas/Investimentos) |
| `/dashbord` | Dashboard com gráficos |

---

## 🎯 Funcionalidades

### Gerenciamento Financeiro
- Controle de rendimentos, despesas e investimentos
- Categorização de transações
- Seleção de período (mês/ano)
- Replicação de transações

### Visualização
- Dashboard com gráficos interativos
- Cards de valores totalizados
- Métricas e indicadores

### Autenticação
- Login seguro
- Registro de usuários
- Verificação em dois fatores

---

## 🐳 Docker

```bash
# Desenvolvimento com Docker
npm run dockerDev

# ou
docker-compose up --build
```

---

## 📜 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run lint` | Linter ESLint |
| `npm run format` | Formatador Prettier |
| `npm run dockerDev` | Docker Compose |

---

## ⚙️ Configuração

### API
A URL da API está configurada em `quasar.config.ts`:
```typescript
env: {
  URL_API: 'https://api.devmoreno.online/api/'
}
```

### Requisitos
- Node.js: 18, 20, 22, 24, 26 ou 28
- npm: >= 6.13.4 ou yarn: >= 1.21.1

---

## 📞 Contato

**Autor**: matheushennriquesoares35@gmail.com  
**Versão**: 0.0.1

---

## 📄 Licença

Projeto privado - Todos os direitos reservados

---

**Para informações detalhadas, consulte a [Documentação Completa](./docs/DOCUMENTACAO.md)**
