<template>
  <span>
    <game-data />

    <game-display />

    <v-divider> </v-divider>

    <div class="mt-4 mb-4"><game-action :game-id="gameId" /></div>

    <v-divider> </v-divider>

    <game-timeline />
  </span>
</template>

<script>
import { mapActions } from 'vuex'
import GameData from '@/components/game/GameData'
import GameAction from '@/components/game/GameAction'
import GameDisplay from '@/components/game/GameDisplay'
import GameTimeline from '@/components/game/GameTimeline'

export default {
  components: {
    GameData,
    GameAction,
    GameDisplay,
    GameTimeline
  },
  computed: {
    gameId() {
      return this.$route.params.gameId
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
