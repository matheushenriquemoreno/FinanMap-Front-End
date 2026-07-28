/* eslint-disable @typescript-eslint/unbound-method */
import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  McpAuditEvent,
  McpAuditEventDetail,
  McpReconciliationStatus,
  McpWriteAction,
} from 'src/models/Mcp';
import McpService from 'src/services/McpService';
import McpAuditHistory from './McpAuditHistory.vue';

vi.mock('src/services/McpService', () => ({
  default: {
    listarHistorico: vi.fn(),
    obterEventoHistorico: vi.fn(),
  },
}));

const baseEvent: McpAuditEvent = {
  id: 'event-preview',
  correlationId: 'correlation-preview',
  connectionId: 'connection-safe',
  toolName: 'finanmap_category_update_prepare',
  operationClass: 'preview',
  state: 'completed',
  startedAtUtc: '2026-07-27T12:00:00Z',
  finishedAtUtc: '2026-07-27T12:00:01Z',
  action: 'update',
  resultSummary: { summary: 'Prévia preparada para alterar uma categoria.' },
  errorCodes: [],
};

function detailFor(
  overrides: Partial<McpAuditEventDetail> = {},
): McpAuditEventDetail & Record<string, unknown> {
  return {
    ...baseEvent,
    preview: {
      resourceType: 'Categoria',
      recordReference: 'Categoria selecionada',
      changes: [
        {
          field: 'nome',
          label: 'Nome',
          currentValue: 'Moradia',
          proposedValue: 'Casa',
        },
      ],
      irreversible: false,
      expiresAtUtc: '2026-07-27T12:15:00Z',
      requiredDecision: 'APPLY_CHANGES',
    },
    ...overrides,
  };
}

async function mountWithEvents(events: McpAuditEvent[]) {
  vi.mocked(McpService.listarHistorico).mockResolvedValue({
    items: events,
    nextCursor: null,
  });
  const wrapper = mount(McpAuditHistory);
  await flushPromises();
  return wrapper;
}

async function openDetails(eventId: string, detail: McpAuditEventDetail & Record<string, unknown>) {
  vi.mocked(McpService.obterEventoHistorico).mockResolvedValue(detail);
  const wrapper = await mountWithEvents([{ ...detail }]);

  await wrapper.get(`[data-testid="open-event-${eventId}"]`).trigger('click');
  await flushPromises();

  expect(McpService.obterEventoHistorico).toHaveBeenCalledWith(eventId);
  return wrapper;
}

