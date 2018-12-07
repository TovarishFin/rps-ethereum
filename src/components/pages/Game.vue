<template>
  <span>
    <game-data />

    <component :is="stageComponent" />
  </span>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import GameData from '@/components/GameData'
import GameCreated from '@/components/GameCreated'

export default {
  components: {
    GameData,
    GameCreated
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
          return ''
        case 'Created':
          return 'GameCreated'
        default:
          return ''
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
