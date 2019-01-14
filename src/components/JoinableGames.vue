<template>
  <v-card>
    <v-card-title>
      Current Open Games
      <v-spacer></v-spacer>
      <v-text-field
        v-model="gameSearch"
        append-icon="search"
        label="search for a game"
        single-line
        hide-details
      >
      </v-text-field>
    </v-card-title>
    <v-data-table
      :headers="gameHeaders"
      :items="formattedJoinableGames"
      :search="gameSearch"
      item-key="gameId"
      :pagination.sync="pagination"
    >
      <template slot="items" slot-scope="props">
        <tr>
          <td>
            <v-btn @click="goToGame(props.item.gameId)">view game</v-btn>
            <eth-button-wrapper>
              <v-btn
                :disabled="coinbase === props.item.addressP1"
                @click="validateAndJoinGame(props.item.gameId)"
                v-if="hasSufficientBalance(props)"
              >
                {{ joinButtonText(props) }}
              </v-btn>
            </eth-button-wrapper>
            <v-btn
              @click="selectGame(props)"
              v-if="!hasSufficientBalance(props)"
            >
              quick deposit
            </v-btn>
          </td>
          <td class="text-xs-left">{{ props.item.gameId }}</td>
          <td class="text-xs-left">{{ props.item.token.name }}</td>
          <td class="text-xs-left">
            {{ weiToEth(props.item.bet) }} {{ props.item.token.symbol }}
          </td>
          <td class="text-xs-left">
            {{ shortenAddress(props.item.tokenAddress) }}
          </td>
          <td class="text-xs-left">
            {{ shortenAddress(props.item.addressP1) }}
          </td>
        </tr>
      </template>
      <template slot="no-results">
        <p class="display-1 pa-4">no games found</p>
      </template>
      <template slot="expand" slot-scope="props">
        <v-form
          v-if="props.item.tokenAddress === wethAddress"
          :ref="`deposit-form-ether-${props.item.gameId}`"
          class="pt-4 pb-4 ml-4 mr-4"
        >
          <ether-deposit-warnings />
          <p class="display-1">Deposit Ether</p>
          <p>Amount to deposit: {{ weiToEth(props.item.bet) }} ETH</p>
          <eth-button-wrapper>
            <v-btn @click="depositEther(ethToWei(depositAmount))">
              confirm deposit
            </v-btn>
          </eth-button-wrapper>
        </v-form>

        <v-form
          :ref="`deposit-form-${props.item.gameId}`"
          v-if="props.item.tokenAddress !== wethAddress"
          class="pt-4 pb-4 ml-4 mr-4"
        >
          <token-deposit-warnings />
          <p class="display-1">Deposit Tokens</p>
          <p>
            Your personal balance: {{ weiToEth(props.item.token.balance) }}
            {{ props.item.token.symbol }}
          </p>
          <p>
            Your bank balance:
            {{ weiToEth(props.item.token.depositedBalance) }}
            {{ props.item.token.symbol }}
          </p>
          <p>
            Amount to deposit: {{ weiToEth(props.item.bet) }}
            {{ props.item.token.symbol }}
          </p>
          <eth-button-wrapper>
            <v-btn @click="depositTokens">confirm deposit</v-btn>
          </eth-button-wrapper>
        </v-form>
      </template>
      <template slot="pageText" slot-scope="props">
        Games {{ props.pageStart }} - {{ props.pageStop }} of
        {{ props.itemsLength }}
      </template>
    </v-data-table>
  </v-card>
</template>
<script>
import { toBN } from 'web3-utils'
import { mapGetters, mapActions } from 'vuex'
import * as VTextField from 'vuetify/es5/components/VTextField'
import * as VBtn from 'vuetify/es5/components/VBtn'
import * as VDataTable from 'vuetify/es5/components/VDataTable'
import * as VCard from 'vuetify/es5/components/VCard'
import TokenDepositWarnings from '@/components/TokenDepositWarnings'
import EtherDepositWarnings from '@/components/EtherDepositWarnings'

export default {
  components: {
    ...VTextField,
    ...VBtn,
    ...VDataTable,
    ...VCard,
    TokenDepositWarnings,
    EtherDepositWarnings
  },
  data() {
    return {
      pagination: {
        rowsPerPage: -1
      },
      gameSearch: '',
      depositAmount: 0,
      valueDepositRules: [
        v => {
          const wei = this.ethToWei(v)
          return (
            (!wei.isZero() && wei.lte(toBN(this.tokenData.balance))) ||
            'must be non zero value and less than or equal to your token balance'
          )
        }
      ],
      valueRules: [v => parseFloat(v) > 0 || 'must be non zero value'],
      gameHeaders: [
        {
          text: 'Interact',
          value: ''
        },
        {
          text: 'Game ID',
          value: 'gameId'
        },
        {
          text: 'Token Name',
          value: 'token.name'
        },
        {
          text: 'Wager',
          value: 'bet'
        },
        {
          text: 'Token Addr.',
          value: 'tokenAddress'
        },
        {
          text: 'Creator',
          value: 'addressP1'
        }
      ]
    }
  },
  computed: {
    ...mapGetters([
      'openGames',
      'game',
      'tokenDataOf',
      'coinbase',
      'selectedGameId',
      'selectedTokenAddress',
      'wethAddress'
    ]),
    formattedJoinableGames() {
      return this.openGames.map(game => ({
        ...game,
        token: this.tokenDataOf(game.tokenAddress)
      }))
    },
    tokenData() {
      return this.tokenDataOf(this.selectedTokenAddress)
    }
  },
  methods: {
    ...mapActions([
      'joinGame',
      'createNotification',
      'setSelectedTokenAddress',
      'setSelectedGameId',
      'batchDepositTokens',
      'depositEther',
      'createNotification'
    ]),
    selectGame(props) {
      props.expanded = !props.expanded
      this.setSelectedGameId(props.item.gameId)
      this.setSelectedTokenAddress(props.item.tokenAddress)
      this.depositAmount = this.weiToEth(props.item.bet)
    },
    clearDeposit() {
      this.$refs[`deposit-form-${this.selectedGameId}`].reset()
    },
    hasSufficientBalance(props) {
      return toBN(props.item.token.depositedBalance).gte(toBN(props.item.bet))
    },
    joinButtonText(props) {
      return this.coinbase === props.item.addressP1
        ? 'cannot join own game'
        : 'join game'
    },
    goToGame(gameId) {
      this.$router.push({ name: 'Game', params: { gameId } })
    },
    validateAndJoinGame(gameId) {
      this.setSelectedGameId(gameId)
      const { bet, addressP1, tokenAddress } = this.game(gameId)
      this.setSelectedTokenAddress(tokenAddress)
      const { depositedBalance } = this.tokenDataOf(tokenAddress)
      const wager = toBN(bet)
      const balance = toBN(depositedBalance)

      const valid = balance.gte(wager) && this.coinbase !== addressP1

      if (valid) {
        this.joinGame(this.selectedGameId)
      } else {
        this.createNotification(
          'Your deposited token balance is too low to join.'
        )
      }
    },
    setRequiredWager(props) {
      this.depositAmount = this.weiToEth(props.item.bet)
    },
    depositTokens() {
      if (this.$refs[`deposit-form-${this.selectedGameId}`].validate()) {
        if (this.tokenData.decimals !== '18') {
          this.createNotification(
            'Tokens must use 18 decimals in order to be used.'
          )

          return
        }

        this.batchDepositTokens({
          tokenAddress: this.selectedTokenAddress,
          value: this.ethToWei(this.depositAmount)
        })
        this.clearDepositTokens()
      }
    }
  }
}
</script>
