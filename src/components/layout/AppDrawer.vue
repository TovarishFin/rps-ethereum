<template>
  <v-navigation-drawer
    persistent
    v-model="drawerStatus"
    enable-resize-watcher
    fixed
    app
  >
    <v-list>
      <v-list-tile value="true" to="/account">
        <v-list-tile-action>
          <v-icon>account_circle</v-icon>
        </v-list-tile-action>

        <v-list-tile-content>
          <v-list-tile-title
            v-text="`My Account: ${shortenAddress(coinbase)}`"
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
          icon: 'mdi-coins',
          title: 'Play Money',
          to: '/play-money'
        },
        {
          icon: 'mdi-bank',
          title: 'Bank',
          to: '/bank'
        },
        {
          icon: 'mdi-rocket',
          title: 'Create Game',
          to: '/create-game'
        }
      ]
    }
  },
  methods: {
    ...mapActions(['setDrawer'])
  },
  computed: {
    ...mapGetters(['drawerOpen', 'coinbase']),
    drawerStatus: {
      get() {
        return this.drawerOpen
      },
      set(status) {
        this.setDrawer(status)
      }
    }
  }
}
</script>
