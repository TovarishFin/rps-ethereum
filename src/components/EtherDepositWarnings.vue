<template>
  <span>
    <v-slide-y-transition>
      <v-card class="mt-4 mb-4" v-if="!hideEtherDepositWarnings">
        <v-card-title class="display-1"
          >⚠️ Important Information about Ether Deposits ⚠️</v-card-title
        >
        <v-card-text>
          <p class="headline">Please Read!</p>

          <p class="title font-weight-bold">
            Ether in Exchange for Wrapped Ether Tokens (weth)
          </p>
          <p>
            When depositing ether, you are depositing the WrappedEther contract.
            This is a contract which tokenizes ether and allows it to act in the
            same way as other tokens. This contract is generally thought to be
            secure smart contract. You can find more information about
            WrappedEther <a href="https://weth.io/">here</a>
          </p>

          <p class="title font-weight-bold">What to do with weth?</p>
          <p>
            Once you have deposited ether and received weth, you can use it as
            you would any other token. Once deposited, you should see the token
            appear in your tokens display on this site. You can then use it for
            playing.
          </p>

          <p class="title font-weight-bold">How do I get my ether back?!</p>
          <p>
            Simply withdraw on the ether page. This will remove your weth tokens
            and give you the matching ether amount. You can also withdraw the
            tokens themselves in case you wish to keep the tokens and/or use
            them with some other decentralized application.
          </p>

          <p class="headline font-weight-bold">Optional Reading</p>

          <p class="font-italic font-weight-bold">
            Why did you use WrappedEther?
          </p>
          <p>
            Using WrappedEther allows for vastly simplifying the smart contracts
            by having to only create functions for tokens rather than tokens AND
            ether. This results in a more secure and gas efficient smart
            contract.
          </p>
        </v-card-text>
      </v-card>
    </v-slide-y-transition>

    <v-checkbox
      label="Hide Ether Deposit Warnings"
      v-model="hideEtherDepositWarningsComputed"
    />
  </span>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import * as VCheckbox from 'vuetify/es5/components/VCheckbox'
import * as VCard from 'vuetify/es5/components/VCard'

export default {
  components: {
    ...VCheckbox,
    ...VCard
  },
  methods: {
    ...mapActions(['setHideEtherDepositWarnings'])
  },
  computed: {
    ...mapGetters(['hideEtherDepositWarnings']),
    hideEtherDepositWarningsComputed: {
      get() {
        return this.hideEtherDepositWarnings
      },
      set(value) {
        this.setHideEtherDepositWarnings(value)
      }
    }
  }
}
</script>
