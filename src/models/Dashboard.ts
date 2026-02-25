export interface ResumoItemModel {
  total: number;
  tendencia: number[];
}

export interface ResumoFinanceiroModel {
  rendimento: ResumoItemModel;
  despesa: ResumoItemModel;
  investimento: ResumoItemModel;
}

export interface EvolucaoPeriodoModel {
  label: string;
  rendimento: number;
  despesa: number;
  investimento: number;
}

export interface CategoriaDashboardModel {
  categoria: string;
  valor: number;
  tipo: string;
  percentual: number | null;
}
