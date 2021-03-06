import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('@/components/pages/Home.vue')
    },
    {
      path: '/about',
      name: 'About',
      component: () => import('@/components/pages/About.vue')
    },
    {
      path: '/bank',
      name: 'Bank',
      component: () => import('@/components/pages/Bank.vue')
    },
    {
      path: '/play-money',
      name: 'PlayMoney',
      component: () => import('@/components/pages/PlayMoney.vue')
    },
    {
      path: '/game/:gameId',
      name: 'Game',
      component: () => import('@/components/pages/Game.vue')
    },
    {
      path: '/my-tokens',
      name: 'My Tokens',
      component: () => import('@/components/pages/AccountTokenTransactions')
    },
    {
      path: '/my-games',
      name: 'My Games',
      component: () => import('@/components/pages/AccountGames')
    },
    {
      path: '/my-referrals',
      name: 'My Referrals',
      component: () => import('@/components/pages/AccountReferrals')
    },
    {
      path: '/no-account',
      name: 'No Account',
      component: () => import('@/components/layout/NoAccount.vue')
    },
    {
      path: '/no-web3',
      name: 'No Web3',
      component: () => import('@/components/layout/NoWeb3.vue')
    },
    {
      path: '*',
      name: 'Not Found',
      component: () => import('@/components/layout/NotFound.vue')
    }
  ]
})
