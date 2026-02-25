import { CreateIntanceAxios, handleErrorAxios } from 'src/services/api/AxiosHelper';
import type {
  Compartilhamento,
  CriarCompartilhamentoDTO,
  AtualizarPermissaoDTO,
  ResponderConviteDTO
} from 'src/models/Compartilhamento';
import axios from 'axios';

class CompartilhamentoService {
  private readonly baseURL = process.env.URL_API +'compartilhamento';
  private axios = CreateIntanceAxios();

  /**
   * Cria um novo convite de compartilhamento
   */
  async convidar(dto: CriarCompartilhamentoDTO): Promise<Compartilhamento> {
    const response = await this.axios.post<Compartilhamento>(this.baseURL, dto);
    return response.data;
  }

  /**
   * Lista todos os compartilhamentos feitos PELO usuário logado (ele é o dono)
   */
  async obterMeusCompartilhamentos(): Promise<Compartilhamento[]> {
    const response = await this.axios.get<Compartilhamento[]>(`${this.baseURL}/meus`);
    return response.data;
  }

  /**
   * Lista todos os convites recebidos PELO usuário logado
   */
  async obterConvitesRecebidos(): Promise<Compartilhamento[]> {
    const response = await this.axios.get<Compartilhamento[]>(`${this.baseURL}/convites`);
    return response.data;
  }

  /**
   * Aceita ou recusa um convite recebido
   */
  async responderConvite(dto: ResponderConviteDTO): Promise<void> {
    await this.axios.post(`${this.baseURL}/responder`, dto);
  }

  /**
   * Atualiza o nível de permissão de um compartilhamento existente
   */
  async atualizarPermissao(dto: AtualizarPermissaoDTO): Promise<void> {
    await this.axios.put(`${this.baseURL}/permissao`, dto);
  }

  /**
   * Revoga (exclui) um compartilhamento — somente o proprietário pode fazer
   */
  async revogar(compartilhamentoId: string): Promise<void> {
    await this.axios.delete(`${this.baseURL}/${compartilhamentoId}`);
  }
}

export default new CompartilhamentoService();
