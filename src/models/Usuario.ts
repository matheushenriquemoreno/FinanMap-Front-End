export const AVATAR_PADRAO = 'avatar-01';

export const avataresDisponiveis = [
  { id: 'avatar-01', nome: 'Aurora' },
  { id: 'avatar-02', nome: 'Perfil 2' },
  { id: 'avatar-03', nome: 'Perfil 3' },
  { id: 'avatar-04', nome: 'Perfil 4' },
  { id: 'avatar-05', nome: 'Perfil 5' },
  { id: 'avatar-06', nome: 'Perfil 6' },
  { id: 'avatar-07', nome: 'Perfil 7' },
  { id: 'avatar-08', nome: 'Perfil 8' },
  { id: 'avatar-09', nome: 'Perfil 9' },
  { id: 'avatar-10', nome: 'Perfil 10' },
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
