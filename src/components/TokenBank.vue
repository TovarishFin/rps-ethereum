<template>
  <span>
    <token-deposit-warnings />
    <token-data-of />
    <v-form ref="deposit-form" class="pt-4 pb-4">
      <p class="display-1">Deposit Tokens</p>
      <v-text-field
        v-model="tokenAddress"
        label="Token Address"
        :placeholder="addressZero"
        type="text"
        :rules="addressRules"
        required
      />
      <v-text-field
        v-model="depositAmount"
        label="Deposit Amount"
        placeholder="0"
        type="number"
        :rules="valueRules"
        required
      />
      <v-btn @click="deposit">deposit tokens</v-btn>
      <v-btn @click="clearDeposit">clear</v-btn>
    </v-form>

    <v-form ref="withdraw-form" class="pt-4 pb-4">
      <p class="display-1">Withdraw Tokens</p>
      <v-text-field
        v-model="tokenAddress"
        label="Token Address"
        :placeholder="addressZero"
        type="text"
        :rules="addressRules"
        required
      />
      <v-text-field
        v-model="withdrawAmount"
        label="Withdraw Amount"
        placeholder="0"
        type="number"
        :rules="valueRules"
        required
      />
      <v-btn @click="withdraw">deposit tokens</v-btn>
      <v-btn @click="clearWithdraw">clear</v-btn>
    </v-form>
  </span>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'
import * as VForm from 'vuetify/es5/components/VForm'
import * as VTextField from 'vuetify/es5/components/VTextField'
import * as VBtn from 'vuetify/es5/components/VBtn'
import * as VCheckbox from 'vuetify/es5/components/VCheckbox'
import TokenDataOf from './TokenDataOf.vue'
import TokenDepositWarnings from './TokenDepositWarnings'
import { toBN } from 'web3-utils'

export default {
  components: {
    ...VTextField,
    ...VForm,
    ...VBtn,
    ...VCheckbox,
    TokenDataOf,
    TokenDepositWarnings
  },
  data() {
    return {
      addressRules: [v => this.isAddress(v) || 'must be a valid address'],
      valueRules: [
        v => {
          const wei = this.ethToWei(v)
          // console.log(wei, wei.toString(), wei.gt(0))
          return (
            (!wei.isZero() && wei.lte(toBN(this.tokenData.balance))) ||
            'must be non zero value and less than or equal to your token balance'
          )
        }
      ],
      depositAmount: 0,
      withdrawAmount: 0
    }
  },
  computed: {
    ...mapGetters(['selectedTokenAddress', 'tokenDataOf']),
    tokenAddress: {
      get() {
        return this.selectedTokenAddress
      },
      set(value) {
        this.setSelectedTokenAddress(value)
      }
    },
    tokenData() {
      return this.tokenDataOf(this.tokenAddress)
    }
  },
  methods: {
    ...mapActions([
      'setSelectedTokenAddress',
      'getTokenDataOf',
      'batchDepositTokens',
      'withdrawTokens',
      'createNotification'
    ]),
    clearDeposit() {
      this.depositAmount = 0
    },
    clearWithdraw() {
      this.withdrawAmount = 0
    },
    deposit() {
      if (this.$refs['deposit-form'].validate()) {
        if (this.tokenData.decimals !== '18') {
          this.createNotification(
            'Tokens must use 18 decimals in order to be used.'
          )

          return
        }

        this.batchDepositTokens({
          tokenAddress: this.tokenAddress,
          value: this.ethToWei(this.depositAmount)
        })
        this.clearDeposit()
      }
    },
    withdraw() {
      if (this.$refs['withdraw-form'].validate()) {
        this.withdrawTokens({
          tokenAddress: this.tokenAddress,
          value: this.ethToWei(this.withdrawAmount)
        })
        this.clearWithdraw()
      }
    }
  },
  watch: {
    tokenAddress() {
      if (this.isAddress(this.tokenAddress)) {
        this.getTokenDataOf(this.tokenAddress)
      }
    }
  }
}
</script>
