<template>
  <span>
    <v-tabs grow v-model="tabsIndex">
      <v-tab ripple>My Tokens</v-tab>
      <v-tab ripple>My Games</v-tab>
      <v-tab ripple>My Referrals</v-tab>
      <v-tab-item> <account-token-transactions /> </v-tab-item>
      <v-tab-item> <account-games /> </v-tab-item>
      <v-tab-item> <account-referrals /> </v-tab-item>
    </v-tabs>
  </span>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import * as VTabs from 'vuetify/es5/components/VTabs'
import AccountTokenTransactions from '@/components/account/AccountTokenTransactions'
import AccountGames from '@/components/account/AccountGames'
import AccountReferrals from '@/components/account/AccountReferrals'

export default {
  components: {
    ...VTabs,
    AccountTokenTransactions,
    AccountGames,
    AccountReferrals
  },
  computed: {
    ...mapGetters(['accountTabs']),
    tabsIndex: {
      get() {
        return this.accountTabs
      },
      set(index) {
        return this.setAccountTabs(index)
      }
    }
  },
  methods: {
    ...mapActions(['setAccountTabs'])
  }
}
</script>
