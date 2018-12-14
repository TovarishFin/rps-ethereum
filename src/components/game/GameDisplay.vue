<template>
  <span>
    <v-container fluid text-xs-center>
      <v-layout row fill-height align-center justify-space-around>
        <v-flex xs-4>
          <p class="display-2">Player 1</p>
          <p class="subheader">{{ gameData.addressP1 }}</p>
        </v-flex>
        <v-flex xs-4> <p class="display-3">VS</p> </v-flex>
        <v-flex xs-4>
          <p class="display-2">Player 2</p>
          <p class="subheader">{{ gameData.addressP2 }}</p>
        </v-flex>
      </v-layout>
      <v-layout row>
        <v-flex xs-4>
          <typing
            ref="typing-player1"
            class="headline"
            :secret="gameData.choiceSecretP1"
            :choice="this.choiceEnum[gameData.choiceP1]"
            :typing-interval="30"
            :hashing-interval="15"
            :deleting-interval="30"
            :wait-time="3000"
            :tries="5"
            :undecided="undecided"
            :loser="!player1Wins"
            :winner="player1Wins"
            :tie="tie"
            player1
          />
        </v-flex>

        <v-flex xs-4><div style="width: 50px;"></div></v-flex>

        <v-flex xs-4>
          <typing
            ref="typing-player2"
            class="headline"
            :secret="gameData.choiceSecretP2"
            :choice="this.choiceEnum[gameData.choiceP2]"
            :typing-interval="30"
            :hashing-interval="15"
            :deleting-interval="30"
            :wait-time="3000"
            :tries="5"
            :undecided="undecided"
            :loser="player1Wins"
            :winner="!player1Wins"
            :tie="tie"
            player2
          />
        </v-flex>
      </v-layout>
    </v-container>
  </span>
</template>

<script>
import { mapGetters } from 'vuex'
import * as VCard from 'vuetify/es5/components/VCard'
import Typing from '@/components/Typing'

export default {
  components: {
    ...VCard,
    Typing
  },
  data() {
    return {
      player1Wins: false,
      player2Wins: false,
      tie: false,
      undecided: false
    }
  },
  computed: {
    ...mapGetters(['game', 'selectedGameId']),
    gameData() {
      return this.game(this.selectedGameId)
    },
    stage() {
      return this.stageEnum[this.gameData.stage]
    },
    player1Strings() {
      if (parseInt(this.gameData.stage) < 3) {
        return [this.gameData.choiceSecretP1]
      } else {
        return [
          this.gameData.choiceSecretP1,
          this.choiceEnum[this.gameData.choiceP1]
        ]
      }
    },
    player2Strings() {
      if (parseInt(this.gameData.stage) < 3) {
        return [this.gameData.choiceSecretP2]
      } else {
        return [
          this.gameData.choiceSecretP2,
          this.choiceEnum[this.gameData.choiceP2]
        ]
      }
    }
  },
  watch: {
    gameData(newData, oldData) {
      const {
        stage,
        winner,
        addressP1,
        addressP2,
        choiceSecretP1,
        choiceSecretP2,
        choiceP1,
        choiceP2
      } = newData
      const {
        choiceSecretP1: choiceSecretP1Orig,
        choiceSecretP2: choiceSecretP2Orig,
        choiceP1: choiceP1Orig,
        choiceP2: choiceP2Orig
      } = oldData

      const shouldUpdate =
        choiceSecretP1Orig !== choiceSecretP1 ||
        choiceSecretP2Orig !== choiceSecretP2 ||
        choiceP1Orig !== choiceP1 ||
        choiceP2Orig !== choiceP2

      if (parseInt(stage) > 0 && shouldUpdate) {
        if (parseInt(stage) <= 3) {
          this.$refs['typing-player1'].startEmptyToSecret()
          this.$refs['typing-player2'].startEmptyToSecret()
        } else {
          this.player1Wins = winner === addressP1
          this.player2Wins = winner === addressP2
          this.tie = parseInt(stage) >= 6 && winner === this.addressZero
          this.undecided = parseInt(stage) < 6
          this.$refs['typing-player1'].startEmptyToResult()
          this.$refs['typing-player2'].startEmptyToResult()
        }
      }
    }
  }
}
</script>
