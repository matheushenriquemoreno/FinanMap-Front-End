import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useEmailStore } from 'src/stores/UserEmail-Store';
import { AVATAR_PADRAO } from 'src/models/Usuario';

describe('useEmailStore', () => {
  beforeEach(() => setActivePinia(createPinia()));

  it('atualiza e limpa a identidade do usuário como uma unidade', () => {
    const store = useEmailStore();

    store.setUser({ email: 'ana@example.com', nome: 'Ana Silva', avatarId: 'avatar-03' });
    expect(store.getEmail()).toBe('ana@example.com');
    expect(store.getName()).toBe('Ana Silva');
    expect(store.avatarId).toBe('avatar-03');

    store.clearUser();
    expect(store.getEmail()).toBeNull();
    expect(store.getName()).toBeNull();
    expect(store.avatarId).toBe(AVATAR_PADRAO);
  });
});
