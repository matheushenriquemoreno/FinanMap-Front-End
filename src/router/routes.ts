import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: "LoginPage",
    component: () => import('src/pages/Autenticacao/LoginPage.vue'),
  },
  {
    path: '/register',
    component: () => import('src/pages/Autenticacao/CadastroPage.vue'),
  },
  {
    path: '/verify',
    component: () => import('src/pages/Autenticacao/ConfirmarEmailPage.vue'),
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '', name: 'MesAMes', component: () => import('pages/GerenciamentoMensal/GerenciamentoMensalPageIndex.vue'),
        children: [
          {
            path: '',
            name: 'RecebimentosPage',
            component: () => import('pages/GerenciamentoMensal/RecebimentosPage.vue')
          },
          {
            path: 'Despesas',
            name: 'DespesaPage',
            component: () => import('pages/GerenciamentoMensal/DespesaPage.vue')
          },
          {
            path: 'Investimentos',
            name: 'InvestimentoPage',
            component: () => import('pages/GerenciamentoMensal/InvestimentoPage.vue')
          },
        ]
      }],
  },
];

export default routes;
