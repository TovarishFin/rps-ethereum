<template>
  <span>
    <p class="display-1">Tied</p>
    <p class="headline">Both players picked the same choice!</p>
    <span v-show="coinbaseIsPlayer">
      <p>settle the bet</p>
      <eth-button-wrapper>
        <v-btn @click="settleBet(selectedGameId)">settle bet</v-btn>
      </eth-button-wrapper>
    </span>
    <span v-show="!coinbaseIsPlayer"> <p>You are not a player</p> </span>
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
    }
  },
  methods: {
    ...mapActions(['settleBet'])
  }
}
</script>
