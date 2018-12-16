<template>
  <span>
    <app-stats />
    <p class="display-4">Rock Paper Scissors Ethereum</p>
    <p class="headline">
      Possibly the most overengineered rock paper scissors game in the world...
    </p>
    <open-games />
    <p @click="setModalOpen(!modalOpen)">click me</p>
  </span>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'
import OpenGames from '../OpenGames'
import AppStats from '../AppStats'

export default {
  computed: {
    ...mapGetters(['modalOpen'])
  },
  methods: {
    ...mapActions(['setModalOpen'])
  },
  components: {
    AppStats,
    OpenGames
  }
}
</script>
