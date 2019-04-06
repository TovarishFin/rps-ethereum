<template>
  <span>
    <p class="display-1">Game Status: Committed</p>
    <p class="headline">Each player must now reveal their choices.</p>
    <span v-show="coinbaseIsPlayer">
      <span v-show="!coinbaseHasRevealed">
        <p class="headline">Reveal your choice on the blockchain</p>

        <span v-show="choiceCommitDataExists">
          <p>
            You committed to {{ savedChoice }} for this game. This data is saved
            locally on your device.
          </p>
          <p>click the button below to reveal your choice.</p>
          <eth-button-wrapper>
            <v-btn @click="revealChoice(choiceCommitData)">
              reveal your choice
            </v-btn>
          </eth-button-wrapper>
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
            <eth-button-wrapper>
              <v-btn @click="validateAndRevealChoice">reveal your choice</v-btn>
            </eth-button-wrapper>
          </v-form>
        </span>
      </span>
      <span v-show="coinbaseHasRevealed">
        <p class="headline">You have already revealed your choice.</p>
        <p>
          If the other player is taking too long feel free to start a timeout.
        </p>
        <eth-button-wrapper>
          <v-btn
            :disabled="!canStartTimeout"
            @click="startGameTimeout(selectedGameId)"
          >
            start timeout
          </v-btn>
        </eth-button-wrapper>
      </span>
    </span>

    <span v-show="!coinbaseIsPlayer">
      <p class="headline">You are a not playing in this game.</p>
      <p>Feel free to spectate!</p>
    </span>
  </span>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
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
    coinbaseHasRevealed() {
      const { choiceP1, choiceP2 } = this.gameData
      if (this.coinbaseToPlayer === 1) {
        return this.choiceEnum[choiceP1.toString()] !== 'Undecided'
      } else {
        return this.choiceEnum[choiceP2.toString()] !== 'Undecided'
      }
    },
    canStartTimeout() {
      const { choiceP1, choiceP2 } = this.gameData
      return (
        (this.choiceEnum[choiceP1.toString()] === 'Undecided' ||
          this.choiceEnum[choiceP2.toString()] === 'Undecided') &&
        (this.choiceEnum[choiceP1.toString()] !== 'Undecided' ||
          this.choiceEnum[choiceP2.toString()] !== 'Undecided')
      )
    }
  },
  methods: {
    ...mapActions([
      'revealChoice',
      'rebuildAndRevealChoice',
      'startGameTimeout'
    ]),
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
