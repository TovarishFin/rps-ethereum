<template>
  <v-container align-center>
    <v-layout row wrap>
      <v-flex xs4>
        <p class="text-xs-center">Global Plays: {{ totalPlayCount }}</p>
      </v-flex>
      <v-flex xs4>
        <p class="text-xs-center">Global Wins: {{ totalWinCount }}</p>
      </v-flex>
      <v-flex xs4>
        <p class="text-xs-center">Global Won: {{ weiToEth(totalWinVolume) }}</p>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters(['totalPlayCount', 'totalWinCount', 'totalWinVolume'])
  }
}
</script>
