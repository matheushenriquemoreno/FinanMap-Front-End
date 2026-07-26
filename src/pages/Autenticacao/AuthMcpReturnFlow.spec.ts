import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CadastroPage from './CadastroPage.vue';
import ConfirmarCodigoLoginPage from './ConfirmarCodigoLoginPage.vue';
import LoginPage from './LoginPage.vue';

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  query: {
    returnTo: '/mcp/authorize?mcpAuthorizationInteraction=signed-interaction',
  } as Record<string, unknown>,
  login: vi.fn().mockResolvedValue(undefined),
  register: vi.fn().mockResolvedValue(undefined),
  verifyCode: vi.fn().mockResolvedValue({
    token: 'session-token',
    refreshToken: 'refresh-token',
    nomeUsuario: 'Titular',
  }),
  email: 'titular@example.com' as string | null,
}));

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mocks.push }),
  useRoute: () => ({ query: mocks.query }),
}));

vi.mock('src/services/AuthService', () => ({
  obterAuthService: () => ({
    loading: { value: false },
    login: mocks.login,
    register: mocks.register,
    verifyCode: mocks.verifyCode,
  }),
}));

vi.mock('src/stores/UserEmail-Store', () => ({
  useEmailStore: () => ({
    getEmail: () => mocks.email,
    setEmail: vi.fn(),
  }),
}));

vi.mock('src/helpers/Notificacao', () => ({ notificar: vi.fn() }));

describe('retorno ao consentimento depois da autenticação', () => {
  beforeEach(() => {
    mocks.push.mockClear();
    mocks.login.mockResolvedValue(undefined);
    mocks.register.mockResolvedValue(undefined);
    mocks.verifyCode.mockResolvedValue({
      token: 'session-token',
      refreshToken: 'refresh-token',
      nomeUsuario: 'Titular',
    });
    localStorage.clear();
    mocks.email = 'titular@example.com';
  });

  it('preserva o retorno do login até a verificação', async () => {
    const wrapper = mount(LoginPage);

    await wrapper.get('q-form').trigger('submit');
    await flushPromises();

    expect(mocks.push).toHaveBeenCalledWith({
      path: '/verify',
      query: mocks.query,
    });
  });

  it('preserva o retorno do cadastro até a verificação', async () => {
    const wrapper = mount(CadastroPage);

    await wrapper.get('q-form').trigger('submit');
    await flushPromises();

    expect(mocks.push).toHaveBeenCalledWith({
      path: '/verify',
      query: mocks.query,
    });
  });

  it('retorna ao consentimento após validar o código sem expor tokens na URL', async () => {
    const wrapper = mount(ConfirmarCodigoLoginPage);
    await flushPromises();

    await wrapper.get('q-form').trigger('submit');
    await flushPromises();

    expect(mocks.push).toHaveBeenCalledWith(mocks.query.returnTo);
    expect(JSON.stringify(mocks.push.mock.calls)).not.toContain('session-token');
    expect(JSON.stringify(mocks.push.mock.calls)).not.toContain('refresh-token');
  });
});
