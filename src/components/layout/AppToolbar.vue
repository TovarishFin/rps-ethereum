<template>
  <v-toolbar app>
    <v-toolbar-side-icon @click.stop="toggleDrawer"></v-toolbar-side-icon>
    <v-toolbar-title v-text="name"></v-toolbar-title>
    <v-spacer />
    <v-progress-circular v-show="hasPendingTxs" indeterminate color="primary" />
    <v-btn @click="toggleShowTransactions" color="secondary">
      {{ showTransactionsText }}
    </v-btn>
  </v-toolbar>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import * as VProgressCircular from 'vuetify/es5/components/VProgressCircular'
import * as VBtn from 'vuetify/es5/components/VBtn'

export default {
  components: {
    ...VProgressCircular,
    ...VBtn
  },
  computed: {
    ...mapGetters(['name', 'hasPendingTxs', 'showTransactions']),
    showTransactionsText() {
      return this.showTransactions
        ? `hide ${this.hasPendingTxs ? ' pending' : ''} transactions`
        : `show ${this.hasPendingTxs ? ' pending' : ''} transactions`
    }
  },
  methods: {
    ...mapActions(['toggleDrawer', 'setShowTransactions']),
    toggleShowTransactions() {
      this.setShowTransactions(!this.showTransactions)
    }
  }
}
</script>
