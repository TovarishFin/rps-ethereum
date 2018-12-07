<template>
  <v-card>
    <v-card-title> Token Information </v-card-title>
    <v-data-table
      :headers="tokenHeaders"
      :items="tokenData"
      hide-actions
      class="elevation-1 mb-4"
    >
      <template slot="items" slot-scope="props">
        <td>{{ props.item.name }}</td>
        <td class="text-xs-left">{{ shortenAddress(props.item.address) }}</td>
        <td class="text-xs-left">{{ props.item.symbol }}</td>
        <td class="text-xs-left">{{ props.item.decimals }}</td>
        <td class="text-xs-left">{{ weiToEth(props.item.balance) }}</td>
        <td class="text-xs-left">
          {{ weiToEth(props.item.depositedBalance) }}
        </td>
        <td class="text-xs-left">
          {{ weiToEth(props.item.allocatedBalance) }}
        </td>
      </template>
      <template slot="no-results">
        <p class="display-1 pa-4">invalid token</p>
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
import { mapGetters } from 'vuex'
import * as VDataTable from 'vuetify/es5/components/VDataTable'
import * as VCard from 'vuetify/es5/components/VCard'

export default {
  components: {
    ...VDataTable,
    ...VCard
  },
  data() {
    return {
      tokenHeaders: [
        {
          text: 'Name',
          align: 'left',
          value: 'name',
          sortable: false
        },
        {
          text: 'Address',
          value: 'address',
          sortable: false
        },
        {
          text: 'Symbol',
          value: 'symbol',
          sortable: false
        },
        {
          text: 'Decimals',
          value: 'decimals'
        },
        {
          text: 'Balance',
          value: 'balance',
          sortable: false
        },
        {
          text: 'Deposited Balance',
          value: 'depositedBalance',
          sortable: false
        },
        {
          text: 'Allocated Balance',
          value: 'allocatedBalance',
          sortable: false
        }
      ]
    }
  },
  computed: {
    ...mapGetters(['selectedTokenAddress', 'tokenDataOf']),
    tokenData() {
      return [this.tokenDataOf(this.selectedTokenAddress)]
    }
  }
}
</script>
