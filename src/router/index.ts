import { defineRouter } from '#q-app/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import routes from './routes';

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
            // Importação dinâmica para evitar dependência circular
            const { obterAuthService } = await import('../services/AuthService');
            const authService = obterAuthService();
            const result = await authService.refreshToken(refreshToken);

            localStorage.setItem('token', result.token);
            localStorage.setItem('refreshToken', result.refreshToken);
            if (result.nomeUsuario) {
              localStorage.setItem('userName', result.nomeUsuario);
            }
            return next();
          } catch (error) {
            // Falha no refresh, redirecionar para login
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userName');
            return next({ name: 'LoginPage' });
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

function parseJwt(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    let base64Url = parts[1] ?? '';
    const padding = base64Url.length % 4;
    if (padding) {
      base64Url += '='.repeat(4 - padding);
    }
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

const MILLISECONDS_TO_SECONDS = 1000;
const TOKEN_REFRESH_THRESHOLD_SECONDS = 300; // 5 minutos antes de expirar

function isTokenExpired(token: string): boolean {
  const decoded = parseJwt(token);
  if (!decoded || !decoded.exp) {
    return true; // Se não conseguir decodificar, considera expirado
  }

  const currentTime = Date.now() / MILLISECONDS_TO_SECONDS;
  return decoded.exp < currentTime + TOKEN_REFRESH_THRESHOLD_SECONDS;
}
