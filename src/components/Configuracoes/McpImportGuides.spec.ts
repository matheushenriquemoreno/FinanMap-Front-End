import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mcpImportGuides } from 'src/content/McpImportGuides';
import McpImportGuides from './McpImportGuides.vue';

describe('McpImportGuides', () => {
  const writeText = vi.fn();

  beforeEach(() => {
    writeText.mockReset();
    writeText.mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
  });

  it.each([390, 1280])('renderiza os prompts em layout responsivo a %ipx', (width) => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: width,
    });

    const wrapper = mount(McpImportGuides);

    expect(wrapper.findAll('[data-testid="mcp-import-guide-card"]')).toHaveLength(6);
    expect(
      wrapper
        .findAll('.import-prompt-grid-cell')
        .every((cell) => cell.classes('col-12') && cell.classes('col-md-6')),
    ).toBe(true);
  });

  it('explica a fronteira de privacidade entre o agente e o FinanMap', () => {
    const wrapper = mount(McpImportGuides);
    const privacyNote = wrapper.get('[data-testid="mcp-import-privacy"]').text();

    expect(privacyNote).toContain('Excel e CSV são preparados pelo agente');
    expect(privacyNote).toContain('nunca são enviados ao FinanMap');
    expect(wrapper.find('input[type="file"]').exists()).toBe(false);
  });

  it('copia o prompt por controle acessível de 44px e anuncia o resultado', async () => {
    const wrapper = mount(McpImportGuides);
    const target = mcpImportGuides[1]!;
    const button = wrapper.get(`[data-testid="copy-import-guide-${target.id}"]`);

    expect(button.attributes('aria-label')).toContain(target.title);
    expect(getComputedStyle(button.element).minHeight).toBe('44px');
    await button.trigger('click');

    expect(writeText).toHaveBeenCalledWith(target.prompt);
    expect(wrapper.get('[data-testid="import-guide-copy-feedback"]').attributes('aria-live')).toBe(
      'polite',
    );
    expect(wrapper.get('[data-testid="import-guide-copy-feedback"]').text()).toContain(
      `Prompt “${target.title}” copiado`,
    );
  });

  it('oferece fallback acessível quando a cópia falha', async () => {
    writeText.mockRejectedValueOnce(new Error('clipboard indisponível'));
    const wrapper = mount(McpImportGuides);

    await wrapper.get('[data-testid="copy-import-guide-import-category"]').trigger('click');

    expect(wrapper.get('[data-testid="import-guide-copy-feedback"]').text()).toContain(
      'Selecione o texto do prompt e copie manualmente',
    );
  });
});
