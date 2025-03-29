import { handleErrorAxios, CreateIntanceAxios } from 'src/helpers/api/AxiosHelper';
import type { TipoCategoria } from 'src/Model/Categoria';
import type { AcumuladoMensal } from 'src/Model/Transacao';

export async function obterAcumuladoMensalReport(ano: number, mes: number, tipoCategoria: TipoCategoria): Promise<AcumuladoMensal> {
  const api = CreateIntanceAxios();
  try {
    const response = await api.get<AcumuladoMensal>(process.env.URL_API + 'AcumuladoMensalReport/AcumuladoMensal', {
      params: {
        ano,
        mes,
        tipo: tipoCategoria
      },
    });
    return response.data;
  } catch (error) {
    handleErrorAxios(error);
    throw error;
  }
}
