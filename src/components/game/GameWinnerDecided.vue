<template>
  <span>
    <p class="display-1">Winner Decided</p>
    <p class="headinline">Hooray for the winner.</p>
    <span v-show="coinbaseIsPlayer">
      <span v-show="coinbaseIsWinner">
        <p>You won!</p>
        <eth-button-wrapper>
          <v-btn @click="settleBet(selectedGameId)">settle your bet</v-btn>
        </eth-button-wrapper>
      </span>

      <span v-show="!coinbaseIsWinner"> <p>You lost!</p> </span>
    </span>

    <span v-show="!coinbaseIsPlayer"> <p>you are not a plyaer.</p> </span>
  </span>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  computed: {
    ...mapGetters(['coinbase', 'selectedGameId', 'game']),
    gameData() {
      return this.game(this.selectedGameId)
    },
    coinbaseIsPlayer() {
      const { addressP1, addressP2 } = this.gameData
      return this.coinbase == addressP1 || this.coinbase == addressP2
    },
    coinbaseIsWinner() {
      const { winner } = this.gameData
      return this.coinbase == winner
    }
  },
  methods: {
    ...mapActions(['settleBet'])
  }
}
</script>
