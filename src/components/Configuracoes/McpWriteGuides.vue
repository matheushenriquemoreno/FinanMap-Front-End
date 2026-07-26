<template>
  <section
    data-testid="mcp-write-guides"
    class="mcp-write-guides q-mt-xl"
    aria-labelledby="mcp-write-guides-title"
  >
    <header class="q-mb-md">
      <div class="text-overline text-primary">Escreva com revisão humana</div>
      <h3 id="mcp-write-guides-title" class="text-h6 text-weight-bold q-my-none">
        Prompts de criação, alteração e exclusão
      </h3>
      <p class="text-body2 text-grey-7 q-mb-none q-mt-xs">
        Cada exemplo prepara uma prévia. Nada muda antes da sua revisão e da decisão exata.
      </p>
    </header>

    <aside class="write-safety-note rounded-borders q-pa-md q-mb-lg" role="note">
      <strong>Fluxo seguro:</strong> revise o alvo, os valores e os registros afetados na prévia.
      Use <code>APPLY_CHANGES</code> para criar ou alterar e <code>DELETE_PERMANENTLY</code> somente
      para uma exclusão definitiva.
    </aside>

    <div class="row q-col-gutter-md">
      <div
        v-for="guide in mcpWriteGuides"
        :key="guide.id"
        class="write-prompt-grid-cell col-12 col-md-6"
      >
        <article
          data-testid="mcp-write-guide-card"
          class="write-prompt-card rounded-borders q-pa-md"
          :aria-labelledby="`mcp-write-guide-${guide.id}`"
        >
          <div>
            <div class="write-action-label text-caption text-weight-bold text-primary q-mb-xs">
              {{ actionLabel(guide.action) }} · {{ domainLabel(guide.domain) }}
            </div>
            <h4
              :id="`mcp-write-guide-${guide.id}`"
              class="text-subtitle1 text-weight-bold q-mt-none q-mb-xs"
            >
              {{ guide.title }}
            </h4>
            <p class="text-caption text-grey-7 q-mt-none q-mb-sm">
              {{ guide.description }}
            </p>
            <pre
              class="write-prompt-text rounded-borders q-pa-sm q-mb-md"
            ><code>{{ guide.prompt }}</code></pre>
          </div>

          <button
            type="button"
            class="copy-write-prompt-button"
            style="min-height: 44px"
            :data-testid="`copy-write-guide-${guide.id}`"
            :aria-label="`Copiar prompt: ${guide.title}`"
            @click="copyGuide(guide)"
          >
            Copiar prompt
          </button>
        </article>
      </div>
    </div>

    <p
      data-testid="write-guide-copy-feedback"
      class="write-copy-feedback text-caption q-mb-none q-mt-sm"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {{ copyFeedback }}
    </p>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  mcpWriteGuides,
  type McpWriteAction,
  type McpWriteDomain,
  type McpWriteGuide,
} from 'src/content/McpWriteGuides';

const copyFeedback = ref('');

const actionLabels: Record<McpWriteAction, string> = {
  create: 'Criar',
  update: 'Alterar',
  delete: 'Excluir',
};

const domainLabels: Record<McpWriteDomain, string> = {
  categoria: 'Categoria',
  receita: 'Receita',
  despesa: 'Despesa',
  investimento: 'Investimento',
  'custo-fixo': 'Custo fixo',
};

function actionLabel(action: McpWriteAction): string {
  return actionLabels[action];
}

function domainLabel(domain: McpWriteDomain): string {
  return domainLabels[domain];
}

async function copyGuide(guide: McpWriteGuide): Promise<void> {
  copyFeedback.value = '';
  try {
    await navigator.clipboard.writeText(guide.prompt);
    copyFeedback.value = `Prompt “${guide.title}” copiado.`;
  } catch {
    copyFeedback.value =
      'Não foi possível copiar. Selecione o texto do prompt e copie manualmente.';
  }
}
</script>

<style scoped>
.write-safety-note {
  border-left: 4px solid var(--q-warning);
  background: rgba(230, 126, 34, 0.1);
}

.write-safety-note code {
  overflow-wrap: anywhere;
  font-weight: 700;
}

.write-prompt-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  border: 1px solid rgba(127, 127, 127, 0.3);
  background: rgba(127, 127, 127, 0.05);
}

.write-action-label {
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.write-prompt-text {
  max-height: 260px;
  overflow: auto;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  background: rgba(127, 127, 127, 0.12);
  font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
  font-size: 0.78rem;
  line-height: 1.5;
}

.write-prompt-text code {
  font: inherit;
}

.copy-write-prompt-button {
  align-self: flex-start;
  padding: 8px 14px;
  border: 1px solid var(--q-primary);
  border-radius: 8px;
  background: transparent;
  color: var(--q-primary);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.copy-write-prompt-button:hover {
  background: rgba(25, 118, 210, 0.1);
}

.copy-write-prompt-button:focus-visible {
  outline: 3px solid rgba(25, 118, 210, 0.35);
  outline-offset: 2px;
}

.write-copy-feedback {
  min-height: 20px;
  color: var(--q-positive);
}

@media (max-width: 599px) {
  .write-prompt-card {
    padding: 14px;
  }

  .write-prompt-text {
    max-height: none;
  }

  .copy-write-prompt-button {
    width: 100%;
  }
}
</style>
