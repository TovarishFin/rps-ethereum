<template>
  <v-dialog v-model="web3RequestOpenModel" persistent width="500">
    <v-card>
      <v-card-title class="headline primary" primary-title>
        Enable MetaMask
      </v-card-title>

      <v-card-text>
        This is a Decentralized Application. It needs MetaMask in order to
        interact with the blockchain. Please click "ENABLE METAMASK" below. You
        will be prompted by MetaMask, click confirm and you will be ready to go.
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="continueWithoutPermission" color="secondary">
          Don't Enable MetaMask
        </v-btn>
        <v-btn @click="continueWithPermission" color="primary">
          Enable MetaMask
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import * as VDialog from 'vuetify/es5/components/VDialog'
import * as VCard from 'vuetify/es5/components/VCard'
import * as VDivider from 'vuetify/es5/components/VDivider'

export default {
  components: {
    ...VDialog,
    ...VCard,
    ...VDivider
  },
  computed: {
    ...mapGetters(['web3RequestOpen']),
    web3RequestOpenModel: {
      get() {
        return this.web3RequestOpen
      },
      set(web3RequestOpen) {
        this.setWeb3RequestOpen(web3RequestOpen)
      }
    }
  },
  methods: {
    ...mapActions(['setWeb3RequestOpen', 'getWeb3Access']),
    continueWithPermission() {
      this.getWeb3Access()
      this.setWeb3RequestOpen(false)
    },
    continueWithoutPermission() {
      this.setWeb3RequestOpen(false)
    }
  }
}
</script>
