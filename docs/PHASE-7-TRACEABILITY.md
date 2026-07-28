# Fase 7 — prontidão de homologação do frontend

Este documento registra a evidência local dos itens `MCPF-P7-02` e `MCPF-P7-04` a
`MCPF-P7-08`. Ele não afirma publicação externa: neste ambiente não há acesso ao
registry, DNS, HTTPS de homologação ou monitoramento compartilhado.

## Artefatos e configuração

- `Dockerfile.homolog` é um build multi-stage, usa `npm ci`, versões base fixadas
  e recebe `URL_API`, `LOGIN_URL` e flags somente por build args.
- `docker-compose.homolog.yml` exige `HOMOLOG_URL_API` (`:?`), não contém URL de
  produção e não altera `Dockerfile`/`Docker-compose.yml` usados pelo fluxo atual.
- `deploy/nginx.conf` aplica CSP, `nosniff`, `frame-ancestors`, política de
  referência e cache imutável apenas para assets versionados; `index.html` é
  `no-store` para permitir troca segura de flags.
- `quasar.config.ts` não possui mais endpoint de produção hardcoded. Para um
  build local: `HOMOLOG_URL_API=https://... npm run build` (PowerShell: `$env:HOMOLOG_URL_API='https://...'; npm run test:phase7`).

## Smoke representado

`npm run test:phase7` verifica os artefatos e carrega
`scripts/mcp-phase7-journeys.mjs`, que representa as dez jornadas do PRD:
consultas de saldo/transações, análise, CRUD de categoria/meta, exclusões,
importação de até 1.000 itens e revogação. O arquivo é um catálogo/harness local;
as chamadas ponta a ponta ainda precisam de backend e cliente MCP disponíveis.

## Gates e limite de evidência

Antes de qualquer piloto, executar no mesmo SHA: `npm ci`, `npm run test`,
`npm run lint`, `npx vue-tsc --noEmit`, `npm run build` e `npm run test:phase7`.
Validar a imagem com `docker compose -f docker-compose.homolog.yml config` e
`docker build --file Dockerfile.homolog` usando a URL de homologação fornecida
fora do repositório. Registrar SHA da imagem, URL, timestamp, CSP observada,
resultado das dez jornadas, latência P95 e evidência de auditoria no checklist
compartilhado da fase.

## Flags e rollback

- Piloto começa com `MCP_ENABLED=false` e `MCP_WRITE_TOOLS_ENABLED=false`; ativar
  progressivamente após o smoke de leitura.
- Rollback: reimplantar a imagem anterior por SHA, manter `MCP_ENABLED=false`,
  invalidar cache somente depois de confirmar o artefato e preservar a mensagem
  de indisponibilidade sem detalhes internos.
- Depois do rollback: abrir RCA, adicionar teste de regressão, repetir os gates e
  só então promover nova imagem.

## Checklist operacional do piloto

- [ ] backend e frontend acessíveis por HTTPS em homologação;
- [ ] dez jornadas executadas com evidência de request/response seguro;
- [ ] autorização, confirmação de escrita e auditoria conferidas;
- [ ] limites de 1.000 itens e latência P95 registrados;
- [ ] métricas/alertas e contato de suporte definidos;
- [ ] SHA implantado e SHA anterior de rollback registrados;
- [ ] aceite do responsável antes de qualquer usuário real.

## Runbook local integrado (PowerShell)

1. Inicie o backend local pelo compose de staging, com um `.env` efêmero válido:
   `docker compose --env-file .env.mcp-staging.local -f ..\FinanMap-Back-End\Modulos\GerenciamentoMensal\docker-compose.mcp-staging.yaml up -d --build --wait`.
2. Confirme o backend antes do frontend:
   `Invoke-RestMethod http://localhost:17270/healthcheck`.
3. Construa e suba o frontend apontando para o backend publicado no host (o valor
   é embutido no bundle, portanto deve ser definido antes do build):
   `$env:HOMOLOG_URL_API='http://localhost:17270/api/'; $env:MCP_ENABLED='true'; $env:MCP_WRITE_TOOLS_ENABLED='false'; docker compose -f docker-compose.homolog.yml up -d --build --wait`.
4. Valide o frontend em `http://localhost:9071/` e execute
   `npm run test:phase7`; o catálogo `mcp-phase7-journeys.mjs` confirma as dez
   jornadas representadas. A execução ponta a ponta exige credenciais/cliente MCP
   locais e deve registrar requests, correlation IDs e auditoria sem payload bruto.
5. Para rollback local, primeiro desligue writes e troque para a imagem anterior:
   `$env:MCP_WRITE_TOOLS_ENABLED='false'; docker compose -f docker-compose.homolog.yml down`;
   reexecute `up` com `MCP_FRONTEND_IMAGE` apontando para o SHA anterior. Não use
   `down -v` no backend: o volume Mongo/journal/auditoria deve ser preservado.
