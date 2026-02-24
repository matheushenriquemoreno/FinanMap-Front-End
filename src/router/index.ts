import { defineRouter } from '#q-app/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import routes from './routes';
import { isTokenExpired } from '../helpers/JwtHelper';
import { refreshTokenManager } from '../services/RefreshTokenManager';

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory);

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  Router.beforeEach(async (to, from, next) => {
    const publicPages = ['/login', '/register', '/verify'];
    const authRequired = !publicPages.includes(to.path);
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');

    if (authRequired) {
      if (!token) {
        return next({ name: 'LoginPage' });
      }

      const isExpired = isTokenExpired(token);

      if (isExpired) {
        if (refreshToken) {
          try {
            // Usa o RefreshTokenManager que garante apenas um refresh por vez
            await refreshTokenManager.refreshIfNeeded();
            return next();
          } catch (error) {
            // Falha no refresh. Verifica se deve limpar o token
            if (refreshTokenManager.shouldClearTokenOnRefreshError(error)) {
              refreshTokenManager.clearTokens();
              return next({ name: 'LoginPage' });
            } else {
              // Erro de rede ou servidor (500), permite prosseguir (a requisição deve falhar no componente e mostrar erro genérico)
              return next();
            }
          }
        } else {
          // Token expirado e sem refresh token
          return next({ name: 'LoginPage' });
        }
      }
    }

    next();
  });

  return Router;
});

