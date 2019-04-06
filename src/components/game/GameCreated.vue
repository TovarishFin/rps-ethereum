<template>
  <span>
    <span v-show="!coinbaseIsCreator">
      <p class="display-1">Game Status: Created</p>
      <p class="headline">Join the game</p>
      <eth-button-wrapper>
        <v-btn @click="validateAndJoinGame">join game</v-btn>
      </eth-button-wrapper>
    </span>

    <span v-show="coinbaseIsCreator">
      <p class="display-1">Waiting on Player to Join Game...</p>
      <p>
        If it is taking too long for someone to join, you can canel your game
        any time before another player joins.
      </p>
      <eth-button-wrapper>
        <v-btn @click="cancelGame(gameData.gameId)">cancel game</v-btn>
      </eth-button-wrapper>
    </span>
  </span>
</template>

<script>
import { toBN } from 'web3-utils'
import { mapGetters, mapActions } from 'vuex'

export default {
  computed: {
    ...mapGetters([
      'game',
      'selectedGameId',
      'tokenDataOf',
      'selectedTokenAddress',
      'coinbase'
    ]),
    gameData() {
      return this.game(this.selectedGameId)
    },
    tokenData() {
      return this.tokenDataOf(this.selectedTokenAddress)
    },
    coinbaseIsCreator() {
      return this.coinbase === this.gameData.addressP1
    }
  },
  methods: {
    ...mapActions(['joinGame', 'createNotification', 'cancelGame']),
    validateAndJoinGame() {
      const { bet, addressP1 } = this.gameData
      const { depositedBalance } = this.tokenData
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
    }
  }
}
</script>
