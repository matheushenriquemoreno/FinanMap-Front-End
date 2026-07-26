import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mcpQueryGuides } from 'src/content/McpQueryGuides';
import McpQueryGuides from './McpQueryGuides.vue';

describe('McpQueryGuides', () => {
  const writeText = vi.fn();

  beforeEach(() => {
    writeText.mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
  });

  it.each([390, 1280])('renderiza os nove guias na largura %ipx', (width) => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: width,
    });

    const wrapper = mount(McpQueryGuides, {
      props: { writeToolsEnabled: false },
    });

    expect(wrapper.findAll('[data-testid="mcp-query-guide-card"]')).toHaveLength(9);
    expect(wrapper.get('[data-testid="mcp-query-guides"]').classes()).toContain('mcp-query-guides');
    expect(wrapper.findAll('.prompt-grid-cell').every((cell) => cell.classes('col-12'))).toBe(true);
  });

  it('copia o prompt completo e anuncia o resultado para tecnologia assistiva', async () => {
    const wrapper = mount(McpQueryGuides, {
      props: { writeToolsEnabled: false },
    });
    const target = mcpQueryGuides[1]!;

    await wrapper.get(`[data-testid="copy-query-guide-${target.id}"]`).trigger('click');

    expect(writeText).toHaveBeenCalledWith(target.prompt);
    expect(wrapper.get('[data-testid="query-guide-copy-feedback"]').attributes('aria-live')).toBe(
      'polite',
    );
    expect(wrapper.get('[data-testid="query-guide-copy-feedback"]').text()).toContain(
      `Prompt “${target.title}” copiado`,
    );
  });

  it('oferece fallback acessível quando a cópia falha', async () => {
    writeText.mockRejectedValueOnce(new Error('clipboard indisponível'));
    const wrapper = mount(McpQueryGuides, {
      props: { writeToolsEnabled: false },
    });

    await wrapper.get('[data-testid="copy-query-guide-receitas"]').trigger('click');

    expect(wrapper.get('[data-testid="query-guide-copy-feedback"]').text()).toContain(
      'Selecione o texto do prompt e copie manualmente',
    );
  });

  it('orienta capacidades de escrita somente conforme a feature flag', () => {
    const disabled = mount(McpQueryGuides, {
      props: { writeToolsEnabled: false },
    });
    const enabled = mount(McpQueryGuides, {
      props: { writeToolsEnabled: true },
    });

    expect(disabled.get('[data-testid="mcp-future-capabilities"]').text()).toContain(
      'estão indisponíveis',
    );
    expect(enabled.get('[data-testid="mcp-future-capabilities"]').text()).toContain(
      'não fazem parte destes guias de leitura',
    );
    expect(enabled.get('[data-testid="mcp-future-capabilities"]').text()).toContain(
      'prévia e confirmação',
    );
  });
});
