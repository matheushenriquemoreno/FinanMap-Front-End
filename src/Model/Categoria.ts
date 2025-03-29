
export enum TipoCategoria {
  Despesa = "Despesa",
  Rendimento = "Rendimento",
  Investimento = "Investimento"
}


export interface Categoria {
  id: string;
  nome: string;
  tipo: TipoCategoria;
}
