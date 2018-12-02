<template>
  <v-app dark>
    <app-drawer />
    <app-toolbar />

    <v-content>
      <v-container fluid>
        <v-slide-y-transition mode="out-in">
          <!-- <router-view /> -->
          <router-handler />
        </v-slide-y-transition>
      </v-container>
    </v-content>

    <app-notifier />

    <app-footer />
  </v-app>
</template>

<script>
import AppDrawer from './components/layout/AppDrawer.vue'
import AppToolbar from './components/layout/AppToolbar.vue'
import AppFooter from './components/layout/AppFooter.vue'
import AppNotifier from './components/layout/AppNotifier.vue'
import RouterHandler from './components/layout/RouterHandler.vue'
import store from './store'

export default {
  components: {
    AppDrawer,
    AppToolbar,
    AppFooter,
    AppNotifier,
    RouterHandler
  },
  beforeCreate() {
    store.dispatch('bootstrapEth')
  }
}
</script>
