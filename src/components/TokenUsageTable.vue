<template>
  <v-card>
    <v-card-title>
      Your Current Tokens in the Bank
      <v-spacer></v-spacer>
      <v-text-field
        v-model="tokenSearch"
        append-icon="search"
        label="search for a token"
        single-line
        hide-details
      >
      </v-text-field>
    </v-card-title>
    <v-data-table
      :headers="tokenHeaders"
      :items="tokenDataArray"
      :search="tokenSearch"
      class="elevation-1 mb-4"
    >
      <template slot="items" slot-scope="props">
        <td>
          <v-btn @click="setSelectedTokenAddress(props.item.address)"
            >use / update</v-btn
          >
        </td>
        <td>{{ props.item.name }}</td>
        <td class="text-xs-left">{{ shortenAddress(props.item.address) }}</td>
        <td class="text-xs-left">{{ props.item.symbol }}</td>
        <td class="text-xs-left">{{ props.item.balance }}</td>
        <td class="text-xs-left">{{ props.item.depositedBalance }}</td>
        <td class="text-xs-left">{{ props.item.allocatedBalance }}</td>
      </template>
      <template slot="no-results">
        <p class="display-1 pa-4">no results found</p>
      </template>
      <template slot="pageText" slot-scope="props">
        Tokens {{ props.pageStart }} - {{ props.pageStop }} of
        {{ props.itemsLength }}
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import * as VTextField from 'vuetify/es5/components/VTextField'
import * as VBtn from 'vuetify/es5/components/VBtn'
import * as VDataTable from 'vuetify/es5/components/VDataTable'
import * as VCard from 'vuetify/es5/components/VCard'

export default {
  components: {
    ...VTextField,
    ...VBtn,
    ...VDataTable,
    ...VCard
  },
  data() {
    return {
      tokenSearch: '',
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
        },
        {
          text: 'Allocated Balance',
          value: 'allocatedBalance'
        }
      ]
    }
  },
  computed: {
    ...mapGetters(['tokenDataArray', 'selectedTokenAddress'])
  },
  methods: {
    ...mapActions(['setSelectedTokenAddress']),
    isInUse(tokenAddress) {
      return tokenAddress === this.selectedTokenAddress
    }
  }
}
</script>
