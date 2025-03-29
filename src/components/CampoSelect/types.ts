export interface IOptions {
  label: string;
  value: number | string;
}


export interface PropsSelectServer {
  labelObjeto?: string;
  valueObjeto?: any;
  emitirSomenteValor: boolean;
  multiselect?: boolean;
  defaultOptions?: Array<any> | Array<IOptions>;
  obterDados: (valorFiltro: string) => Promise<Array<any>>;
}
