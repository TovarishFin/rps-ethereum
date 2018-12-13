<template>
  <v-card>
    <v-card-title>
      Current Open Games
      <v-spacer></v-spacer>
      <v-text-field
        v-model="gameSearch"
        append-icon="search"
        label="search for a game"
        single-line
        hide-details
      >
      </v-text-field>
    </v-card-title>
    <v-data-table
      :headers="gameHeaders"
      :items="coinbaseActiveGames"
      :search="gameSearch"
      class="elevation-1 mb-4"
    >
      <template slot="items" slot-scope="props">
        <td class="text-xs-left">
          <v-btn @click="goToGame(props.item.gameId)">view game</v-btn>
        </td>
        <td class="text-xs-left">{{ props.item.gameId }}</td>
        <td class="text-xs-left">
          {{ shortenAddress(props.item.tokenAddress) }}
        </td>
        <td class="text-xs-left">{{ shortenAddress(props.item.addressP1) }}</td>
        <td class="text-xs-left">{{ weiToEth(props.item.bet) }}</td>
      </template>
      <template slot="no-results">
        <p class="display-1 pa-4">no games found</p>
      </template>
      <template slot="pageText" slot-scope="props">
        Games {{ props.pageStart }} - {{ props.pageStop }} of
        {{ props.itemsLength }}
      </template>
    </v-data-table>
  </v-card>
</template>
<script>
import { mapGetters } from 'vuex'
import * as VTextField from 'vuetify/es5/components/VTextField'
import * as VBtn from 'vuetify/es5/components/VBtn'
import * as VDataTable from 'vuetify/es5/components/VDataTable'
import * as VCard from 'vuetify/es5/components/VCard'

export default {
  components: {
    ...VTextField,
    ...VBtn,
    ...VDataTable,
    ...VCard
  },
  data() {
    return {
      gameSearch: '',
      gameHeaders: [
        {
          text: 'View Game',
          value: ''
        },
        {
          text: 'Game ID',
          value: 'gameId'
        },
        {
          text: 'Token',
          value: 'tokenAddress'
        },
        {
          text: 'Creator',
          value: 'addressP1'
        },
        {
          text: 'Wager',
          value: 'bet'
        }
      ]
    }
  },
  computed: {
    ...mapGetters(['coinbaseActiveGames'])
  },
  methods: {
    goToGame(gameId) {
      this.$router.push({ name: 'Game', params: { gameId } })
    }
  }
}
</script>
