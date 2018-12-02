<template>
  <span>
    <token-data-of />
    <v-form class="pt-4 pb-4">
      <p class="display-1">Deposit Tokens</p>
      <v-text-field
        v-model="tokenAddress"
        label="Token Address"
        :placeholder="addressZero"
        :rules="addressRules"
        required
      ></v-text-field>
      <v-text-field
        v-model="depositAmount"
        label="Deposit Amount"
        placeholder="0"
        type="number"
        :rules="valueRules"
        required
      />
      <v-btn>submit</v-btn>
      <v-btn>clear</v-btn>
    </v-form>

    <v-form class="pt-4 pb-4">
      <p class="display-1">Withdraw Tokens</p>
      <v-text-field
        v-model="tokenAddress"
        label="Token Address"
        :placeholder="addressZero"
        :rules="addressRules"
        required
      ></v-text-field>
      <v-text-field
        v-model="withdrawAmount"
        label="Deposit Amount"
        placeholder="0"
        type="number"
        :rules="valueRules"
        required
      />
      <v-btn>submit</v-btn>
      <v-btn>clear</v-btn>
    </v-form>
  </span>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'
import * as VForm from 'vuetify/es5/components/VForm'
import * as VTextField from 'vuetify/es5/components/VTextField'
import * as VBtn from 'vuetify/es5/components/VBtn'
import TokenDataOf from './TokenDataOf.vue'

export default {
  components: {
    ...VTextField,
    ...VForm,
    ...VBtn,
    TokenDataOf
  },
  data() {
    return {
      addressRules: [v => this.isAddress(v) || 'must be a valid address'],
      valueRules: [v => parseFloat(v) > 0 || 'must be non zero value'],
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
    ...mapActions(['setSelectedTokenAddress', 'getTokenDataOf'])
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
