<template>
  <v-timeline>
    <v-timeline-item
      v-for="(gameEvent, index) in formattedLogs"
      :color="gameEvent.color"
      :key="index"
      small
    >
      <span
        slot="opposite"
        :class="`headline font-weight-bold ${gameEvent.color}--text`"
        v-text="'Block ' + gameEvent.blockNumber"
      />
      <div class="py-3">
        <h2 :class="`headline font-weight-light mb-3 ${gameEvent.color}--text`">
          {{ gameEvent.formattedEventName }}
        </h2>
        <div>{{ gameEvent.text }}</div>
      </div>
    </v-timeline-item>
  </v-timeline>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import * as VTimeline from 'vuetify/es5/components/VTimeline'

export default {
  components: {
    ...VTimeline
  },
  computed: {
    ...mapGetters(['gameLogs', 'selectedGameId', 'game']),
    formattedLogs() {
      return this.gameLogs(this.selectedGameId)
        .map(log => this.formatLog(log))
        .sort((a, b) => a.sorter - b.sorter)
    },
    gameData() {
      return this.game(this.selectedGameId)
    }
  },
  methods: {
    ...mapActions(['getGameLogs']),
    formatLog(gameEvent) {
      const { event: eventName } = gameEvent
      switch (eventName) {
        case 'StageChanged':
          return this.formatStageChanged(gameEvent)
        case 'GameCreated':
          return this.formatGameCreated(gameEvent)
        case 'GameCancelled':
          return this.formatGameCancelled(gameEvent)
        case 'GameJoined':
          return this.formatGameJoined(gameEvent)
        case 'ChoiceCommitted':
          return this.formatChoiceCommitted(gameEvent)
        case 'ChoiceRevealed':
          return this.formatChoiceRevealed(gameEvent)
        case 'TimeoutStarted':
          return this.formatTimeoutStarted(gameEvent)
        case 'TimedOut':
          return this.formatTimedOut(gameEvent)
        case 'Tied':
          return this.formatTied(gameEvent)
        case 'WinnerDecided':
          return this.formatWinnerDecided(gameEvent)
        case 'BetSettled':
          return this.formatBetSettled(gameEvent)
      }
    },
    formatStageChanged(gameEvent) {
      const {
        blockNumber,
        logIndex,
        returnValues: { stage }
      } = gameEvent

      const formattedEventName = 'Game Stage Changed'
      const text = `Game stage changed to ${this.stageEnum[stage]}.`
      const color = 'purple'
      const sorter = parseInt(blockNumber * 1000) + parseInt(logIndex)
      const formattedEvent = {
        formattedEventName,
        blockNumber,
        text,
        color,
        sorter
      }

      return formattedEvent
    },
    formatGameCreated(gameEvent) {
      const {
        blockNumber,
        logIndex,
        returnValues: { gameId, creator }
      } = gameEvent

      const formattedEventName = 'Game Created'
      const text = `Game was created by address ${creator} with gameId of ${gameId}`
      const color = 'green'
      const sorter = parseInt(blockNumber * 1000) + parseInt(logIndex)
      const formattedEvent = {
        formattedEventName,
        blockNumber,
        text,
        color,
        sorter
      }
      return formattedEvent
    },
    formatGameCancelled(gameEvent) {
      const {
        blockNumber,
        logIndex,
        returnValues: { cancellor }
      } = gameEvent

      const formattedEventName = 'Game Cancelled'
      const text = `Game was cancelled by creator (${cancellor}).`
      const color = 'red'
      const sorter = parseInt(blockNumber * 1000) + parseInt(logIndex)
      const formattedEvent = {
        formattedEventName,
        blockNumber,
        text,
        color,
        sorter
      }
      return formattedEvent
    },
    formatGameJoined(gameEvent) {
      const {
        blockNumber,
        logIndex,
        returnValues: { joiner }
      } = gameEvent

      const formattedEventName = 'Game Joined'
      const text = `Player 2 joined game as address ${joiner}.`
      const color = 'blue'
      const sorter = parseInt(blockNumber * 1000) + parseInt(logIndex)
      const formattedEvent = {
        formattedEventName,
        blockNumber,
        text,
        color,
        sorter
      }
      return formattedEvent
    },
    formatChoiceCommitted(gameEvent) {
      const {
        blockNumber,
        logIndex,
        returnValues: { committer }
      } = gameEvent
      const { choiceSecretP1, choiceSecretP2, addressP1 } = this.gameData

      const commitHash =
        committer === addressP1 ? choiceSecretP1 : choiceSecretP2
      const formattedEventName = 'Choice Committed to the Blockchain'
      const text = `Player ${
        committer === addressP1 ? '1' : '2'
      } committed choice secret: ${commitHash}`
      const color = 'teal'
      const sorter = parseInt(blockNumber * 1000) + parseInt(logIndex)

      const formattedEvent = {
        formattedEventName,
        blockNumber,
        text,
        color,
        sorter
      }
      return formattedEvent
    },
    formatChoiceRevealed(gameEvent) {
      const {
        blockNumber,
        logIndex,
        returnValues: { revealer }
      } = gameEvent
      const { choiceP1, choiceP2, addressP1 } = this.gameData

      const choice = revealer === addressP1 ? choiceP1 : choiceP2
      const formattedEventName = 'Choice Revealed'
      const text = `Player ${
        revealer === addressP1 ? '1' : '2'
      } revealed choice: ${this.choiceEnum[choice]}`
      const color = 'pink'
      const sorter = parseInt(blockNumber * 1000) + parseInt(logIndex)

      const formattedEvent = {
        formattedEventName,
        blockNumber,
        text,
        color,
        sorter
      }
      return formattedEvent
    },
    formatTimeoutStarted(gameEvent) {
      const {
        blockNumber,
        logIndex,
        returnValues: { initiator, delayer }
      } = gameEvent
      const { addressP1 } = this.gameData

      const initiatorIndex = initiator === addressP1 ? '1' : '2'
      const delayerIndex = delayer === addressP1 ? '1' : '2'
      const formattedEventName = 'Game Timeout Started'
      const text = `Player ${initiatorIndex} (${initiator}) started a timeout against Player ${delayerIndex} (${delayer}) due to taking too long to make a move.`
      const color = 'orange'
      const sorter = parseInt(blockNumber * 1000) + parseInt(logIndex)

      const formattedEvent = {
        formattedEventName,
        blockNumber,
        text,
        color,
        sorter
      }
      return formattedEvent
    },
    formatTimedOut(gameEvent) {
      const {
        blockNumber,
        logIndex,
        returnValues: { winner, loser }
      } = gameEvent
      const { addressP1 } = this.gameData

      const winnerIndex = winner === addressP1 ? '1' : '2'
      const loserIndex = loser === addressP1 ? '1' : '2'
      const formattedEventName = 'Game Timed Out'
      const text = `Player ${winnerIndex} (${winner}) won by default due to player ${loserIndex} (${loser}) taking too long to make a move.`
      const color = 'red'
      const sorter = parseInt(blockNumber * 1000) + parseInt(logIndex)

      const formattedEvent = {
        formattedEventName,
        blockNumber,
        text,
        color,
        sorter
      }
      return formattedEvent
    },
    formatTied(gameEvent) {
      const { blockNumber, logIndex } = gameEvent
      const { choiceP1 } = this.gameData

      const formattedEventName = 'Game Tied'
      const text = `Player 1 and Player 2 both picked ${
        this.choiceEnum[choiceP1]
      } and tied.`
      const color = 'amber'
      const sorter = parseInt(blockNumber * 1000) + parseInt(logIndex)

      const formattedEvent = {
        formattedEventName,
        blockNumber,
        text,
        color,
        sorter
      }
      return formattedEvent
    },
    formatWinnerDecided(gameEvent) {
      const {
        blockNumber,
        logIndex,
        returnValues: { winner, loser }
      } = gameEvent
      const { addressP1, choiceP1, choiceP2 } = this.gameData

      const winnerIndex = winner === addressP1 ? '1' : '2'
      const loserIndex = loser === addressP1 ? '1' : '2'
      const formattedEventName = 'Winner Decided'
      const text = `Player ${winnerIndex} (${winner}) beats Player ${loserIndex} (${loser}) with ${
        winnerIndex === '1'
          ? this.choiceEnum[choiceP1]
          : this.choiceEnum[choiceP2]
      } vs ${
        loserIndex === '1'
          ? this.choiceEnum[choiceP1]
          : this.choiceEnum[choiceP2]
      }`
      const color = 'cyan'
      const sorter = parseInt(blockNumber * 1000) + parseInt(logIndex)

      const formattedEvent = {
        formattedEventName,
        blockNumber,
        text,
        color,
        sorter
      }
      return formattedEvent
    },
    formatBetSettled(gameEvent) {
      const {
        blockNumber,
        logIndex,
        returnValues: { settler, winnings }
      } = gameEvent
      const { addressP1 } = this.gameData

      const settlerIndex = settler === addressP1 ? '1' : '2'
      const formattedEventName = 'Bet Settled'
      const text = `Bet was settled for player ${settlerIndex} (${settler}). ${this.weiToEth(
        winnings
      )} in winnings was transferred.`
      const color = 'light-green'
      const sorter = parseInt(blockNumber * 1000) + parseInt(logIndex)

      const formattedEvent = {
        formattedEventName,
        blockNumber,
        text,
        color,
        sorter
      }
      return formattedEvent
    }
  },
  watch: {
    gameData: {
      handler() {
        this.getGameLogs(this.selectedGameId)
      },
      deep: true
    }
  }
}
</script>

<style></style>
