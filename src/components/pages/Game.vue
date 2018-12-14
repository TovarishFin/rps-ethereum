<template>
  <span>
    <game-data />

    <game-display />

    <v-divider> </v-divider>

    <div class="mt-4 mb-4"><component :is="stageComponent" /></div>

    <v-divider> </v-divider>

    <game-timeline />
  </span>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import GameData from '@/components/GameData'
import GameUninitialized from '@/components/game/GameUninitialized'
import GameCreated from '@/components/game/GameCreated'
import GameCancelled from '@/components/game/GameCancelled'
import GameReady from '@/components/game/GameReady'
import GameCommitted from '@/components/game/GameCommitted'
import GameTimingOut from '@/components/game/GameTimingOut'
import GameTimedOut from '@/components/game/GameTimedOut'
import GameTied from '@/components/game/GameTied'
import GameWinnerDecided from '@/components/game/GameWinnerDecided'
import GamePaid from '@/components/game/GamePaid'
import GameDisplay from '@/components/game/GameDisplay'
import GameTimeline from '@/components/game/GameTimeline'
import * as VDivider from 'vuetify/es5/components/VDivider'

export default {
  components: {
    GameData,
    GameUninitialized,
    GameCreated,
    GameCancelled,
    GameReady,
    GameCommitted,
    GameTimingOut,
    GameTimedOut,
    GameTied,
    GameWinnerDecided,
    GamePaid,
    GameDisplay,
    GameTimeline,
    ...VDivider
  },
  computed: {
    ...mapGetters(['game']),
    gameId() {
      return this.$route.params.gameId
    },
    gameData() {
      return this.game(this.gameId)
    },
    stageComponent() {
      switch (this.stageEnum[this.gameData.stage]) {
        case 'Uninitialized':
          return 'GameUninitialized'
        case 'Created':
          return 'GameCreated'
        case 'Cancelled':
          return 'GameCancelled'
        case 'Ready':
          return 'GameReady'
        case 'Committed':
          return 'GameCommitted'
        case 'Timing Out':
          return 'GameTimingOut'
        case 'Timed Out':
          return 'GameTimedOut'
        case 'Tied':
          return 'GameTied'
        case 'Winner Decided':
          return 'GameWinnerDecided'
        case 'Paid':
          return 'GamePaid'
        default:
          return 'GameUninitialized'
      }
    }
  },
  methods: {
    ...mapActions(['setSelectedGameId', 'getGameLogs'])
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.setSelectedGameId(to.params.gameId)
      vm.getGameLogs(to.params.gameId)
    })
  }
}
</script>
