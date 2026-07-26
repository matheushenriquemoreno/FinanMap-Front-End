import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mcpWriteGuides } from 'src/content/McpWriteGuides';
import McpWriteGuides from './McpWriteGuides.vue';

describe('McpWriteGuides', () => {
  const writeText = vi.fn();

  beforeEach(() => {
    writeText.mockReset();
    writeText.mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
  });

  it.each([390, 1280])('renderiza os 15 prompts em layout responsivo a %ipx', (width) => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: width,
    });

    const wrapper = mount(McpWriteGuides);

    expect(wrapper.findAll('[data-testid="mcp-write-guide-card"]')).toHaveLength(15);
    expect(
      wrapper
        .findAll('.write-prompt-grid-cell')
        .every((cell) => cell.classes('col-12') && cell.classes('col-md-6')),
    ).toBe(true);
  });

  it('copia o prompt completo por um controle acessível e anuncia o resultado', async () => {
    const wrapper = mount(McpWriteGuides);
    const target = mcpWriteGuides[7]!;
    const button = wrapper.get(`[data-testid="copy-write-guide-${target.id}"]`);

    expect(button.attributes('aria-label')).toContain(target.title);
    expect(getComputedStyle(button.element).minHeight).toBe('44px');
    await button.trigger('click');

    expect(writeText).toHaveBeenCalledWith(target.prompt);
    expect(wrapper.get('[data-testid="write-guide-copy-feedback"]').attributes('aria-live')).toBe(
      'polite',
    );
    expect(wrapper.get('[data-testid="write-guide-copy-feedback"]').text()).toContain(
      `Prompt “${target.title}” copiado`,
    );
  });

  it('oferece fallback acessível quando a cópia falha', async () => {
    writeText.mockRejectedValueOnce(new Error('clipboard indisponível'));
    const wrapper = mount(McpWriteGuides);

    await wrapper.get('[data-testid="copy-write-guide-categoria-create"]').trigger('click');

    expect(wrapper.get('[data-testid="write-guide-copy-feedback"]').text()).toContain(
      'Selecione o texto do prompt e copie manualmente',
    );
  });
});
