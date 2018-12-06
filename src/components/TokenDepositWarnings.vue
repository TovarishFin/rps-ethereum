<template>
  <span>
    <v-slide-y-transition>
      <v-card class="mt-4 mb-4" v-if="!hideTokenDepositWarnings">
        <v-card-title class="display-1"
          >⚠️ Important Information about Token Deposits ⚠️</v-card-title
        >
        <v-card-text>
          <p class="headline">Please Read!</p>

          <p class="title font-weight-bold">ERC20 Token Requirements</p>
          <p>
            In order to use an ERC20 token to play, it must meet the following
            requirements: <b>have a name</b>, <b>have a symbol</b>,
            <b>use 18 decimals</b>,
            <b>implement all other ERC20 functionality</b>.
          </p>

          <p class="title font-weight-bold">
            Make sure to confirm both transactions in MetaMask!
          </p>
          <p>
            You will need to confirm two transactions in MetaMask for token
            deposits instead of the regular single transaction. This means that
            you will need to click "confirm" twice when MetaMask pops up.
          </p>

          <p class="title font-weight-bold">
            Don't worry about MetaMask's warning about a transaction possibly
            failing!
          </p>
          <p>
            Metamask might warn that the second transaction will fail. Ignore
            this and confirm it. It should go through fine.
          </p>

          <p class="title font-weight-bold">Withdraw Tokens at Any Time!</p>
          <p>
            Any tokens which have not been committed to playing by joining or
            creating a game can be withdrawn back to your account at any time.
            There are no fees charged for deposits or withdrawals.
          </p>

          <p class="headline font-weight-bold">Optional Reading</p>

          <p class="font-italic font-weight-bold">
            Why do I need to do two transactions?
          </p>
          <p>
            For those that are curious what the two transactions are doing, they
            are doing two things. The first transaction allows the Bank smart
            contract to control the specified amount of tokens you give in the
            form. The second transaction transfers the specified amount of
            tokens to the Bank contract. From there, tokens can be freely used
            for playing.
          </p>

          <p class="font-italic font-weight-bold">
            Why does MetaMask warn about a possibly failing transaction?
          </p>

          <p>
            The reason that MetaMask might warn about a failing transaction is
            because it is trying to do two transactions. The second transaction
            relies on the first transaction succeeding. Both should go through
            just fine.s
          </p>

          <p class="font-italic font-weight-bold">
            Why did you make it complicated like this!?
          </p>
          <p>
            Unfortunately, there is not proven safe standard way of transferring
            ERC20 tokens in a single transaction. This hopefully will change in
            the near future! Sorry about that!
          </p>
        </v-card-text>
      </v-card>
    </v-slide-y-transition>

    <v-checkbox
      label="Hide Token Deposit Warnings"
      v-model="hideTokenDepositWarningsComputed"
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
    ...mapActions(['setHideTokenDepositWarnings'])
  },
  computed: {
    ...mapGetters(['hideTokenDepositWarnings']),
    hideTokenDepositWarningsComputed: {
      get() {
        return this.hideTokenDepositWarnings
      },
      set(value) {
        this.setHideTokenDepositWarnings(value)
      }
    }
  }
}
</script>
