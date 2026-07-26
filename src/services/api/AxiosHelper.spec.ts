import { afterEach, describe, expect, it } from 'vitest';
import { CreateIntanceAxios } from './AxiosHelper';

describe('CreateIntanceAxios', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('não envia contexto compartilhado para endpoints que exigem o titular autenticado', async () => {
    localStorage.setItem('proprietarioIdAtivo', 'conta-de-terceiro');
    const axios = CreateIntanceAxios({ includeSharedContext: false });
    axios.defaults.adapter = (config) =>
      Promise.resolve({
        data: config.headers,
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      });

    const response = await axios.get('/api/mcp/configuration');

    expect(response.data['X-Proprietario-Id']).toBeUndefined();
  });
});
