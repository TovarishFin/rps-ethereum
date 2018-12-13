<template>
  <span>
    <v-tabs grow>
      <v-tab ripple>My Tokens</v-tab>
      <v-tab ripple>My Games</v-tab>
      <v-tab ripple>My Referrals</v-tab>
      <v-tab-item> <token-usage-table /> </v-tab-item>
      <v-tab-item> <account-games /> </v-tab-item>
      <v-tab-item> <account-referrals /> </v-tab-item>
    </v-tabs>
  </span>
</template>

<script>
import * as VTabs from 'vuetify/es5/components/VTabs'
import TokenUsageTable from '@/components/TokenUsageTable'
import AccountGames from '@/components/AccountGames'
import AccountReferrals from '@/components/AccountReferrals'

export default {
  components: {
    ...VTabs,
    TokenUsageTable,
    AccountGames,
    AccountReferrals
  }
}
</script>
