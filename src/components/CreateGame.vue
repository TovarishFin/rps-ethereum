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
      />
    </v-card-title>
    <v-data-table
      :headers="tokenHeaders"
      :items="tokenDataArray"
      :search="tokenSearch"
      class="elevation-1 mb-4"
      item-key="address"
      :pagination.sync="pagination"
    >
      <template slot="items" slot-scope="props">
        <tr>
          <td>
            <v-btn @click="selectToken(props, props.item.address)"> use </v-btn>
          </td>
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
        </tr>
      </template>
      <template slot="no-results">
        <p class="display-1 pa-4">no results found</p>
      </template>
      <template slot="expand" slot-scope="props">
        <v-form class="pt-4 pb-4 ml-4 mr-4" :ref="props.item.address">
          <p class="display-1">Create Game</p>
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
          <v-btn @click="setBetFull">set full balance</v-btn>
          <v-btn @click="clearForm">clear</v-btn>
        </v-form>
      </template>
      <template slot="pageText" slot-scope="props">
        Tokens {{ props.pageStart }} - {{ props.pageStop }} of
        {{ props.itemsLength }}
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
import { toBN } from 'web3-utils'
import { mapGetters, mapActions } from 'vuex'

export default {
  data() {
    return {
      pagination: {
        rowsPerPage: -1
      },
      tokenSearch: '',
      betAmount: 0,
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
          text: 'Decimals',
          value: 'decimals'
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
      ],
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
      'tokenDataArray',
      'selectedTokenAddress',
      'tokenDataOf',
      'selectedTokenAddress',
      'minBet'
    ]),
    tokenData() {
      return this.tokenDataOf(this.selectedTokenAddress)
    }
  },
  methods: {
    ...mapActions(['setSelectedTokenAddress', 'createGame']),
    setBetFull() {
      this.betAmount = this.weiToEth(this.tokenData.depositedBalance)
    },
    isInUse(tokenAddress) {
      return tokenAddress === this.selectedTokenAddress
    },
    selectToken(props, tokenAddress) {
      props.expanded = !props.expanded
      this.setSelectedTokenAddress(tokenAddress)
    },
    validateAndCreateBet() {
      if (this.$refs[this.selectedTokenAddress].validate()) {
        this.createGame({
          tokenAddress: this.selectedTokenAddress,
          value: this.ethToWei(this.betAmount).toString()
        })
        this.clearForm()
      }
    },
    clearForm() {
      this.$refs[this.selectedTokenAddress].reset()
    }
  }
}
</script>
