import type { AvatarId, UsuarioPerfil } from 'src/models/Usuario';
import { CreateIntanceAxios, handleErrorAxios } from 'src/services/api/AxiosHelper';

class UsuarioService {
  private readonly axios = CreateIntanceAxios();
  private readonly baseUrl = process.env.URL_API + 'user';

  async obterPerfil(): Promise<UsuarioPerfil> {
    try {
      const response = await this.axios.get<UsuarioPerfil>(this.baseUrl);
      return response.data;
    } catch (error) {
      handleErrorAxios(error);
      throw error;
    }
  }

  async atualizarAvatar(avatarId: AvatarId): Promise<{ avatarId: AvatarId }> {
    try {
      const response = await this.axios.put<{ avatarId: AvatarId }>(`${this.baseUrl}/avatar`, {
        avatarId,
      });
      return response.data;
    } catch (error) {
      handleErrorAxios(error);
      throw error;
    }
  }
}

export default new UsuarioService();
