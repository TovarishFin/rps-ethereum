<template>
  <v-slide-y-transition mode="out-in">
    <div class="pt-4 pb-4 ml-4 mr-4"><component :is="stageComponent" /></div>
  </v-slide-y-transition>
</template>

<script>
import { mapGetters } from 'vuex'
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

export default {
  props: {
    gameId: {
      type: [Number, String],
      required: true
    }
  },
  components: {
    GameUninitialized,
    GameCreated,
    GameCancelled,
    GameReady,
    GameCommitted,
    GameTimingOut,
    GameTimedOut,
    GameTied,
    GameWinnerDecided,
    GamePaid
  },
  computed: {
    ...mapGetters(['game']),
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
  }
}
</script>
