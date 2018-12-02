import Vue from 'vue'
import Vuex, { Store } from 'vuex'
import network from './network'
import layout from './layout'
import route from './route'
import bank from './bank'
import stateWatchers from './plugins/stateWatchers'

Vue.use(Vuex)

export default new Store({
  state: {},
  getters: {},
  mutations: {},
  actions: {},
  modules: {
    network,
    layout,
    route,
    bank
  },
  plugins: [stateWatchers]
})
