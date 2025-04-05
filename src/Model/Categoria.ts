
export enum TipoCategoriaETransacao {
  Despesa = "Despesa",
  Rendimento = "Rendimento",
  Investimento = "Investimento"
}

export interface Categoria {
  id: string;
  nome: string;
  tipo: TipoCategoriaETransacao;
}

export interface CreateCategoriaDTO {
  nome: string;
  tipo: TipoCategoriaETransacao;
}

export interface UpdateCategoriaDTO {
  id: string;
  nome: string;
}

export interface CategoriaResult {
  id: string;
  nome: string;
  tipo: TipoCategoriaETransacao;
}
