<template>
  <span>
    <game-data />

    <component :is="stageComponent" />
  </span>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import GameData from '@/components/GameData'
import GameUninitialized from '@/components/GameUninitialized'
import GameCreated from '@/components/GameCreated'
import GameCancelled from '@/components/GameCancelled'
import GameReady from '@/components/GameReady'
import GameCommitted from '@/components/GameCommitted'
import GameTimingOut from '@/components/GameTimingOut'
import GameTimedOut from '@/components/GameTimedOut'
import GameTied from '@/components/GameTied'
import GameWinnerDecided from '@/components/GameWinnerDecided'
import GamePaid from '@/components/GamePaid'

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
    GamePaid
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
    ...mapActions(['setSelectedGameId'])
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.setSelectedGameId(to.params.gameId)
    })
  }
}
</script>
