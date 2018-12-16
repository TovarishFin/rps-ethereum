<template>
  <span>
    <p class="display-1">Timed Out</p>
    <p class="headline">
      Due to inactivity by a player, the game has been timed out.
    </p>
    <span v-show="coinbaseIsPlayer">
      <span v-show="coinbaseIsWinner">
        <p>You have won by default!</p>
        <eth-button-wrapper>
          <v-btn @click="settleBet(selectedGameId)">settle your bet</v-btn>
        </eth-button-wrapper>
      </span>

      <span v-show="!coinbaseIsWinner">
        <p>You lost due to taking too long to make your move!</p>
      </span>
    </span>

    <span v-show="!coinbaseIsPlayer"> <p>you are not a player</p> </span>
  </span>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import * as VBtn from 'vuetify/es5/components/VBtn'

export default {
  components: {
    ...VBtn
  },
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
