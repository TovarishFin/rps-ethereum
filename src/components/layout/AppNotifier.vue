<template>
  <v-snackbar v-model="notificationStatus" multi-line :timeout="0">
    {{ notificationMessage }}
    <v-btn flat @click="dismissNotification"> close </v-btn>
  </v-snackbar>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  computed: {
    ...mapGetters(['notificationOpen', 'notificationMessage']),
    notificationStatus: {
      get() {
        return this.notificationOpen
      },
      set(status) {
        this.setNotificationOpen(status)
      }
    }
  },
  methods: {
    ...mapActions(['setNotificationOpen', 'dismissNotification'])
  }
}
</script>
