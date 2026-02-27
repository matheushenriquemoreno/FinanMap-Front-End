export interface TransacaoCreate {
  id: string | null;
  descricao: string;
  valor: number;
  categoriaId: string;
  ano: number;
  mes: number;
  categoriaNome?: string,
}

export interface TransacaoResult {
  id: string | null;
  descricao: string;
  valor: number;
  categoriaId: string;
  ano: number;
  mes: number;
  categoriaNome: string,
  reportAcumulado: AcumuladoMensal | null
}


// Rendimentos
export interface RendimentosCreate extends TransacaoCreate {
}

export interface RendimentosResult extends TransacaoResult {
}


// Despesa

export interface DespesaCreate extends TransacaoCreate {
  idDespesaAgrupadora: string;
}

export interface DespesaResult extends TransacaoResult {
  ehDespesaAgrupadora: boolean;
  idDespesaAgrupadora: string;
  agrupadora: DespesaResult | null;
  despesasFilhas?: DespesaResult[];
  
  despesaOrigemId?: string;
  isParcelado: boolean;
  isRecorrente: boolean;
  parcelaAtual?: number;
  totalParcelas?: number;
}

export enum ModificadorLote {
  ApenasEsta = 0,
  EstaEProximas = 1,
  TodasDoLote = 2
}

export interface LancarDespesaLoteDTO {
  descricao: string;
  valorTotal: number;
  categoriaId: string;
  anoInicial: number;
  mesInicial: number;
  isParcelado: boolean;
  quantidadeMeses: number;
  isRecorrenteFixa: boolean;
  idDespesaAgrupadora?: string;
}

export interface AtualizarLoteDespesaDTO {
  novoValor: number;
  novaDescricao: string;
  novaCategoriaId: string;
  modificador: ModificadorLote;
}


// Investimento

export interface InvestimentoCreate extends TransacaoCreate {
  metaFinanceiraId?: string;
}

export interface InvestimentoResult extends TransacaoResult {
}

// Report

export interface AcumuladoMensal {
  valorRendimento: number,
  valorInvestimentos: number,
  valorDespesas: number,
  valorFinal: number
  rendimentos?: RendimentosResult[],
  despesas?: DespesaResult[],
  investimentos?: InvestimentoResult[]
}

export interface MesAno {
  ano: number,
  mes: number
}
