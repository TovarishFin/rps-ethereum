<template>
  <v-container fluid>
    <v-layout column align-center>
      <p>TODO: put an introduction along with how to use here...</p>
      <ul>
        <li>FoundersWallet address: {{ foundersWalletAddress }}</li>
        <li>
          FoundersWallet ether balance (in wei):
          {{ foundersWalletEtherBalance }}
        </li>
        <li>minimum votes: {{ minimumVotes }}</li>
        <li>voter count: {{ voterCount }}</li>
        <li>action nonce: {{ actionNonce }}</li>
        <li>token release date: {{ tokenReleaseDate }}</li>
        <li>scutixCoin address: {{ scutixCoinAddress }}</li>
      </ul>
      <p class="display-2">
        {{
          coinbaseIsVoter
            ? 'Your current address is a voter'
            : 'Your current address is not a voter'
        }}
      </p>
    </v-layout>
  </v-container>
</template>
<script>
import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters([
      'minimumVotes',
      'voterCount',
      'actionNonce',
      'tokenReleaseDate',
      'scutixCoinAddress',
      'foundersWalletAddress',
      'foundersWalletEtherBalance',
      'coinbaseIsVoter'
    ])
  }
}
</script>
