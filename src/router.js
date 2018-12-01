import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/pages/Home.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
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
      path: '/no-account',
      name: 'No Account',
      component: () => import('./components/layout/NoAccount.vue')
    },
    {
      path: '/no-web3',
      name: 'No Web3',
      component: () => import('./components/layout/NoWeb3.vue')
    },
    {
      path: '*',
      name: 'Not Found',
      component: () => import('./components/layout/NotFound.vue')
    }
  ]
})
