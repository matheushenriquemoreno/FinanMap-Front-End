import { handleErrorAxios, CreateIntanceAxios } from 'src/services/api/AxiosHelper';
import type { TipoCategoriaETransacao } from 'src/Model/Categoria';

export default async function ObterSusgestaoCategorias(
  tipoCategoria: TipoCategoriaETransacao,
  nomeItemCadastro: string,
): Promise<string[]> {
  const api = CreateIntanceAxios();
  try {
    const response = await api.get<string[]>(
      process.env.URL_API + 'Categorias/Apoio/SugestoesCategoria',
      {
        params: {
          tipoCategoria: tipoCategoria,
          nomeItemCadastro: nomeItemCadastro,
        },
      },
    );
    return response.data;
  } catch (error) {
    handleErrorAxios(error);
    throw error;
  }
}
