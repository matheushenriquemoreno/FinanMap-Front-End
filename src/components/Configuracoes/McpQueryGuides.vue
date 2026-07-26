<template>
  <section
    data-testid="mcp-query-guides"
    class="mcp-query-guides q-mt-md"
    aria-labelledby="mcp-query-guides-title"
  >
    <header class="q-mb-md">
      <div class="text-overline text-primary">Comece por uma consulta</div>
      <h3 id="mcp-query-guides-title" class="text-h6 text-weight-bold q-my-none">
        Guias e prompts de leitura
      </h3>
      <p class="text-body2 text-grey-7 q-mb-none q-mt-xs">
        Copie um exemplo, ajuste datas e filtros e envie ao agente conectado.
      </p>
    </header>

    <aside class="usage-tips rounded-borders q-pa-md q-mb-md" aria-labelledby="mcp-tips-title">
      <h4 id="mcp-tips-title" class="text-subtitle2 text-weight-bold q-mt-none q-mb-sm">
        Dicas para respostas verificáveis
      </h4>
      <ul class="text-body2 q-my-none q-pl-lg">
        <li v-for="tip in mcpQueryTips" :key="tip" class="q-mb-xs">
          {{ tip }}
        </li>
      </ul>
    </aside>

    <div class="row q-col-gutter-md">
      <div v-for="guide in mcpQueryGuides" :key="guide.id" class="prompt-grid-cell col-12 col-md-6">
        <article
          data-testid="mcp-query-guide-card"
          class="prompt-card rounded-borders q-pa-md"
          :aria-labelledby="`mcp-guide-${guide.id}`"
        >
          <div>
            <h4
              :id="`mcp-guide-${guide.id}`"
              class="text-subtitle1 text-weight-bold q-mt-none q-mb-xs"
            >
              {{ guide.title }}
            </h4>
            <p class="text-caption text-grey-7 q-mt-none q-mb-sm">
              {{ guide.description }}
            </p>
            <pre
              class="prompt-text rounded-borders q-pa-sm q-mb-md"
            ><code>{{ guide.prompt }}</code></pre>
          </div>

          <button
            type="button"
            class="copy-prompt-button"
            :data-testid="`copy-query-guide-${guide.id}`"
            :aria-label="`Copiar prompt: ${guide.title}`"
            @click="copyGuide(guide)"
          >
            Copiar prompt
          </button>
        </article>
      </div>
    </div>

    <p
      data-testid="query-guide-copy-feedback"
      class="copy-feedback text-caption q-mb-none q-mt-sm"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {{ copyFeedback }}
    </p>

    <aside
      data-testid="mcp-future-capabilities"
      class="future-capabilities rounded-borders q-pa-md q-mt-md text-body2"
      role="note"
    >
      <template v-if="writeToolsEnabled">
        Criação, alteração, exclusão e importação não fazem parte destes guias de leitura. Quando
        oferecidas pelo agente, essas ações pertencem a outro fluxo, com prévia e confirmação
        explícita.
      </template>
      <template v-else>
        Criação, alteração, exclusão e importação são capacidades futuras e estão indisponíveis no
        momento. Use os prompts de leitura acima.
      </template>
    </aside>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { mcpQueryGuides, mcpQueryTips, type McpQueryGuide } from 'src/content/McpQueryGuides';

defineProps<{
  writeToolsEnabled: boolean;
}>();

const copyFeedback = ref('');

async function copyGuide(guide: McpQueryGuide): Promise<void> {
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
.usage-tips {
  border-left: 4px solid var(--q-primary);
  background: rgba(25, 118, 210, 0.08);
}

.prompt-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  border: 1px solid rgba(127, 127, 127, 0.25);
  background: rgba(127, 127, 127, 0.04);
}

.prompt-text {
  max-height: 220px;
  overflow: auto;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  background: rgba(127, 127, 127, 0.1);
  font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
  font-size: 0.78rem;
  line-height: 1.5;
}

.prompt-text code {
  font: inherit;
}

.copy-prompt-button {
  align-self: flex-start;
  min-height: 44px;
  padding: 8px 14px;
  border: 1px solid var(--q-primary);
  border-radius: 8px;
  background: transparent;
  color: var(--q-primary);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.copy-prompt-button:hover {
  background: rgba(25, 118, 210, 0.08);
}

.copy-prompt-button:focus-visible {
  outline: 3px solid rgba(25, 118, 210, 0.3);
  outline-offset: 2px;
}

.copy-feedback {
  min-height: 20px;
  color: var(--q-positive);
}

.future-capabilities {
  border: 1px solid rgba(230, 126, 34, 0.35);
  background: rgba(230, 126, 34, 0.09);
}

@media (max-width: 599px) {
  .prompt-card {
    padding: 14px;
  }

  .prompt-text {
    max-height: none;
  }

  .copy-prompt-button {
    width: 100%;
  }
}
</style>
