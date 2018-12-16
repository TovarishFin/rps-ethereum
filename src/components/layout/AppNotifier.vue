<template>
  <v-snackbar v-model="notificationStatus" multi-line :timeout="0">
    {{ notificationMessage }}
    <v-btn flat @click="dismissNotification"> close </v-btn>
  </v-snackbar>
</template>

<script>
import * as VSnackbar from 'vuetify/es5/components/VSnackbar'
import * as VBtn from 'vuetify/es5/components/VBtn'
import { mapGetters, mapActions } from 'vuex'

export default {
  components: {
    ...VSnackbar,
    ...VBtn
  },
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
