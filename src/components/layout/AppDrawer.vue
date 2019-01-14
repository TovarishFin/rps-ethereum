<template>
  <v-navigation-drawer
    persistent
    v-model="drawerStatus"
    enable-resize-watcher
    fixed
    app
  >
    <v-list>
      <v-list-tile
        value="true"
        v-for="(item, i) in items"
        :to="item.to"
        :key="`item-${i}`"
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
import * as VList from 'vuetify/es5/components/VList'

export default {
  components: {
    ...VList
  },
  data() {
    return {
      items: [
        {
          icon: 'mdi-rocket',
          title: 'Play',
          to: '/'
        },
        {
          icon: 'mdi-account-circle',
          title: 'My Games',
          to: '/my-games'
        },
        {
          icon: 'mdi-bank',
          title: 'Bank',
          to: '/bank'
        },
        {
          icon: 'mdi-coins',
          title: 'Play Money',
          to: '/play-money'
        },
        {
          icon: 'mdi-account-circle',
          title: 'My Tokens',
          to: '/my-tokens'
        },
        {
          icon: 'mdi-account-circle',
          title: 'My Referrals',
          to: '/my-referrals'
        },
        {
          icon: 'info',
          title: 'About',
          to: '/about'
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
