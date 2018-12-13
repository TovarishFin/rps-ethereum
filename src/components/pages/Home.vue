<template>
  <span>
    <app-stats />
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
