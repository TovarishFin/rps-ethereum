<template>
  <span>
    <p class="display-1">Game Status: Ready</p>
    <p class="headline">
      Waiting on each player to commit their choices as a secret on the
      blockchain.
    </p>
    <span v-show="coinbaseIsPlayer">
      <span v-show="!coinbaseHasCommitted">
        <p class="headline">
          Make your choice send it as a secret to the blockchain
        </p>
        <v-form ref="commit-choice-form">
          <v-select
            v-model="choice"
            :items="choices"
            item-text="label"
            item-value="value"
            label="your choice"
            :rules="choiceRules"
            :return-object="false"
            required
          />
          <v-btn @click="validateAndCommitChoice">commit your choice</v-btn>
        </v-form>
      </span>
      <span v-show="coinbaseHasCommitted">
        <p class="headline">You have already committed your choice.</p>
        <p>
          If the other player is taking too long feel free to start a timeout.
        </p>
      </span>

      <v-btn
        :disabled="!canStartTimeout"
        @click="startGameTimeout(selectedGameId)"
        >start timeout</v-btn
      >
    </span>

    <span v-show="!coinbaseIsPlayer">
      <p class="headline">You are a not playing in this game.</p>
      <p>Feel free to spectate!</p>
    </span>
  </span>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import * as VForm from 'vuetify/es5/components/VForm'
import * as VBtn from 'vuetify/es5/components/VBtn'
import * as VSelect from 'vuetify/es5/components/VSelect'

export default {
  data() {
    return {
      choice: '0',
      choiceRules: [v => v !== '0' || 'you must make a choice.']
    }
  },
  components: {
    ...VForm,
    ...VBtn,
    ...VSelect
  },
  computed: {
    ...mapGetters(['coinbase', 'selectedGameId', 'game']),
    choices() {
      return Object.keys(this.choiceEnum).map(val => ({
        value: val,
        label: this.choiceEnum[val]
      }))
    },
    gameData() {
      return this.game(this.selectedGameId)
    },
    coinbaseIsPlayer() {
      const { addressP1, addressP2 } = this.gameData
      return this.coinbase == addressP1 || this.coinbase == addressP2
    },
    coinbaseToPlayer() {
      const { addressP1 } = this.gameData
      if (this.coinbaseIsPlayer) {
        return this.coinbase === addressP1 ? 1 : 2
      } else {
        return 0
      }
    },
    coinbaseHasCommitted() {
      const { choiceSecretP1, choiceSecretP2 } = this.gameData
      if (this.coinbaseToPlayer === 1) {
        return choiceSecretP1 !== this.bytes32Zero
      } else {
        return choiceSecretP2 !== this.bytes32Zero
      }
    },
    canStartTimeout() {
      const { choiceSecretP1, choiceSecretP2 } = this.gameData
      return (
        (choiceSecretP1 === this.bytes32Zero ||
          choiceSecretP2 === this.bytes32Zero) &&
        (choiceSecretP1 !== this.bytes32Zero ||
          choiceSecretP2 !== this.bytes32Zero)
      )
    }
  },
  methods: {
    ...mapActions(['commitChoice', 'startGameTimeout']),
    validateAndCommitChoice() {
      if (this.$refs['commit-choice-form'].validate()) {
        this.commitChoice({
          gameId: this.selectedGameId,
          choice: this.choice
        })

        this.clearForm()
      }
    },
    clearForm() {
      this.$refs['commit-choice-form'].reset()
    }
  }
}
</script>
