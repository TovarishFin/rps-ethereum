<template>
  <span>
    <app-stats />
    <p class="display-4">Rock Paper Scissors Ethereum</p>
    <p class="headline">
      Possibly the most over-engineered rock paper scissors game in the world...
    </p>
    <open-games />
  </span>
</template>
<script>
import OpenGames from '../OpenGames'
import AppStats from '../AppStats'

export default {
  components: {
    AppStats,
    OpenGames
  }
}
</script>
