<template>
  <span>
    <p class="display-1">Game Status: Timing Out</p>
    <p class="headline">A player is taking too long to make a move.</p>
    <span v-show="coinbaseIsPlayer">
      <span v-show="!canCommit && !canReveal">
        <p class="headline">
          Once when enough time has passed, you can timeout the game and win by
          default!
        </p>
        <v-btn :disabled="!canTimeoutGame" @click="timeoutGame(selectedGameId)"
          >time out game</v-btn
        >
      </span>

      <span v-show="canCommit">
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

      <span v-show="canReveal">
        <p class="headline">Reveal your choice on the blockchain</p>

        <span v-show="choiceCommitDataExists">
          <p>
            You committed to {{ savedChoice }} for this game. This data is saved
            locally on your device.
          </p>
          <p>click the button below to reveal your choice.</p>
          <v-btn @click="revealChoice(choiceCommitData)"
            >reveal your choice</v-btn
          >
        </span>

        <span v-show="!choiceCommitDataExists">
          <p>
            Oh no! It looks like your commit data cannot be found locally on
            your device. We can try to reconstruct it manually in order to
            reveal it on the blockchain.
          </p>

          <p>
            If you remember the choice that you made earlier, you can simply
            select that and we should be able to reconstruct the needed data. If
            you cannot remember, you can try different choices (rock, paper, or
            scissors). One of them should work in order to reveal correctly. If
            MetaMask shows that the transaction will likely fail, click "reject"
            and try a different choice until you get a transaction that looks
            like it will succeed.
          </p>

          <v-form ref="reveal-choice-form">
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
            <v-btn @click="validateAndRevealChoice">commit your choice</v-btn>
          </v-form>
        </span>
      </span>
    </span>
  </span>
</template>

<script>
/*
  what do we need to do here?
  allow players to commit/reveal here depending on where we are currently at...
*/
import { mapGetters, mapActions } from 'vuex'
import * as VForm from 'vuetify/es5/components/VForm'
import * as VBtn from 'vuetify/es5/components/VBtn'
import * as VSelect from 'vuetify/es5/components/VSelect'

export default {
  components: {
    ...VForm,
    ...VBtn,
    ...VSelect
  },
  data() {
    return {
      choice: '0',
      choiceRules: [v => v !== '0' || 'you must make a choice.']
    }
  },
  computed: {
    ...mapGetters(['coinbase', 'selectedGameId', 'game', 'choiceCommit']),
    choices() {
      return Object.keys(this.choiceEnum).map(val => ({
        value: val,
        label: this.choiceEnum[val]
      }))
    },
    choiceCommitData() {
      return this.choiceCommit(this.selectedGameId)
    },
    choiceCommitDataExists() {
      return this.choiceCommitData != null
    },
    savedChoice() {
      return this.choiceCommitDataExists
        ? this.choiceEnum[this.choiceCommitData.choice]
        : ''
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
    canTimeoutGame() {
      return this.gameData.timedOut
    },
    canCommit() {
      const { choiceSecretP1, choiceSecretP2 } = this.gameData
      if (this.coinbaseToPlayer === 1) {
        return choiceSecretP1 === this.bytes32Zero
      } else {
        return choiceSecretP2 === this.bytes32Zero
      }
    },
    canReveal() {
      const {
        choiceSecretP1,
        choiceSecretP2,
        choiceP1,
        choiceP2
      } = this.gameData
      if (
        choiceSecretP1 !== this.bytes32Zero &&
        choiceSecretP2 !== this.bytes32Zero
      ) {
        if (this.coinbaseToPlayer === 1) {
          return this.choiceEnum[choiceP1] === 'Undecided'
        } else {
          return this.choiceEnum[choiceP2] === 'Undecided'
        }
      } else {
        return false
      }
    }
  },
  methods: {
    ...mapActions([
      'timeoutGame',
      'commitChoice',
      'revealChoice',
      'rebuildAndRevealChoice'
    ]),
    validateAndCommitChoice() {
      if (this.$refs['commit-choice-form'].validate()) {
        this.commitChoice({
          gameId: this.selectedGameId,
          choice: this.choice
        })

        this.clearForm()
      }
    },
    validateAndRevealChoice() {
      if (this.$refs['reveal-choice-form'].validate()) {
        this.rebuildAndRevealChoice({
          gameId: this.selectedGameId,
          choice: this.choice
        })

        this.clearForm()
      }
    },
    clearForm() {
      this.$refs['reveal-choice-form'].reset()
    }
  }
}
</script>
