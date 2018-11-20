<template>
  <v-toolbar app>
    <v-toolbar-side-icon @click.stop="toggleDrawer"></v-toolbar-side-icon>
    <v-toolbar-title v-text="title"></v-toolbar-title>
  </v-toolbar>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  methods: {
    ...mapActions(['toggleDrawer'])
  },
  computed: {
    ...mapGetters(['name']),
    title() {
      return this.name
    }
  }
}
</script>
