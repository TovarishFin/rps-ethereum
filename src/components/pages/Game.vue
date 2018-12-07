<template>
  <game-data />
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import GameData from '@/components/GameData'

export default {
  components: {
    GameData
  },
  computed: {
    ...mapGetters(['game']),
    gameId() {
      return this.$route.params.gameId
    },
    currentGame() {
      return this.game(this.gameId)
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
