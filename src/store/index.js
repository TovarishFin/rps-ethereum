import Vue from 'vue'
import Vuex, { Store } from 'vuex'
import VuexPersistence from 'vuex-persist'
import network from './network'
import layout from './layout'
import route from './route'
import bank from './bank'
import rockPaperScissors from './rockPaperScissors'
import contractEvents from './contractEvents'
import stateWatchers from './plugins/stateWatchers'

Vue.use(Vuex)

const vuexLocal = new VuexPersistence({
  storage: window.localStorage,
  reducer: state => ({
    rockPaperScissors: {
      referrer: state.rockPaperScissors.referrer,
      choiceCommits: state.rockPaperScissors.choiceCommits
    },
    layout: {
      hideTokenDepositWarnings: state.layout.hideTokenDepositWarnings,
      hideEtherDepositWarnings: state.layout.hideEtherDepositWarnings
    }
  })
})

export default new Store({
  state: {},
  getters: {},
  mutations: {},
  actions: {},
  modules: {
    network,
    layout,
    route,
    bank,
    rockPaperScissors,
    contractEvents
  },
  plugins: [stateWatchers, vuexLocal.plugin]
})
