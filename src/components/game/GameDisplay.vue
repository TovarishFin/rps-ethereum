<template>
  <span>
    <v-container fluid text-xs-center>
      <v-layout row fill-height align-center justify-space-around>
        <v-flex xs-4>
          <p class="display-4">Player 1</p>
          <p>{{ gameData.addressP1 }}</p>
        </v-flex>
        <v-flex xs-4> <p class="display-4">VS</p> </v-flex>
        <v-flex xs-4>
          <p class="display-4">Player 2</p>
          <p>{{ gameData.addressP2 }}</p>
        </v-flex>
      </v-layout>
      <v-layout row>
        <v-flex xs-4>
          <typing
            v-if="showCommits"
            class="body"
            :secret="gameData.choiceSecretP1"
            :choice="this.choiceEnum[gameData.choiceP1]"
            :typing-interval="30"
            :hashing-interval="50"
            :deleting-interval="30"
            :wait-time="2000"
            :tries="5"
            commit
          />
          <typing
            v-if="showReveals"
            class="body"
            :secret="gameData.choiceSecretP1"
            :choice="this.choiceEnum[gameData.choiceP1]"
            :typing-interval="30"
            :hashing-interval="10"
            :deleting-interval="30"
            :wait-time="3000"
            :tries="5"
            reveal
            loser
            player1
          />
        </v-flex>

        <v-flex xs-4><div style="width: 50px;"></div></v-flex>

        <v-flex xs-4>
          <typing
            v-if="showCommits"
            class="body"
            :starting-text="bytes32Zero"
            :secret="gameData.choiceSecretP2"
            :choice="this.choiceEnum[gameData.choiceP2]"
            :typing-interval="30"
            :hashing-interval="50"
            :deleting-interval="30"
            :tries="5"
            commit
            player2
          />
          <typing
            v-if="showReveals"
            class="body"
            :starting-text="bytes32Zero"
            :secret="gameData.choiceSecretP2"
            :choice="this.choiceEnum[gameData.choiceP2]"
            :typing-interval="30"
            :hashing-interval="10"
            :deleting-interval="30"
            :wait-time="3000"
            :tries="5"
            reveal
            winner
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
      showReveals: false,
      showCommits: false
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
    gameData(data) {
      const { stage } = data
      if (parseInt(stage) > 0) {
        if (parseInt(stage) <= 3) {
          this.showCommits = true
        } else {
          this.showReveals = true
        }
      }
    }
  }
}
</script>
