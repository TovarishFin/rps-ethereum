<template>
  <span>
    <v-container fluid text-xs-center>
      <v-layout row fill-height align-center justify-space-around>
        <v-flex xs-4>
          <p class="display-2">
            Player 1
            <span class="primary--text" v-if="gameData.addressP1 === coinbase"
              >(You)</span
            >
          </p>
          <p class="subheader">{{ gameData.addressP1 }}</p>
        </v-flex>
        <v-flex xs-4> <p class="display-3">VS</p> </v-flex>
        <v-flex xs-4>
          <p class="display-2">
            Player 2
            <span class="primary--text" v-if="gameData.addressP2 === coinbase"
              >(You)</span
            >
          </p>
          <p class="subheader">{{ gameData.addressP2 }}</p>
        </v-flex>
      </v-layout>
      <v-layout row>
        <v-flex xs-4>
          <typing
            ref="typing-player1"
            class="headline"
            :typing-interval="30"
            :hashing-interval="15"
            :deleting-interval="30"
            :wait-time="3000"
            :tries="5"
            :address="gameData.addressP1"
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
            :address="gameData.addressP2"
          />
        </v-flex>
      </v-layout>
    </v-container>
  </span>
</template>

<script>
import { mapGetters } from 'vuex'
import Typing from '@/components/Typing'

export default {
  components: {
    Typing
  },
  computed: {
    ...mapGetters(['game', 'selectedGameId', 'coinbase']),
    gameData() {
      return this.game(this.selectedGameId)
    }
  }
}
</script>
