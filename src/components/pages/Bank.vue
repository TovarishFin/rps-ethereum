<template>
  <div>
    <token-usage-table />
    <v-tabs grow v-model="tabsIndex">
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
  computed: {
    ...mapGetters(['bankTabs']),
    tabsIndex: {
      get() {
        return this.bankTabs
      },
      set(index) {
        return this.setBankTabs(index)
      }
    }
  },
  methods: {
    ...mapActions(['setBankTabs'])
  }
}
</script>
