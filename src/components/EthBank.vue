<template>
  <span>
    <ether-deposit-warnings />
    <v-form ref="deposit-form" class="pt-4 pb-4">
      <p class="display-1">Deposit Ether</p>
      <v-text-field
        v-model="depositAmount"
        label="Deposit Amount"
        placeholder="0"
        :rules="valueRules"
        type="number"
        required
      />
      <eth-button-wrapper>
        <v-btn @click="deposit">deposit ether</v-btn>
      </eth-button-wrapper>
      <v-btn @click="clearDeposit">clear</v-btn>
    </v-form>
    <v-form ref="withdraw-form" class="pt-4 pb-4">
      <p class="display-1">Withdraw Ether</p>
      <v-text-field
        v-model="withdrawAmount"
        label="Withdraw Amount"
        placeholder="0"
        type="number"
        :rules="valueRules"
        required
      />
      <eth-button-wrapper>
        <v-btn @click="withdraw">withdraw ether</v-btn>
      </eth-button-wrapper>
      <v-btn @click="setFullDepositedBalance">set full balance</v-btn>
      <v-btn @click="clearWithdraw">clear</v-btn>
    </v-form>
  </span>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'
import EtherDepositWarnings from '@/components/EtherDepositWarnings'

export default {
  components: {
    EtherDepositWarnings
  },
  data() {
    return {
      depositAmount: 0,
      withdrawAmount: 0,
      addressRules: [v => this.isAddress(v) || 'must be a valid address'],
      valueRules: [v => parseFloat(v) > 0 || 'must be non zero value']
    }
  },
  computed: {
    ...mapGetters(['tokenDataOf', 'wethAddress']),
    wethBalance() {
      return this.weiToEth(this.tokenDataOf(this.wethAddress).depositedBalance)
    }
  },
  methods: {
    clearWithdraw() {
      this.$refs['withdraw-form'].reset()
    },
    clearDeposit() {
      this.$refs['deposit-form'].reset()
    },
    setFullDepositedBalance() {
      this.withdrawAmount = this.wethBalance
    },
    ...mapActions(['depositEther', 'withdrawEther']),
    deposit() {
      if (this.$refs['deposit-form'].validate()) {
        this.depositEther(this.ethToWei(this.depositAmount))
        this.clearDeposit()
      }
    },
    withdraw() {
      if (this.$refs['withdraw-form'].validate()) {
        this.withdrawEther(this.ethToWei(this.withdrawAmount))
        this.clearWithdraw()
      }
    }
  }
}
</script>
