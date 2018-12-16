<template>
  <span>
    <v-timeline align-top dense>
      <v-timeline-item
        v-for="(bankEvent, index) in formattedLogs"
        :color="bankEvent.color"
        :key="index"
      >
        <v-layout pt-3>
          <v-flex xs3>
            <p class="subheading font-weight-bold">
              Block: {{ bankEvent.blockNumber }}
            </p>
          </v-flex>
          <v-flex>
            <strong class="title">{{ bankEvent.formattedEventName }}</strong>
            <div class="body">{{ bankEvent.text }}</div>
          </v-flex>
        </v-layout>
      </v-timeline-item>
    </v-timeline>
  </span>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import * as VTimeline from 'vuetify/es5/components/VTimeline'

export default {
  components: {
    ...VTimeline
  },
  computed: {
    ...mapGetters(['bankActivity', 'tokenDataOf', 'coinbase']),
    formattedLogs() {
      return this.bankActivity
        .map(log => this.formatLog(log))
        .sort((a, b) => a.sorter - b.sorter)
    }
  },
  methods: {
    ...mapActions(['getBankActivity']),
    formatLog(bankEvent) {
      const { event: eventName } = bankEvent

      switch (eventName) {
        case 'FundsDeposited':
          return this.formatFundsDeposited(bankEvent)
        case 'FundsAllocated':
          return this.formatFundsAllocated(bankEvent)
        case 'FundsDeAllocated':
          return this.formatFundsDeAllocated(bankEvent)
        case 'FundsTransferred':
          return this.formatFundsTransferred(bankEvent)
        case 'FundsWithdrawn':
          return this.formatFundsWithdrawn(bankEvent)
        default:
          return bankEvent
      }
    },
    formatFundsDeposited(bankEvent) {
      const {
        blockNumber,
        logIndex,
        returnValues: { tokenAddress, value }
      } = bankEvent
      const { symbol } = this.tokenDataOf(tokenAddress)

      const formattedEventName = 'Funds Deposited'
      const sorter = parseInt(blockNumber * 1000) + parseInt(logIndex)
      const color = 'green'
      const text =
        symbol === 'N/A'
          ? `${this.weiToEth(
              value
            )} in tokens were deposited to the bank. The token used is a token that you no longer use in the bank. The token address is ${tokenAddress}.`
          : `${this.weiToEth(value)} ${symbol} was deposited to the bank.`

      return {
        formattedEventName,
        blockNumber,
        text,
        color,
        sorter
      }
    },
    formatFundsAllocated(bankEvent) {
      const {
        blockNumber,
        logIndex,
        returnValues: { tokenAddress, value }
      } = bankEvent
      const { symbol } = this.tokenDataOf(tokenAddress)

      const formattedEventName = 'Funds Allocated'
      const sorter = parseInt(blockNumber * 1000) + parseInt(logIndex)
      const color = 'blue'
      const text =
        symbol === 'N/A'
          ? `${this.weiToEth(
              value
            )} in tokens were allocated for a game that you either joined or created. The token used is a token that you no longer use in the bank. The token address is ${tokenAddress}.`
          : `${this.weiToEth(
              value
            )} ${symbol} was allocated for a game that you either joined or created.`

      return {
        formattedEventName,
        blockNumber,
        text,
        color,
        sorter
      }
    },
    formatFundsDeAllocated(bankEvent) {
      const {
        blockNumber,
        logIndex,
        returnValues: { tokenAddress, value }
      } = bankEvent
      const { symbol } = this.tokenDataOf(tokenAddress)

      const formattedEventName = 'Funds Deallocated'
      const sorter = parseInt(blockNumber * 1000) + parseInt(logIndex)
      const color = 'teal'
      const text =
        symbol === 'N/A'
          ? `${this.weiToEth(
              value
            )} were deallocated, meaning that these are now spendable. Tokens are deallocated when you either cancel or win a game. The token used is a token that you no longer use in the bank. The token address is ${tokenAddress}.`
          : `${this.weiToEth(
              value
            )} ${symbol} was deallocated, meaning that this balance is now spendable. Tokens are deallocated when you either cancel or win a game.`

      return {
        formattedEventName,
        blockNumber,
        text,
        color,
        sorter
      }
    },
    formatFundsTransferred(bankEvent) {
      const {
        blockNumber,
        logIndex,
        returnValues: { tokenAddress, to, from, value }
      } = bankEvent
      const { symbol } = this.tokenDataOf(tokenAddress)
      const received = to === this.coinbase ? true : false
      const sorter = parseInt(blockNumber * 1000) + parseInt(logIndex)

      if (received) {
        const formattedEventName = 'Funds Received'
        const color = 'light-green'
        const text =
          symbol === 'N/A'
            ? `${this.weiToEth(
                value
              )} was transferred to you from address ${this.shortenAddress(
                from
              )}. This happens when you win a game and the losing player's allocated balance is transferred to you. The token used is a token that you no longer use in the bank. The token address is ${tokenAddress}.`
            : `${this.weiToEth(
                value
              )} ${symbol} was transferred to you from address ${this.shortenAddress(
                from
              )}. This happens when you win a game and the losing player's allocated balance is transferred to you.`

        return {
          formattedEventName,
          blockNumber,
          text,
          color,
          sorter
        }
      } else {
        const formattedEventName = 'Funds Transferred'
        const color = 'amber'
        const text =
          symbol === 'N/A'
            ? `${this.weiToEth(
                value
              )} was transferred from your allocated balance to ${this.shortenAddress(
                to
              )}. This happens when you lose a game and your allocated balance is trasferred to the winner address. The token used is a token that you no longer use in the bank. The token address is ${tokenAddress}.`
            : `${this.weiToEth(
                value
              )} was transferred from your allocated balance to ${this.shortenAddress(
                to
              )}. This happens when you lose a game and your allocated balance is trasferred to the winner address.`

        return {
          formattedEventName,
          blockNumber,
          text,
          color,
          sorter
        }
      }
    },
    formatFundsWithdrawn(bankEvent) {
      const {
        blockNumber,
        logIndex,
        returnValues: { tokenAddress, value }
      } = bankEvent
      const { symbol } = this.tokenDataOf(tokenAddress)

      const formattedEventName = 'Funds Withdrawn'
      const sorter = parseInt(blockNumber * 1000) + parseInt(logIndex)
      const color = 'red'
      const text =
        symbol === 'N/A'
          ? `You withdrew ${this.weiToEth(
              value
            )} from the bank. The token used is a token that you no longer use in the bank. The token address is ${tokenAddress}.`
          : `You withdrew ${this.weiToEth(value)} ${symbol} from the bank.`

      return {
        formattedEventName,
        blockNumber,
        text,
        color,
        sorter
      }
    }
  },
  created() {
    this.getBankActivity()
  }
}
</script>
