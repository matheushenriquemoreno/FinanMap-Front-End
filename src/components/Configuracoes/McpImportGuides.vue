<template>
  <section
    data-testid="mcp-import-guides"
    class="mcp-import-guides q-mt-xl"
    aria-labelledby="mcp-import-guides-title"
  >
    <header class="q-mb-md">
      <div class="text-overline text-primary">Importação estruturada e revisável</div>
      <h3 id="mcp-import-guides-title" class="text-h6 text-weight-bold q-my-none">
        Prompts para importar dados preparados pelo agente
      </h3>
      <p class="text-body2 text-grey-7 q-mb-none q-mt-xs">
        Prepare até 1.000 itens em JSON, revise a prévia e confirme apenas os itens válidos.
      </p>
    </header>

    <aside
      data-testid="mcp-import-privacy"
      class="import-privacy-note rounded-borders q-pa-md q-mb-lg"
      role="note"
    >
      <strong>Privacidade:</strong> Excel e CSV são preparados pelo agente e nunca são enviados ao
      FinanMap. O FinanMap recebe somente os dados estruturados em JSON, sem documento original,
      binário, base64 ou segredo.
    </aside>

    <aside class="import-confirmation-note rounded-borders q-pa-md q-mb-lg" role="note">
      <strong>Confirmação:</strong> revise contagens, totais e falhas da prévia. Decida
      <code>skip</code> ou <code>import_anyway</code> para cada possível duplicidade e use
      <code>IMPORT_VALID_ITEMS</code> somente depois da revisão.
    </aside>

    <div class="row q-col-gutter-md">
      <div
        v-for="guide in mcpImportGuides"
        :key="guide.id"
        class="import-prompt-grid-cell col-12 col-md-6"
      >
        <article
          data-testid="mcp-import-guide-card"
          class="import-prompt-card rounded-borders q-pa-md"
          :aria-labelledby="`mcp-import-guide-${guide.id}`"
        >
          <div>
            <div class="text-caption text-weight-bold text-primary q-mb-xs">
              {{ typeLabel(guide.type) }}
            </div>
            <h4
              :id="`mcp-import-guide-${guide.id}`"
              class="text-subtitle1 text-weight-bold q-mt-none q-mb-xs"
            >
              {{ guide.title }}
            </h4>
            <p class="text-caption text-grey-7 q-mt-none q-mb-sm">
              {{ guide.description }}
            </p>
            <pre
              class="import-prompt-text rounded-borders q-pa-sm q-mb-md"
            ><code>{{ guide.prompt }}</code></pre>
          </div>

          <button
            type="button"
            class="copy-import-prompt-button"
            style="min-height: 44px"
            :data-testid="`copy-import-guide-${guide.id}`"
            :aria-label="`Copiar prompt: ${guide.title}`"
            @click="copyGuide(guide)"
          >
            Copiar prompt
          </button>
        </article>
      </div>
    </div>

    <p
      data-testid="import-guide-copy-feedback"
      class="import-copy-feedback text-caption q-mb-none q-mt-sm"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {{ copyFeedback }}
    </p>
  </section>
</template>

<script setup lang="ts">
import {
  mcpImportGuides,
  type McpImportGuide,
  type McpImportGuideType,
} from 'src/content/McpImportGuides';
import { ref } from 'vue';

const copyFeedback = ref('');

const typeLabels: Record<McpImportGuideType, string> = {
  category: 'Categoria',
  income: 'Receita',
  expense: 'Despesa',
  investment: 'Investimento',
  fixed_cost: 'Custo fixo',
  correction: 'Correção de falhas',
};

function typeLabel(type: McpImportGuideType): string {
  return typeLabels[type];
}

async function copyGuide(guide: McpImportGuide): Promise<void> {
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
.import-privacy-note {
  border-left: 4px solid var(--q-info);
  background: rgba(33, 150, 243, 0.1);
}

.import-confirmation-note {
  border-left: 4px solid var(--q-warning);
  background: rgba(230, 126, 34, 0.1);
}

.import-confirmation-note code {
  overflow-wrap: anywhere;
  font-weight: 700;
}

.import-prompt-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  border: 1px solid rgba(127, 127, 127, 0.3);
  background: rgba(127, 127, 127, 0.05);
}

.import-prompt-text {
  max-height: 260px;
  overflow: auto;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  background: rgba(127, 127, 127, 0.12);
  font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
  font-size: 0.78rem;
  line-height: 1.5;
}

.import-prompt-text code {
  font: inherit;
}

.copy-import-prompt-button {
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

.copy-import-prompt-button:hover {
  background: rgba(25, 118, 210, 0.1);
}

.copy-import-prompt-button:focus-visible {
  outline: 3px solid rgba(25, 118, 210, 0.35);
  outline-offset: 2px;
}

.import-copy-feedback {
  min-height: 20px;
  color: var(--q-positive);
}

@media (max-width: 599px) {
  .import-prompt-card {
    padding: 14px;
  }

  .import-prompt-text {
    max-height: none;
  }

  .copy-import-prompt-button {
    width: 100%;
  }
}
</style>
