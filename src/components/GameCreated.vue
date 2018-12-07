<template>
  <span>
    <p class="display-1">Join the game</p>
    <v-btn @click="validateAndJoinGame">join game</v-btn>
  </span>
</template>

<script>
import { toBN } from 'web3-utils'
import { mapGetters, mapActions } from 'vuex'
import * as VBtn from 'vuetify/es5/components/VBtn'

export default {
  components: {
    ...VBtn
  },
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
    }
  },
  methods: {
    ...mapActions(['joinGame', 'createNotification']),
    validateAndJoinGame() {
      const { bet, addressP1 } = this.gameData
      const { depositedBalance } = this.tokenData
      const wager = toBN(bet)
      const balance = toBN(depositedBalance)

      const valid = balance.gte(wager) && this.coinbase !== addressP1

      if (valid) {
        this.joinGame({
          gameId: this.selectedGameId,
          value: wager
        })
      } else {
        this.createNotification(
          'Your deposited token balance is too low to join or you are trying to join your own game... you cannot do that...'
        )
      }
    }
  }
}
</script>
