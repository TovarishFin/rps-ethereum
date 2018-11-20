import '@babel/polyfill'
import Vue from 'vue'
import './plugins/vuetify'
import App from './App.vue'
import router from './router'
import store from './store'
import ethereumHelpers from './mixins/ethereumHelpers'
import '@mdi/font/css/materialdesignicons.css'
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import { sync } from 'vuex-router-sync'

Vue.config.productionTip = false

Vue.mixin(ethereumHelpers)

sync(store, router)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
