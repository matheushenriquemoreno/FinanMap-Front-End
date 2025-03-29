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
}

export interface DespesaResult extends TransacaoResult {
}


// Investimento

export interface InvestimentoCreate extends TransacaoCreate {
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

export interface Mes {
  ano: number,
  mes: number
}
