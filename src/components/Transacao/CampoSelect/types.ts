import type { IOptions } from "src/components/CampoSelect/types";


export interface PropsSelectServerComSusgestao {
  obterDados: (valorFiltro: string) => Promise<Array<any>>;
  labelObjeto?: string;
  valueObjeto?: any;
  emitirSomenteValor: boolean;
  multiselect?: boolean;
  defaultOptions?: Array<any> | Array<IOptions>;
}
