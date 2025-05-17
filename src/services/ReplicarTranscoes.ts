import { CreateIntanceAxios, handleErrorAxios } from "src/helpers/api/AxiosHelper";
import { notificar } from "src/helpers/Notificacao";
import type { TipoCategoriaETransacao } from "src/Model/Categoria";
import type { ReplicarTransacoesPeriodo } from "src/Model/CriarRegistro";

export default async function replicarTransacoesPorPeriodo(idRegistros: string[], dataInicial: Date, dataFinal: Date, tipocategoria: TipoCategoriaETransacao) {
  const axios = CreateIntanceAxios();

  const replica: ReplicarTransacoesPeriodo = {
    idRegistros: idRegistros,
    periodoInicial: dataInicial,
    periodoFinal: dataFinal,
    tipoTransacao: tipocategoria,
  };

  try {
    await axios.post(`${process.env.URL_API}ReplicarTransacao/Periodo`, replica);
    notificar('Registros replicados com sucesso para o período informado!');
  } catch (error) {
    handleErrorAxios(error);
    throw error;
  }
}

