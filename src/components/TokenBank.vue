<template>
  <span>
    <token-deposit-warnings />
    <token-data-of />
    <v-form ref="deposit-form" class="pt-4 pb-4">
      <p class="display-1">Deposit Tokens</p>
      <v-combobox
        v-model="tokenAddress"
        :items="tokenDataArray"
        item-text="symbol"
        item-value="address"
        label="Token Address"
        :placeholder="addressZero"
        :rules="addressRules"
        :return-object="false"
        required
      />
      <v-text-field
        v-model="depositAmount"
        label="Deposit Amount"
        placeholder="0"
        type="number"
        :rules="valueDepositRules"
        required
      />
      <eth-button-wrapper>
        <v-btn @click="deposit">deposit tokens</v-btn>
      </eth-button-wrapper>
      <v-btn @click="setFullBalance">set full balance</v-btn>
      <v-btn @click="clearDeposit">clear</v-btn>
    </v-form>

    <v-form ref="withdraw-form" class="pt-4 pb-4">
      <p class="display-1">Withdraw Tokens</p>
      <v-combobox
        v-model="tokenAddress"
        :items="tokenDataArray"
        item-text="symbol"
        item-value="address"
        label="Token Address"
        :placeholder="addressZero"
        :rules="addressRules"
        :return-object="false"
        required
      />
      <v-text-field
        v-model="withdrawAmount"
        label="Withdraw Amount"
        placeholder="0"
        type="number"
        :rules="valueWithdrawRules"
        required
      />
      <eth-button-wrapper>
        <v-btn @click="withdraw">withdraw tokens</v-btn>
      </eth-button-wrapper>
      <v-btn @click="setFullDepositedBalance">set full balance</v-btn>
      <v-btn @click="clearWithdraw">clear</v-btn>
    </v-form>
  </span>
</template>
<script>
import { toBN } from 'web3-utils'
import { mapGetters, mapActions } from 'vuex'
import * as VForm from 'vuetify/es5/components/VForm'
import * as VTextField from 'vuetify/es5/components/VTextField'
import * as VBtn from 'vuetify/es5/components/VBtn'
import * as VCheckbox from 'vuetify/es5/components/VCheckbox'
import * as VCombobox from 'vuetify/es5/components/VCombobox'
import TokenDataOf from '@/components/TokenDataOf.vue'
import TokenDepositWarnings from '@/components/TokenDepositWarnings'

export default {
  components: {
    ...VTextField,
    ...VForm,
    ...VBtn,
    ...VCheckbox,
    ...VCombobox,
    TokenDataOf,
    TokenDepositWarnings
  },
  data() {
    return {
      depositAmount: 0,
      withdrawAmount: 0,
      addressRules: [v => this.isAddress(v) || 'must be a valid address'],
      valueDepositRules: [
        v => {
          const wei = this.ethToWei(v)
          return (
            (!wei.isZero() && wei.lte(toBN(this.tokenData.balance))) ||
            'must be non zero value and less than or equal to your token balance'
          )
        }
      ],
      valueWithdrawRules: [
        v => {
          const wei = this.ethToWei(v)
          return (
            (!wei.isZero() && wei.lte(toBN(this.tokenData.depositedBalance))) ||
            'must be non zero value and less than or equal to your deposited token balance'
          )
        }
      ]
    }
  },
  computed: {
    ...mapGetters(['selectedTokenAddress', 'tokenDataOf', 'tokenDataArray']),
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
      'batchDepositTokens',
      'withdrawTokens',
      'createNotification'
    ]),
    clearDeposit() {
      this.$refs['deposit-form'].reset()
    },
    clearWithdraw() {
      this.$refs['withdraw-form'].reset()
    },
    setFullBalance() {
      this.depositAmount = this.weiToEth(this.tokenData.balance)
    },
    setFullDepositedBalance() {
      this.withdrawAmount = this.weiToEth(this.tokenData.depositedBalance)
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
  }
}
</script>
