export interface CustoFixoCreate {
  nome: string;
  diaVencimento: number;
  categoriaId?: string;
}

export interface CustoFixoResult {
  id: string;
  nome: string;
  diaVencimento: number;
  ativo: boolean;
  categoriaId?: string;
  categoriaNome?: string;
}

export interface UpdateCustoFixoDTO {
  id: string;
  nome: string;
  diaVencimento: number;
  categoriaId?: string;
  ativo?: boolean;
}

export interface CustoFixoConfiguracao {
  receberNotificacoes: boolean;
}

