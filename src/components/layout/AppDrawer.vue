<template>
  <v-navigation-drawer
    persistent
    v-model="drawerStatus"
    enable-resize-watcher
    fixed
    app
  >
    <v-list>
      <v-list-tile value="true" target="_blank" :href="coinbaseLink">
        <v-list-tile-action>
          <v-icon>account_circle</v-icon>
        </v-list-tile-action>

        <v-list-tile-content>
          <v-list-tile-title
            v-text="`Account: ${shortenAddress(coinbase)}`"
          ></v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>

      <v-list-tile
        value="true"
        v-for="(item, i) in items"
        :to="item.to"
        :key="`nonVoterItems${i}`"
      >
        <v-list-tile-action>
          <v-icon v-html="item.icon"></v-icon>
        </v-list-tile-action>

        <v-list-tile-content>
          <v-list-tile-title v-text="item.title"></v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  data() {
    return {
      items: [
        {
          icon: 'home',
          title: 'Home',
          to: '/'
        },
        {
          icon: 'info',
          title: 'About',
          to: '/about'
        },
        {
          icon: 'mdi-bank',
          title: 'Bank',
          to: '/bank'
        }
      ]
    }
  },
  methods: {
    ...mapActions(['setDrawer'])
  },
  computed: {
    ...mapGetters(['drawerOpen', 'coinbase', 'network']),
    drawerStatus: {
      get() {
        return this.drawerOpen
      },
      set(status) {
        this.setDrawer(status)
      }
    },
    coinbaseLink() {
      switch (this.network) {
        case 3:
          return `https://ropsten.etherscan.io/address/${this.coinbase}`
        case 4:
          return `https://rinkeby.etherscan.io/address/${this.coinbase}`
        case 42:
          return `https://kovan.etherscan.io/address/${this.coinbase}`
        case 1:
          return `https://etherscan.io/address/${this.coinbase}`
        default:
          return `https://etherscan.io/address/${this.coinbase}`
      }
    }
  }
}
</script>
