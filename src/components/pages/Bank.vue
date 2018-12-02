<template>
  <div>
    <token-usage-table />
    <v-tabs grow>
      <v-tab ripple> Tokens </v-tab>
      <v-tab ripple> Ether </v-tab>
      <v-tab-item> <token-bank /> </v-tab-item>
      <v-tab-item> <eth-bank /> </v-tab-item>
    </v-tabs>
  </div>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'
import * as VTabs from 'vuetify/es5/components/VTabs'
import TokenUsageTable from '../TokenUsageTable'
import TokenBank from '../TokenBank'
import EthBank from '../EthBank'

export default {
  components: {
    ...VTabs,
    TokenUsageTable,
    TokenBank,
    EthBank
  },
  data() {
    return {
      addressRules: [v => this.isAddress(v) || 'must be a valid address'],
      valueRules: [v => parseFloat(v) > 0 || 'must be non zero value'],
      depositAmount: 0,
      withdrawAmount: 0,
      tokenHeaders: [
        {
          text: 'Use',
          sortable: false
        },
        {
          text: 'Name',
          align: 'left',
          value: 'name'
        },
        {
          text: 'Address',
          value: 'address'
        },
        {
          text: 'Symbol',
          value: 'symbol'
        },
        {
          text: 'Balance',
          value: 'balance'
        },
        {
          text: 'Deposited Balance',
          value: 'depositedBalance'
        }
      ]
    }
  },
  computed: {
    ...mapGetters(['selectedTokenAddress']),
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
    ...mapActions(['setSelectedTokenAddress'])
  }
}
</script>
