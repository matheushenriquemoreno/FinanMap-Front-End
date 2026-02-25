// Enums
export enum NivelPermissao {
  Visualizar = 'Visualizar',
  Editar = 'Editar'
}

export enum StatusConvite {
  Pendente = 'Pendente',
  Aceito = 'Aceito',
  Recusado = 'Recusado'
}

// Interfaces
export interface Compartilhamento {
  id: string;
  proprietarioId: string;
  proprietarioEmail: string;
  proprietarioNome: string;
  convidadoId: string;
  convidadoEmail: string;
  permissao: NivelPermissao;
  status: StatusConvite;
  dataCriacao: string;
}

export interface CriarCompartilhamentoDTO {
  convidadoEmail: string;
  permissao: NivelPermissao;
}

export interface AtualizarPermissaoDTO {
  compartilhamentoId: string;
  novaPermissao: NivelPermissao;
}

export interface ResponderConviteDTO {
  compartilhamentoId: string;
  aceitar: boolean;
}

// Interface para o contexto ativo no store
export interface ContextoCompartilhado {
  proprietarioId: string;
  proprietarioNome: string;
  permissao: NivelPermissao;
}
