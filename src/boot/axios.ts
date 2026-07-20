import { defineBoot } from '#q-app/wrappers';
import type { AxiosInstance } from 'axios';
import { tokenRenewalService } from '../services/TokenRenewalService';
import { apiClient } from '../services/api/AxiosHelper';

declare module 'vue' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}

export default defineBoot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = apiClient;
  app.config.globalProperties.$api = apiClient;
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API

  // Inicia o serviço de renovação automática de token
  tokenRenewalService.start();
});

export { apiClient as api };
