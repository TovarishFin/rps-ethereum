<template>
  <component :is="page" />
</template>

<script>
import { mapGetters } from 'vuex'
import NoWeb3 from './NoWeb3.vue'
import NoAccount from './NoAccount.vue'
import NotVoter from './NotVoter.vue'

/* eslint-disable vue/no-unused-components */
export default {
  components: {
    NoWeb3,
    NoAccount,
    NotVoter
  },
  computed: {
    ...mapGetters([
      'coinbaseReady',
      'web3Ready',
      'coinbaseIsVoter',
      'ethReady'
    ]),
    page() {
      switch (true) {
        case !this.web3Ready || !this.ethReady:
          return NoWeb3

        case !this.coinbaseReady:
          return NoAccount

        case !this.coinbaseIsVoter:
          return NotVoter

        default:
          return 'router-view'
      }
    }
  }
}
</script>
