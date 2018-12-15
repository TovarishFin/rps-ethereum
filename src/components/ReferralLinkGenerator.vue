<template>
  <span>
    <v-list two-line subheader class="mb-4">
      <v-subheader>Referral Links</v-subheader>
      <v-list-tile :class="{ 'red--text': !linkAddressValid }">
        <v-list-tile-action>
          <v-btn
            @click="copyLink(baseLink)"
            flat
            icon
            :disabled="!linkAddressValid"
          >
            <v-icon>mdi-content-copy</v-icon>
          </v-btn>
        </v-list-tile-action>

        <v-list-tile-content>
          <v-list-tile-title>{{ baseLink }}</v-list-tile-title>
          <v-list-tile-sub-title>Links to the home page.</v-list-tile-sub-title>
        </v-list-tile-content>
      </v-list-tile>

      <v-list-tile :class="{ 'red--text': !linkAddressValid }">
        <v-list-tile-action>
          <v-btn
            @click="copyLink(playMoneyLink)"
            flat
            icon
            :disabled="!linkAddressValid"
          >
            <v-icon>mdi-content-copy</v-icon>
          </v-btn>
        </v-list-tile-action>

        <v-list-tile-content>
          <v-list-tile-title>{{ playMoneyLink }}</v-list-tile-title>
          <v-list-tile-sub-title>
            Links a page giving free tokens to play with.
          </v-list-tile-sub-title>
        </v-list-tile-content>
      </v-list-tile>

      <v-list-tile :class="{ 'red--text': !linkAddressValid }">
        <v-list-tile-action>
          <v-btn
            @click="copyLink(createGameLink)"
            flat
            icon
            :disabled="!linkAddressValid"
          >
            <v-icon>mdi-content-copy</v-icon>
          </v-btn>
        </v-list-tile-action>

        <v-list-tile-content>
          <v-list-tile-title>{{ createGameLink }}</v-list-tile-title>
          <v-list-tile-sub-title>
            Links to the game creation page.
          </v-list-tile-sub-title>
        </v-list-tile-content>
      </v-list-tile>

      <v-list-tile
        :class="{ 'red--text': !linkAddressValid || !linkGameIdValid }"
      >
        <v-list-tile-action>
          <v-btn
            @click="copyLink(joinGameLink)"
            flat
            icon
            :disabled="!linkAddressValid || !linkGameIdValid"
          >
            <v-icon>mdi-content-copy</v-icon>
          </v-btn>
        </v-list-tile-action>

        <v-list-tile-content>
          <v-list-tile-title>{{ joinGameLink }}</v-list-tile-title>
          <v-list-tile-sub-title>
            Links directly to game with gameId of {{ referralGameId }}
          </v-list-tile-sub-title>
        </v-list-tile-content>
      </v-list-tile>
    </v-list>
    <p>
      You can use/create a referral link using either your current address or
      any other address.
    </p>
    <v-text-field
      v-model="referralAddress"
      :placerholder="coinbase"
      label="desired referral address"
      :rules="addressRules"
    />

    <p>
      For a bit of even more fine tuned control, you can also refer a player
      directly to a game. Select a gameId below to create a link to a specific
      game. The default with 0 below, creates a link to a game with gameId of 0
      (this game doesn't exist).
    </p>

    <v-text-field
      v-model="referralGameId"
      label="desired referral gameId"
      :rules="gameIdRules"
      type="number"
    />
    <v-btn @click="resetReferralAddress">
      reset referral address to current address
    </v-btn>
  </span>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import * as VTextField from 'vuetify/es5/components/VTextField'
import * as VList from 'vuetify/es5/components/VList'
import * as VSubheader from 'vuetify/es5/components/VSubheader'
import * as VIcon from 'vuetify/es5/components/VIcon'

export default {
  components: {
    ...VTextField,
    ...VList,
    ...VSubheader,
    ...VIcon
  },
  data() {
    return {
      referralAddress: '',
      addressRules: [v => this.isAddress(v) || 'must be a valid address'],
      gameIdRules: [
        v => parseInt(v) > 0 || 'must be a valid gameId which can be joined'
      ]
    }
  },
  computed: {
    ...mapGetters(['coinbase', 'game', 'selectedGameId']),
    gameData() {
      return this.game(this.referralGameId)
    },
    referralGameId: {
      get() {
        return this.selectedGameId
      },
      set(gameId) {
        this.setSelectedGameId(gameId)
      }
    },
    referralSuffix() {
      return `?ref=${this.referralAddress.toLowerCase()}`
    },
    baseLink() {
      return this.linkAddressValid
        ? window.location.origin + this.referralSuffix
        : 'Link is invalid. Make sure that the referral address is a properly formed address.'
    },
    playMoneyLink() {
      return this.linkAddressValid
        ? window.location.origin + '/play-money' + this.referralSuffix
        : 'Link is invalid. Make sure that the referral address is a properly formed address.'
    },
    createGameLink() {
      return this.linkAddressValid
        ? window.location.origin + '/create-game' + this.referralSuffix
        : 'Link is invalid. Make sure that the referral address is a properly formed address.'
    },
    joinGameLink() {
      return this.linkGameIdValid && this.linkAddressValid
        ? window.location.origin +
            '/games/' +
            this.referralGameId +
            this.referralSuffix
        : 'Link is invalid. Make sure that you are linking to a valid gameId and using a real address.'
    },
    linkAddressValid() {
      return this.isAddress(this.referralAddress)
    },
    linkGameIdValid() {
      return this.stageEnum[this.gameData.stage] === 'Created'
    }
  },
  methods: {
    ...mapActions(['createNotification', 'setSelectedGameId']),
    copyLink(link) {
      this.$copyText(link)
        .then(() => this.onCopySuccess())
        .catch(() => this.onCopyError())
    },
    onCopySuccess() {
      this.createNotification('link copied to clipboard')
    },
    onCopyError() {
      this.createNotification('Could NOT copy link to clipboard')
    },
    resetReferralAddress() {
      this.referralAddress = this.coinbase
    }
  },
  mounted() {
    this.referralAddress = this.coinbase
  }
}
</script>
