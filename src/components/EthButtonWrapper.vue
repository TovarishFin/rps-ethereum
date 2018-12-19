<template>
  <span @click="checkRequestAccess"><slot></slot></span>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import * as VBtn from 'vuetify/es5/components/VBtn'

export default {
  components: {
    ...VBtn
  },
  computed: {
    ...mapGetters(['hasGrantedWeb3Access'])
  },
  methods: {
    ...mapActions(['setWeb3RequestOpen']),
    checkRequestAccess() {
      if (!this.hasGrantedWeb3Access) {
        this.setWeb3RequestOpen(true)
      }
    }
  }
}
</script>
