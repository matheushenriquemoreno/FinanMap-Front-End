export const AVATAR_PADRAO = 'avatar-01';

export const avataresDisponiveis = [
  { id: AVATAR_PADRAO, nome: 'Avatar padrão' },
  { id: 'avatar-02', nome: 'Avatar alternativo' },
] as const;

export type AvatarId = (typeof avataresDisponiveis)[number]['id'];

export interface UsuarioPerfil {
  nome: string;
  email: string;
  avatarId?: string;
}

export function normalizarAvatarId(avatarId?: string | null): AvatarId {
  return avataresDisponiveis.some((avatar) => avatar.id === avatarId)
    ? (avatarId as AvatarId)
    : AVATAR_PADRAO;
}

export function obterCaminhoAvatar(avatarId?: string | null): string {
  return `/avatars/${normalizarAvatarId(avatarId)}.svg`;
}
