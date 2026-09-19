# Review — Bug do modal de compra planejada

| Status       | Aprovado com ressalvas |
| ------------ | ---------------------- |
| Created      | 2026-09-19             |
| Last Updated | 2026-09-19             |

**Escopo revisado:** correção do bug `modal-compra-planejada-contraste-e-dimensoes`
**Versão da avaliação:** 1

## Artefatos analisados

- Relatório do bug: `.specs/bugs/modal-compra-planejada-contraste-e-dimensoes.md`.
- Implementação: `src/components/ComprasPlanejadas/CompraPlanejadaFormModal.vue`.
- Regressão: `scripts/check-lista-compras-planejadas.mjs`.
- Convenções: `AGENTS.md`, `docs/ai-context/README.md`, `SYSTEM-OVERVIEW.md`,
  `CODEBASE-MAP.md`, `DOMAIN-AND-BUSINESS-RULES.md`, `ENGINEERING-GUIDE.md` e
  `docs/dark-mode.md`.
- Revisão independente somente leitura executada por agente separado.

## Resumo executivo

A correção elimina a divergência de densidade do campo de valor, melhora a
hierarquia e o contraste da seção de lojas nos temas claro/escuro e simplifica
o CTA de criação para “Salvar”, preservando “Salvar alterações” na edição. A
regressão falhou antes da correção e passou depois, junto com a suíte, lint,
typecheck, build, Prettier e `git diff --check`. O veredito é **Aprovado com
ressalvas** pela ausência de smoke visual autenticado no ambiente local.

## Resultado das verificações obrigatórias

| Verificação               | Resultado              | Evidência                                                                                      |
| ------------------------- | ---------------------- | ---------------------------------------------------------------------------------------------- |
| Reprodução e causa raiz   | Atendida               | Relatório registra os três sintomas e as hipóteses confirmadas.                                |
| Teste de regressão antes  | Atendida               | `npm run test:compras-planejadas` falhou na ausência de `:dense="false"`.                      |
| Teste de regressão depois | Atendida               | O mesmo comando passou com densidade, dark mode, copy e CTA verificados.                       |
| Requisitos de UI          | Atendida estaticamente | Modal usa `dense=false`, `links-section--dark`, instrução explícita e CTA condicional correto. |
| API, modelos e permissões | Atendida               | Nenhum service, DTO, modelo, endpoint ou regra de acesso foi alterado.                         |
| Complexidade ciclomática  | Atendida               | Não há nova função de negócio; a expressão do CTA tem complexidade 2, abaixo do limite 10.     |
| Complexidade algorítmica  | Atendida               | Nenhum loop, I/O ou caminho de dados crescente foi adicionado.                                 |
| Suíte e qualidade         | Atendida               | `npm test`, lint, `vue-tsc`, build, Prettier focado e `git diff --check` passaram.             |
| Smoke visual autenticado  | Não verificado         | A rota local redirecionou para `/login`; não foram fornecidas credenciais para automação.      |

## Matriz de rastreabilidade

| Critério                    | Código                                   | Teste                                       | Status                   |
| --------------------------- | ---------------------------------------- | ------------------------------------------- | ------------------------ |
| Altura consistente do valor | `CompraPlanejadaFormModal.vue`           | Assertiva de `:dense="false"`               | Comprovado estaticamente |
| Clareza e contraste dark    | Seção e estilos `links-section--dark`    | Assertivas de classe, instrução e cores     | Comprovado estaticamente |
| CTA de criação/edição       | Expressão `props.compra` do botão        | Assertiva de “Salvar” e “Salvar alterações” | Comprovado               |
| Preservação de contratos    | Componente, service e modelo inalterados | Suíte de compras planejadas                 | Comprovado               |

## Achados

| ID   | Severidade         | Achado                                                      | Evidência                                   | Impacto                                                                  | Recomendação                                                                    | Encaminhamento          |
| ---- | ------------------ | ----------------------------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------- | ----------------------- |
| A-01 | Baixo, operacional | Não houve inspeção visual autenticada do modal renderizado. | Aplicação local redirecionou para `/login`. | Pequeno risco de diferença entre CSS compilado e impressão visual final. | Executar smoke visual/teclado autenticado antes da publicação.                  | Operação/pré-publicação |
| A-02 | Informativo        | As novas verificações são estruturais/regex.                | Script estático de compras planejadas.      | Não substitui E2E visual; não indica defeito conhecido.                  | Manter validação manual de temas e breakpoints no próximo ambiente autenticado. | Operação/pré-publicação |

## Riscos residuais e ressalvas aceitas

- A correção não altera contratos, persistência, validação ou permissões.
- A inspeção visual autenticada permanece pendente por falta de sessão local;
  o risco é operacional e não bloqueia os gates locais.

## Veredito

**Veredito:** Aprovado com ressalvas.

**Fundamentação:** a causa confirmada foi corrigida com alteração mínima, a
regressão falhou antes e passou depois, todos os gates automatizados passaram e
não há achados bloqueadores ou altos. A ressalva limita-se à validação visual
autenticada não executável no ambiente local.

## Próxima ação

Trabalho de código concluído. Executar smoke visual/teclado autenticado antes
da publicação; não há alteração de código pendente neste review.

## Histórico de revisões anteriores

| Versão | Data       | Veredito               | Resumo                                                                               |
| ------ | ---------- | ---------------------- | ------------------------------------------------------------------------------------ |
| 1      | 2026-09-19 | Aprovado com ressalvas | Correção de modal validada por regressão e gates locais; smoke autenticado pendente. |
