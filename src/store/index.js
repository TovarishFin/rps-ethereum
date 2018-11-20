import Vue from 'vue'
import Vuex, { Store } from 'vuex'
import network from './network'
import layout from './layout'
import route from './route'

Vue.use(Vuex)

export default new Store({
  state: {},
  getters: {},
  mutations: {},
  actions: {},
  modules: {
    network,
    layout,
    route
  }
})