describe('McpAuditHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(McpService.listarHistorico).mockResolvedValue({
      items: [],
      nextCursor: null,
    });
  });

  it('expõe estados acessíveis de carregamento e histórico vazio', async () => {
    let resolveHistory!: (value: { items: []; nextCursor: null }) => void;
    vi.mocked(McpService.listarHistorico).mockReturnValue(
      new Promise((resolve) => {
        resolveHistory = resolve;
      }),
    );

    const wrapper = mount(McpAuditHistory);

    expect(wrapper.get('[data-testid="mcp-history-loading"]').attributes('role')).toBe('status');
    expect(wrapper.text()).toContain('Carregando histórico');

    resolveHistory({ items: [], nextCursor: null });
    await flushPromises();

    expect(wrapper.get('[data-testid="mcp-history-empty"]').text()).toContain(
      'Nenhuma atividade registrada',
    );
  });

  it('apresenta todos os estados operacionais previstos em linguagem pt-BR', async () => {
    const states = [
      ['received', 'Recebida'],
      ['executing', 'Em execução'],
      ['reconciling', 'Em reconciliação'],
      ['completed', 'Concluída'],
      ['partiallyCompleted', 'Parcial'],
      ['failed', 'Falhou'],
      ['rejected', 'Rejeitada'],
      ['unknown', 'Resultado desconhecido'],
      ['expired', 'Expirada'],
    ] as const;
    const events = states.map(([state], index) => ({
      ...baseEvent,
      id: `event-state-${index}`,
      correlationId: `correlation-${index}`,
      state,
    }));

    const wrapper = await mountWithEvents(events);

    states.forEach(([, label], index) => {
      expect(wrapper.get(`[data-testid="event-state-event-state-${index}"]`).text()).toContain(
        label,
      );
    });
  });

  it('expõe falha recuperável no carregamento da lista', async () => {
    vi.mocked(McpService.listarHistorico)
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce({ items: [], nextCursor: null });
    const wrapper = mount(McpAuditHistory);
    await flushPromises();

    expect(wrapper.get('[data-testid="mcp-history-error"]').attributes('role')).toBe('alert');
    expect(wrapper.text()).toContain('Não foi possível carregar o histórico');

    await wrapper.get('[data-testid="mcp-history-error"]').find('q-btn').trigger('click');
    await flushPromises();

    expect(McpService.listarHistorico).toHaveBeenCalledTimes(2);
    expect(wrapper.find('[data-testid="mcp-history-empty"]').exists()).toBe(true);
  });

  it('pagina o histórico pelo cursor sem substituir eventos já exibidos', async () => {
    vi.mocked(McpService.listarHistorico)
      .mockResolvedValueOnce({
        items: [baseEvent],
        nextCursor: 'next-safe-cursor',
      })
      .mockResolvedValueOnce({
        items: [{ ...baseEvent, id: 'event-page-2', correlationId: 'correlation-page-2' }],
        nextCursor: null,
      });
    const wrapper = mount(McpAuditHistory);
    await flushPromises();

    await wrapper.get('[data-testid="mcp-history-load-more"]').trigger('click');
    await flushPromises();

    expect(McpService.listarHistorico).toHaveBeenNthCalledWith(2, {
      limit: 10,
      cursor: 'next-safe-cursor',
    });
    expect(wrapper.findAll('[data-testid^="history-event-"]')).toHaveLength(2);
    expect(wrapper.find('[data-testid="mcp-history-load-more"]').exists()).toBe(false);
  });

  it('carrega o detalhe sob demanda e mostra uma prévia segura de alteração', async () => {
    const detail = detailFor();
    const wrapper = await openDetails(detail.id, detail);
    const rendered = wrapper.get(`[data-testid="event-detail-${detail.id}"]`);

    expect(rendered.attributes('role')).toBe('region');
    expect(rendered.text()).toContain('Alteração');
    expect(rendered.text()).toContain('Categoria');
    expect(rendered.text()).toContain('Moradia');
    expect(rendered.text()).toContain('Casa');
    expect(rendered.text()).toContain('Aplicar alterações');
    expect(rendered.text()).toContain('27/07/2026');
  });

  it('mostra a decisão exata e apenas o confirmador permitido no detalhe de confirmação', async () => {
    const detail = detailFor({
      id: 'event-confirmation',
      correlationId: 'correlation-confirmation',
      toolName: 'finanmap_category_update_confirm',
      operationClass: 'confirm',
      action: 'update',
      confirmation: {
        decision: 'APPLY_CHANGES',
        confirmedBy: 'resource_owner',
        confirmedAtUtc: '2026-07-27T12:05:00Z',
      },
    });

    const wrapper = await openDetails(detail.id, detail);
    const rendered = wrapper.get(`[data-testid="event-detail-${detail.id}"]`).text();

    expect(rendered).toContain('Confirmação');
    expect(rendered).toContain('Aplicar alterações');
    expect(rendered).toContain('Titular da conta');
    expect(rendered).not.toContain('connection-safe');
  });

  it('expõe reconciliação e resultado individual sem incentivar repetição cega', async () => {
    const detail = detailFor({
      id: 'event-reconciliation',
      correlationId: 'correlation-reconciliation',
      state: 'reconciling',
      operationClass: 'confirm',
      reconciliation: {
        status: 'checking',
        attempts: 2,
        lastCheckedAtUtc: '2026-07-27T12:07:00Z',
        summary: 'Verificando o marcador da operação.',
        guidance: 'Aguarde a verificação antes de tentar novamente.',
      },
      result: {
        summary: 'Uma categoria está em verificação.',
        items: [
          {
            reference: 'Categoria selecionada',
            status: 'processing',
            summary: 'Resultado ainda não comprovado.',
          },
        ],
      },
    });

    const wrapper = await openDetails(detail.id, detail);
    const rendered = wrapper.get(`[data-testid="event-detail-${detail.id}"]`).text();

    expect(wrapper.get(`[data-testid="event-state-${detail.id}"]`).text()).toContain(
      'Em reconciliação',
    );
    expect(rendered).toContain('Verificando o marcador');
    expect(rendered).toContain('Aguarde a verificação');
    expect(rendered).toContain('Categoria selecionada');
    expect(rendered).toContain('Resultado ainda não comprovado');
  });

  it.each([
    ['not_required', 'Não necessária'],
    ['completed', 'Concluída'],
    ['rejected', 'Rejeitada'],
    ['unknown', 'Resultado desconhecido'],
  ] as const)(
    'apresenta o estado canônico de reconciliação %s com semântica acessível',
    async (status, expectedLabel) => {
      const detail = detailFor({
        id: `event-reconciliation-${status}`,
        correlationId: `correlation-reconciliation-${status}`,
        reconciliation: {
          status: status as unknown as McpReconciliationStatus,
          attempts: 1,
          summary: 'Estado de reconciliação persistido.',
        },
      });

      const wrapper = await openDetails(detail.id, detail);
      const presentation = wrapper.get(`[data-testid="event-reconciliation-status-${detail.id}"]`);

      expect(presentation.attributes('role')).toBe('status');
      expect(presentation.text()).toContain(expectedLabel);
      expect(presentation.text()).not.toContain('undefined');
    },
  );

  it.each([
    ['cancel', 'Cancelamento de prévia'],
    ['status', 'Consulta de status'],
  ] as const)(
    'apresenta a ação canônica %s sem acessar undefined.label',
    async (action, expectedLabel) => {
      const detail = detailFor({
        id: `event-action-${action}`,
        correlationId: `correlation-action-${action}`,
        action: action as unknown as McpWriteAction,
      });

      const wrapper = await openDetails(detail.id, detail);
      const presentation = wrapper.get(`[data-testid="event-action-${detail.id}"]`);

      expect(presentation.text()).toContain(expectedLabel);
      expect(presentation.text()).not.toContain('undefined');
    },
  );

  it('usa fallback seguro para valores futuros sem renderizar campos brutos', async () => {
    const detail = {
      ...detailFor({
        id: 'event-future-contract',
        correlationId: 'correlation-future-contract',
        action: 'future_action' as unknown as McpWriteAction,
        reconciliation: {
          status: 'future_state' as unknown as McpReconciliationStatus,
          attempts: 1,
          summary: 'Resumo seguro permitido.',
        },
      }),
      rawPayload: 'PAYLOAD_FUTURO_CANARIO',
    } as McpAuditEventDetail & Record<string, unknown>;

    const wrapper = await openDetails(detail.id, detail);
    const rendered = wrapper.get(`[data-testid="event-detail-${detail.id}"]`).text();

    expect(rendered).toContain('Operação MCP');
    expect(rendered).toContain('Estado não reconhecido');
    expect(rendered).not.toContain('PAYLOAD_FUTURO_CANARIO');
  });

  it('explica a expiração e comprova que a escrita permaneceu sem execução', async () => {
    const detail = detailFor({
      id: 'event-expired',
      correlationId: 'correlation-expired',
      state: 'expired',
      operationClass: 'preview',
      failure: {
        code: 'PREVIEW_EXPIRED',
        message: 'A prévia expirou sem confirmação.',
        guidance: 'Solicite uma nova prévia antes de confirmar.',
      },
      result: {
        summary: 'Nenhuma alteração foi executada.',
        items: [],
      },
    });

    const wrapper = await openDetails(detail.id, detail);
    const rendered = wrapper.get(`[data-testid="event-detail-${detail.id}"]`).text();

    expect(wrapper.get(`[data-testid="event-state-${detail.id}"]`).text()).toContain('Expirada');
    expect(rendered).toContain('A prévia expirou sem confirmação');
    expect(rendered).toContain('Nenhuma alteração foi executada');
    expect(rendered).toContain('Solicite uma nova prévia');
  });

  it('destaca que uma exclusão confirmada é definitiva e preserva seu resultado seguro', async () => {
    const detail = detailFor({
      id: 'event-delete',
      correlationId: 'correlation-delete',
      toolName: 'finanmap_income_delete_confirm',
      operationClass: 'confirm',
      action: 'delete',
      preview: {
        resourceType: 'Receita',
        recordReference: 'Receita selecionada',
        changes: [],
        irreversible: true,
        expiresAtUtc: '2026-07-27T12:15:00Z',
        requiredDecision: 'DELETE_PERMANENTLY',
      },
      confirmation: {
        decision: 'DELETE_PERMANENTLY',
        confirmedBy: 'resource_owner',
        confirmedAtUtc: '2026-07-27T12:05:00Z',
      },
      result: {
        summary: 'Receita excluída definitivamente.',
        items: [
          {
            reference: 'Receita selecionada',
            status: 'completed',
            summary: 'Exclusão concluída.',
          },
        ],
      },
    });

    const wrapper = await openDetails(detail.id, detail);
    const rendered = wrapper.get(`[data-testid="event-detail-${detail.id}"]`).text();

    expect(rendered).toContain('Exclusão definitiva');
    expect(rendered).toContain('Esta exclusão é irreversível');
    expect(rendered).toContain('Excluir permanentemente');
    expect(rendered).toContain('Receita excluída definitivamente');
  });

  it('orienta a verificação segura de resultado Unknown e exibe o correlation ID', async () => {
    const detail = detailFor({
      id: 'event-unknown',
      correlationId: 'support-correlation-123',
      state: 'unknown',
      operationClass: 'confirm',
      failure: {
        code: 'RESULT_UNKNOWN',
        message: 'Não foi possível comprovar o resultado da escrita.',
        guidance: 'Consulte o resultado desta operação antes de tentar novamente.',
      },
    });

    const wrapper = await openDetails(detail.id, detail);
    const rendered = wrapper.get(`[data-testid="event-detail-${detail.id}"]`).text();

    expect(wrapper.get(`[data-testid="event-state-${detail.id}"]`).text()).toContain(
      'Resultado desconhecido',
    );
    expect(rendered).toContain('RESULT_UNKNOWN');
    expect(rendered).toContain('Consulte o resultado desta operação');
    expect(rendered).toContain('support-correlation-123');
  });

  it('minimiza o detalhe por lista permitida e nunca renderiza payload, segredo ou stack', async () => {
    const detail = {
      ...detailFor({ id: 'event-minimized', correlationId: 'correlation-safe' }),
      rawPayload: 'PAYLOAD_FINANCEIRO_CANARIO',
      accessToken: 'SEGREDO_CANARIO',
      stackTrace: 'STACK_CANARIO',
      preview: {
        ...detailFor().preview,
        internalSnapshot: 'SNAPSHOT_INTEGRAL_CANARIO',
      },
      resultSummary: {
        summary: 'Resumo permitido.',
        rawResponse: 'RESPOSTA_BRUTA_CANARIO',
      },
    } as McpAuditEventDetail & Record<string, unknown>;

    const wrapper = await openDetails(detail.id, detail);
    const rendered = wrapper.get(`[data-testid="event-detail-${detail.id}"]`).text();

    expect(rendered).toContain('Resumo permitido');
    expect(rendered).not.toMatch(
      /PAYLOAD_FINANCEIRO_CANARIO|SEGREDO_CANARIO|STACK_CANARIO|SNAPSHOT_INTEGRAL_CANARIO|RESPOSTA_BRUTA_CANARIO/,
    );
  });

  it('resume lote de 1.000 itens por estado, tipo e totais sem renderizar payload integral', async () => {
    const detail = {
      ...detailFor({
        id: 'event-import-batch',
        correlationId: 'correlation-import-batch',
        toolName: 'finanmap_import_confirm',
        operationClass: 'import',
        state: 'partiallyCompleted',
        action: null,
        preview: null,
      }),
      importBatch: {
        state: 'partial',
        itemCount: 1_000,
        countsByState: {
          completed: 995,
          failed: 3,
          unknown: 2,
        },
        countsByType: {
          category: 100,
          income: 250,
          expense: 400,
          investment: 150,
          fixed_cost: 100,
        },
        totals: [
          { type: 'income', amount: 12500, currency: 'BRL' },
          { type: 'expense', amount: 8250.5, currency: 'BRL' },
        ],
        failures: [
          {
            clientItemId: 'item-998',
            sourceRef: 'Orçamento!Linha 998',
            field: 'value',
            code: 'INVALID_VALUE',
            message: 'O valor informado não é válido.',
            guidance: 'Corrija o valor e reenvie somente este item.',
          },
        ],
        items: [
          {
            clientItemId: 'item-1',
            sourceRef: 'Receitas!Linha 1',
            type: 'income',
            operationId: 'operation-safe-1',
            result: 'completed',
          },
        ],
      },
      rawPayload: 'PAYLOAD_INTEGRAL_DE_1000_ITENS',
    } as McpAuditEventDetail & Record<string, unknown>;

    const wrapper = await openDetails(detail.id, detail);
    const rendered = wrapper.get(`[data-testid="event-detail-${detail.id}"]`).text();

    expect(rendered).toContain('1.000');
    expect(rendered).toContain('995');
    expect(rendered).toContain('Categoria');
    expect(rendered).toContain('Custo fixo');
    expect(rendered).toContain('R$');
    expect(rendered).toContain('Orçamento!Linha 998');
    expect(rendered).toContain('value');
    expect(rendered).toContain('INVALID_VALUE');
    expect(rendered).toContain('O valor informado não é válido');
    expect(rendered).toContain('Corrija o valor e reenvie somente este item');
    expect(rendered).toContain('operation-safe-1');
    expect(rendered).toContain('Concluído');
    expect(rendered).not.toContain('PAYLOAD_INTEGRAL_DE_1000_ITENS');
  });

  it.each([
    ['partial', 'Parcial'],
    ['completed', 'Concluído'],
    ['failed', 'Falhou'],
    ['unknown', 'Resultado desconhecido'],
  ] as const)('apresenta o estado seguro de lote %s', async (state, expectedLabel) => {
    const detail = {
      ...detailFor({
        id: `event-import-${state}`,
        correlationId: `correlation-import-${state}`,
        operationClass: 'import',
        action: null,
        preview: null,
      }),
      importBatch: {
        state,
        itemCount: 1,
        countsByState: {},
        countsByType: {},
        totals: [],
        failures: [],
        items: [],
      },
    } as McpAuditEventDetail & Record<string, unknown>;

    const wrapper = await openDetails(detail.id, detail);

    expect(wrapper.get(`[data-testid="import-batch-state-${detail.id}"]`).text()).toContain(
      expectedLabel,
    );
  });

  it('permite recuperar uma falha ao buscar o detalhe sem apagar a lista', async () => {
    const detail = detailFor({ id: 'event-detail-error' });
    vi.mocked(McpService.obterEventoHistorico)
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(detail);
    const wrapper = await mountWithEvents([{ ...detail }]);

    await wrapper.get(`[data-testid="open-event-${detail.id}"]`).trigger('click');
    await flushPromises();

    expect(wrapper.get(`[data-testid="event-detail-error-${detail.id}"]`).text()).toContain(
      'Não foi possível carregar os detalhes',
    );
    expect(wrapper.text()).toContain(detail.toolName);

    await wrapper.get(`[data-testid="retry-event-${detail.id}"]`).trigger('click');
    await flushPromises();

    expect(McpService.obterEventoHistorico).toHaveBeenCalledTimes(2);
    expect(wrapper.get(`[data-testid="event-detail-${detail.id}"]`).text()).toContain('Categoria');
  });
});
