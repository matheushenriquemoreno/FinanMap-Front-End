export interface IOptions {
  label: string;
  value: number | string;
}

export interface PropsSelectServer {
  labelObjeto?: string;
  valueObjeto?: string;
  emitirSomenteValor: boolean;
  multiselect?: boolean;
  defaultOptions?: unknown[] | IOptions[];
  obterDados: (valorFiltro: string) => Promise<unknown[]>;
}
