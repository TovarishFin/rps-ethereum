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

    <app-modal />

    <app-footer />
  </v-app>
</template>

<script>
import { mapGetters } from 'vuex'
import AppDrawer from '@/components/layout/AppDrawer'
import AppToolbar from '@/components/layout/AppToolbar'
import AppFooter from '@/components/layout/AppFooter'
import AppNotifier from '@/components/layout/AppNotifier'
import AppModal from '@/components/layout/AppModal'
import RouterHandler from '@/components/layout/RouterHandler'
import store from '@/store'

export default {
  components: {
    AppDrawer,
    AppToolbar,
    AppFooter,
    AppNotifier,
    AppModal,
    RouterHandler
  },
  computed: {
    ...mapGetters(['hasGrantedWeb3Permission'])
  },
  beforeCreate() {
    store.dispatch('bootstrapEth')
  },
  watch: {
    $route() {
      const coinbaseReferrer = this.$route.query.ref
      if (this.isAddress(coinbaseReferrer)) {
        store.dispatch('setCoinbaseReferrer', coinbaseReferrer)
      }
    }
  }
}
</script>
