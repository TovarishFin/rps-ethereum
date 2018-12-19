<template>
  <v-bottom-sheet v-model="showTransactionsModel">
    <v-list class="mb-4">
      <v-subheader> Pending Transactions </v-subheader>
      <v-list-tile
        v-for="pendingTx in pendingTxs"
        :key="pendingTx.transactionHash"
        value="true"
        target="_blank"
        :href="txLink(pendingTx.transactionHash)"
      >
        <v-list-tile-title> {{ pendingTx.transactionHash }} </v-list-tile-title>
        <v-list-tile-sub-title>
          description: {{ pendingTx.description }}
        </v-list-tile-sub-title>
      </v-list-tile>
      <v-subheader> Completed Transactions </v-subheader>
      <v-list-tile
        v-for="completeTx in completeTxs"
        :key="completeTx.transactionHash"
        value="true"
        target="_blank"
        :href="txLink(completeTx.transactionHash)"
      >
        <v-list-tile-title>
          {{ completeTx.transactionHash }}
        </v-list-tile-title>
        <v-list-tile-sub-title>
          description: {{ completeTx.description }}
        </v-list-tile-sub-title>
      </v-list-tile>
    </v-list>
  </v-bottom-sheet>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import * as VList from 'vuetify/es5/components/VList'
import * as VSubheader from 'vuetify/es5/components/VSubheader'
import * as VBottomSheet from 'vuetify/es5/components/VBottomSheet'

export default {
  components: {
    ...VList,
    ...VSubheader,
    ...VBottomSheet
  },
  computed: {
    ...mapGetters(['pendingTxs', 'completeTxs', 'network', 'showTransactions']),
    showTransactionsModel: {
      get() {
        return this.showTransactions
      },
      set(showTransactions) {
        this.setShowTransactions(showTransactions)
      }
    }
  },
  methods: {
    ...mapActions(['setShowTransactions']),
    txLink(txHash) {
      switch (this.network) {
        case 3:
          return `https://ropsten.etherscan.io/tx/${txHash}`
        case 4:
          return `https://rinkeby.etherscan.io/tx/${txHash}`
        case 42:
          return `https://kovan.etherscan.io/tx/${txHash}`
        case 1:
          return `https://etherscan.io/tx/${txHash}`
        default:
          return `https://etherscan.io/tx/${txHash}`
      }
    }
  }
}
</script>
