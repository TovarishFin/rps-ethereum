<template>
  <div>
    <v-form ref="create-game-form">
      <token-data-of />
      <p class="display-1">Create Game</p>
      <v-combobox
        v-model="tokenAddress"
        :items="tokenDataArray"
        item-text="symbol"
        item-value="address"
        label="token address"
        :placeholder="addressZero"
        :rules="addressRules"
        :return-object="false"
        required
      />
      <v-text-field
        v-model="betAmount"
        label="bet amount"
        placeholder="1"
        type="number"
        :rules="betAmountRules"
        required
      />
      <eth-button-wrapper>
        <v-btn @click="validateAndCreateBet">create game</v-btn>
      </eth-button-wrapper>
      <v-btn @click="clearForm">clear</v-btn>
    </v-form>
  </div>
</template>

<script>
import { toBN } from 'web3-utils'
import { mapGetters, mapActions } from 'vuex'
import * as VForm from 'vuetify/es5/components/VForm'
import * as VBtn from 'vuetify/es5/components/VBtn'
import * as VCombobox from 'vuetify/es5/components/VCombobox'
import * as VTextField from 'vuetify/es5/components/VTextField'
import TokenDataOf from '@/components/TokenDataOf'

export default {
  components: {
    ...VForm,
    ...VBtn,
    ...VTextField,
    ...VCombobox,
    TokenDataOf
  },
  data() {
    return {
      betAmount: '',
      addressRules: [v => this.isAddress(v) || 'must be a valid address'],
      betAmountRules: [
        v => {
          const wei = this.ethToWei(v)
          return (
            (!wei.isZero() &&
              wei.lte(toBN(this.tokenData.depositedBalance)) &&
              wei.gte(toBN(this.minBet))) ||
            'must be non zero value and less than or equal to your deposited token balance'
          )
        }
      ]
    }
  },
  computed: {
    ...mapGetters([
      'selectedTokenAddress',
      'tokenDataOf',
      'minBet',
      'tokenDataArray'
    ]),
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
    ...mapActions(['setSelectedTokenAddress', 'createGame']),
    validateAndCreateBet() {
      if (this.$refs['create-game-form'].validate()) {
        this.createGame({
          tokenAddress: this.tokenAddress,
          value: this.ethToWei(this.betAmount).toString()
        })
        this.clearForm()
      }
    },
    clearForm() {
      this.$refs['create-game-form'].reset()
    }
  }
}
</script>
