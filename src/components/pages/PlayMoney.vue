<template>
  <span>
    <token-data-of />
    <eth-button-wrapper>
      <v-btn @click="mintTestToken">Give me 5 TST</v-btn>
    </eth-button-wrapper>
  </span>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import * as VBtn from 'vuetify/es5/components/VBtn'
import TokenDataOf from '../TokenDataOf'

export default {
  components: {
    ...VBtn,
    TokenDataOf
  },
  computed: {
    ...mapGetters(['testToken'])
  },
  methods: {
    ...mapActions(['setSelectedTokenAddress', 'mintTestToken'])
  },
  created() {
    this.setSelectedTokenAddress(this.testToken._address)
  },
  watch: {
    $route: 'this.setSelectedTokenAddress(this.testToken._address)'
  }
}
</script>
