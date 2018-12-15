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
      :items="formattedGames"
      item-key="gameId"
      :search="gameSearch"
      class="elevation-1 mb-4"
    >
      <template slot="items" slot-scope="props">
        <tr @click="selectGame(props, props.item.gameId)">
          <td class="text-xs-left">
            <v-btn @click="goToGame(props.item.gameId)">view game</v-btn>
          </td>
          <td class="text-xs-left">{{ props.item.gameId }}</td>
          <td class="text-xs-left">
            {{ props.item.bet }} {{ props.item.token }}
          </td>
          <td class="text-cs-left">{{ props.item.stage }}</td>
          <td
            :class="
              deternmineActionClass(props.item.requiredAction) + ' text-cs-left'
            "
          >
            {{ props.item.requiredAction }}
          </td>
          <td class="text-cs-left">{{ props.item.result }}</td>
        </tr>
      </template>
      <template slot="no-results">
        <p class="display-1 pa-4">no games found</p>
      </template>
      <template slot="expand" slot-scope="props">
        <div class="mt-5"><game-action :game-id="props.item.gameId" /></div>
      </template>
      <template slot="pageText" slot-scope="props">
        Games {{ props.pageStart }} - {{ props.pageStop }} of
        {{ props.itemsLength }}
      </template>
    </v-data-table>
  </v-card>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'
import * as VTextField from 'vuetify/es5/components/VTextField'
import * as VBtn from 'vuetify/es5/components/VBtn'
import * as VDataTable from 'vuetify/es5/components/VDataTable'
import * as VCard from 'vuetify/es5/components/VCard'
import GameAction from '@/components/game/GameAction'

export default {
  components: {
    ...VTextField,
    ...VBtn,
    ...VDataTable,
    ...VCard,
    GameAction
  },
  data() {
    return {
      gameSearch: '',
      gameHeaders: [
        {
          text: 'View Game',
          value: ''
        },
        {
          text: 'Game ID',
          value: 'gameId'
        },
        {
          text: 'Wager',
          value: 'bet'
        },
        {
          text: 'Stage',
          value: 'stage'
        },
        {
          text: 'Required Action',
          value: 'requiredAction'
        },
        {
          text: 'Result',
          value: 'result'
        }
      ]
    }
  },
  computed: {
    ...mapGetters(['coinbaseActiveGameIds', 'game', 'coinbase', 'tokenDataOf']),
    formattedGames() {
      return this.coinbaseActiveGameIds
        .map(gameId => this.game(gameId))
        .map(game => ({
          ...this.game(game.gameId),
          result: this.result(game.gameId),
          requiredAction: this.requiredAction(game.gameId),
          bet: this.weiToEth(game.bet),
          stage: this.stageEnum[game.stage],
          token: this.tokenDataOf(game.tokenAddress).symbol
        }))
    }
  },
  methods: {
    ...mapActions(['setSelectedGameId']),
    goToGame(gameId) {
      this.$router.push({ name: 'Game', params: { gameId } })
    },
    selectGame(props, gameId) {
      props.expanded = !props.expanded
      this.setSelectedGameId(gameId)
    },
    shouldHaveWinner(gameId) {
      const { stage } = this.game(gameId)
      return parseInt(stage) > 5
    },
    result(gameId) {
      const { winner } = this.game(gameId)
      switch (true) {
        case winner === this.coinbase:
          return 'Win'
        case this.shouldHaveWinner(gameId) && winner === this.addressZero:
          return 'Tie'
        case this.shouldHaveWinner(gameId) &&
          winner !== this.addressZero &&
          winner !== this.coinbase:
          return 'Loss'
        case !this.shouldHaveWinner(gameId):
          return 'Undetermined'
        default:
          return 'Undertermined'
      }
    },
    playerIndex(gameId) {
      const { addressP1 } = this.game(gameId)
      return this.coinbase === addressP1 ? 1 : 2
    },
    bothCommitsExist(gameId) {
      const { choiceSecretP1, choiceSecretP2 } = this.game(gameId)
      return (
        choiceSecretP1 !== this.bytes32Zero &&
        choiceSecretP2 !== this.bytes32Zero
      )
    },

    requiredAction(gameId) {
      const {
        choiceSecretP1,
        choiceSecretP2,
        choiceP1,
        choiceP2,
        stage,
        timedOut
      } = this.game(gameId)
      if (this.playerIndex(gameId) === 1) {
        switch (true) {
          case this.stageEnum[stage] === 'Ready' &&
            choiceSecretP1 === this.bytes32Zero:
            return 'Commit: required'
          case this.stageEnum[stage] === 'Committed' &&
            this.choiceEnum[choiceP1] === 'Undecided':
            return 'Reveal: required'
          case this.stageEnum[stage] === 'Timing Out' &&
            !this.bothCommitsExist(gameId) &&
            choiceSecretP1 === this.bytes32Zero:
            return 'Commit: URGENT'
          case this.stageEnum[stage] === 'Timing Out' &&
            this.bothCommitsExist(gameId) &&
            this.choiceEnum[choiceP1] === 'Undecided':
            return 'Reveal: URGENT'
          case this.stageEnum[stage] === 'Timing Out' && timedOut:
            return 'Timeout: required'
          case parseInt(stage) > 5 &&
            this.stageEnum[stage] !== 'Paid' &&
            (this.result(gameId) === 'Win' || this.result(gameId) === 'Tie'):
            return 'Settle: required'
          default:
            return 'Nothing'
        }
      } else {
        switch (true) {
          case this.stageEnum[stage] === 'Ready' &&
            choiceSecretP2 === this.bytes32Zero:
            return 'Commit: required'
          case this.stageEnum[stage] === 'Committed' &&
            this.choiceEnum[choiceP2] === 'Undecided':
            return 'Reveal: required'
          case this.stageEnum[stage] === 'Timing Out' &&
            !this.bothCommitsExist(gameId) &&
            choiceSecretP2 === this.bytes32Zero:
            return 'Commit: URGENT'
          case this.stageEnum[stage] === 'Timing Out' &&
            this.bothCommitsExist(gameId) &&
            this.choiceEnum[choiceP2] === 'Undecided':
            return 'Reveal: URGENT'
          case this.stageEnum[stage] === 'Timing Out' && timedOut:
            return 'Timeout: required'
          case parseInt(stage) > 5 && this.stageEnum[stage] !== 'Paid':
            return 'Settle: required'
          default:
            return 'Nothing'
        }
      }
    },
    deternmineActionClass(requiredAction) {
      switch (requiredAction) {
        case 'Nothing: required':
          return ''
        case 'Commit: required':
          return 'yellow--text'
        case 'Reveal: required':
          return 'yellow--text'
        case 'Timeout: required':
          return 'amber--text'
        case 'Settle: required':
          return 'yellow--text'
        case 'Reveal: URGENT':
          return 'red--text'
        case 'Commit: URGENT':
          return 'red--text'
      }
    }
  }
}
</script>
