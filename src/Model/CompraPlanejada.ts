export type PrioridadeCompraPlanejada = 'Baixa' | 'Media' | 'Alta';

export type EstadoCompraPlanejada = 'Pendente' | 'Comprado';

export interface CompraPlanejadaLink {
  url: string;
  nomeLoja: string;
}

export interface CompraPlanejadaResult {
  id: string;
  nome: string;
  valorEstimado: number;
  prioridade: PrioridadeCompraPlanejada;
  descricao?: string | null;
  linksLojas: CompraPlanejadaLink[];
  estado: EstadoCompraPlanejada;
  dataCriacao: string;
  valorReal?: number | null;
  dataCompra?: string | null;
  despesaId?: string | null;
}

export interface ListaComprasPlanejadasResult {
  itens: CompraPlanejadaResult[];
  totalEstimado: number;
}

export interface ListaComprasCompradasResult {
  itens: CompraPlanejadaResult[];
  totalEstimado: number;
  totalReal: number;
}

export interface CompraPlanejadaLinkInput {
  url: string;
  nomeLoja: string;
}

export interface CompraPlanejadaCreate {
  nome: string;
  valorEstimado: number;
  prioridade: PrioridadeCompraPlanejada;
  descricao?: string;
  linksLojas: CompraPlanejadaLinkInput[];
}

export type CompraPlanejadaUpdate = CompraPlanejadaCreate;

export interface CompraPlanejadaConcluir {
  valorReal: number;
  dataCompra: string;
  criarDespesa: boolean;
  mes: number;
  ano: number;
  categoriaId?: string;
}

export const prioridadesCompraPlanejada: Array<{
  label: string;
  value: PrioridadeCompraPlanejada;
}> = [
  { label: 'Alta', value: 'Alta' },
  { label: 'Média', value: 'Media' },
  { label: 'Baixa', value: 'Baixa' },
];
