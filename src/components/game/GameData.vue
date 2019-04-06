<template>
  <span>
    <token-data-of />
    <v-card>
      <v-card-title> Game Information </v-card-title>
      <v-data-table
        :headers="gameHeaders"
        :items="gameData"
        hide-actions
        class="elevation-1 mb-4"
      >
        <template slot="items" slot-scope="props">
          <td>{{ props.item.gameId }}</td>
          <td class="text-xs-left">
            {{ shortenAddress(props.item.addressP1) }}
          </td>
          <td class="text-xs-left">
            {{ shortenAddress(props.item.addressP2) }}
          </td>
          <td class="text-xs-left">{{ weiToEth(props.item.bet) }}</td>
          <td class="text-xs-left">{{ choiceEnum[props.item.choiceP1] }}</td>
          <td class="text-xs-left">{{ choiceEnum[props.item.choiceP2] }}</td>
          <td class="text-xs-left">
            {{ shortenAddress(props.item.choiceSecretP1) }}
          </td>
          <td class="text-xs-left">
            {{ shortenAddress(props.item.choiceSecretP2) }}
          </td>
          <td class="text-xs-left">{{ stageEnum[props.item.stage] }}</td>
          <td class="text-xs-left">{{ shortenAddress(props.item.winner) }}</td>
        </template>
        <template slot="no-results">
          <p class="display-1 pa-4">invalid game</p>
        </template>
      </v-data-table>
    </v-card>
  </span>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import TokenDataOf from '@/components/TokenDataOf'

export default {
  components: {
    TokenDataOf
  },
  data() {
    return {
      gameHeaders: [
        {
          text: 'Game ID',
          value: 'gameId',
          sortable: false
        },
        {
          text: 'P1',
          value: 'addressP1',
          sortable: false
        },
        {
          text: 'P2',
          value: 'addressP2',
          sortable: false
        },
        {
          text: 'Wager',
          value: 'bet',
          sortable: false
        },
        {
          text: 'Choice P1',
          value: 'choiceP1',
          sortable: false
        },
        {
          text: 'Choice P2',
          value: 'choiceP1',
          sortable: false
        },
        {
          text: 'Choice Secret P1',
          value: 'choiceSecretP1',
          sortable: false
        },
        {
          text: 'Choice Secret P2',
          value: 'choiceSecretP2',
          sortable: false
        },
        {
          text: 'Stage',
          value: 'stage',
          sortable: false
        },
        {
          text: 'Winner',
          value: 'winner',
          sortable: false
        }
      ]
    }
  },
  computed: {
    ...mapGetters(['selectedGameId', 'game']),
    gameData() {
      return [this.game(this.selectedGameId)]
    }
  },
  methods: {
    ...mapActions(['setSelectedTokenAddress'])
  },
  watch: {
    gameData() {
      this.setSelectedTokenAddress(this.gameData[0].tokenAddress)
    }
  }
}
</script>
