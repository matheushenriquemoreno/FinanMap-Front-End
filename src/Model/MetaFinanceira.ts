// ========== Enums ==========

export enum CategoriaIconeMeta {
  Viagem = 0,
  Emergencia = 1,
  Educacao = 2,
  Veiculo = 3,
  Moradia = 4,
  Investimento = 5,
  Outro = 6,
}

export enum TipoNotificacaoMeta {
  MetadeCaminho = 'MetadeCaminho',
  QuaseLa = 'QuaseLa',
  MetaAlcancada = 'MetaAlcancada',
}

// ========== DTOs de Criação/Atualização ==========

export interface CreateMetaFinanceiraDTO {
  nome: string;
  valorAlvo: number;
  dataLimite: string; // ISO date string
  categoria: CategoriaIconeMeta;
}

export interface UpdateMetaFinanceiraDTO {
  id: string;
  nome: string;
  valorAlvo: number;
  dataLimite: string; // ISO date string
  categoria: CategoriaIconeMeta;
}

export enum OrigemContribuicao {
  Manual = 0,
  Investimento = 1,
}

export interface ContribuicaoDTO {
  valor: number;
  data: string; // ISO date string
  investimentoId?: string;
  nomeInvestimento?: string;
}

// ========== DTOs de Resultado ==========

export interface ContribuicaoResult {
  id: string;
  valor: number;
  data: string;
  investimentoId?: string;
  nomeInvestimento?: string;
  origem: string; // 'Manual' | 'Investimento'
}

export interface MetaFinanceiraResult {
  id: string;
  nome: string;
  valorAlvo: number;
  dataLimite: string;
  categoria: CategoriaIconeMeta;
  valorAtual: number;
  percentualProgresso: number;
  concluida: boolean;
  diasRestantes: number;
  valorFaltante: number;
  contribuicoes: ContribuicaoResult[];
  dataCriacao: string;
}

export interface ResumoMetasDTO {
  totalMetas: number;
  totalInvestido: number;
  percentualGeral: number;
  metasConcluidas: number;
  totalDeMetasAtivas: number;
}

export interface ResultContribuicaoResponse {
  metaAtualizada: MetaFinanceiraResult;
  notificacao: NotificacaoMetaDTO | null;
}

export interface NotificacaoMetaDTO {
  tipo: TipoNotificacaoMeta;
  mensagem: string;
}

// ========== Utilitários de UI ==========

/** Mapeia CategoriaIconeMeta para ícone Material Icons e cor */
export const CATEGORIA_META_CONFIG: Record<
  CategoriaIconeMeta,
  { icon: string; label: string; color: string }
> = {
  [CategoriaIconeMeta.Viagem]: { icon: 'flight', label: 'Viagem', color: '#4A90D9' },
  [CategoriaIconeMeta.Emergencia]: { icon: 'shield', label: 'Emergência', color: '#E67E22' },
  [CategoriaIconeMeta.Educacao]: { icon: 'school', label: 'Educação', color: '#27AE60' },
  [CategoriaIconeMeta.Veiculo]: { icon: 'directions_car', label: 'Veículo', color: '#E74C3C' },
  [CategoriaIconeMeta.Moradia]: { icon: 'home', label: 'Moradia', color: '#F39C12' },
  [CategoriaIconeMeta.Investimento]: { icon: 'trending_up', label: 'Investimento', color: '#2ECC71' },
  [CategoriaIconeMeta.Outro]: { icon: 'emoji_events', label: 'Outro', color: '#9B59B6' },
};
