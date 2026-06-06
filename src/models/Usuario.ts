export const AVATAR_PADRAO = 'avatar-01';

export const avataresDisponiveis = [
  { id: 'avatar-01', nome: 'Aurora' },
  { id: 'avatar-02', nome: 'Oceano' },
  { id: 'avatar-03', nome: 'Floresta' },
  { id: 'avatar-04', nome: 'Pôr do sol' },
  { id: 'avatar-05', nome: 'Lavanda' },
  { id: 'avatar-06', nome: 'Cítrico' },
  { id: 'avatar-07', nome: 'Céu' },
  { id: 'avatar-08', nome: 'Coral' },
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
