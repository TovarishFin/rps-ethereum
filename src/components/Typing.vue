<template>
  <span :class="computedClass">
    <pre class="char" :key="index" v-for="(char, index) in currentArray">
      {{ char }}
    </pre>
  </span>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  props: {
    typingnInterval: Number,
    hashingInterval: Number,
    deletingInterval: Number,
    waitTime: Number,
    tries: Number,
    address: String
  },
  data() {
    return {
      emptyBytes32:
        '0x0000000000000000000000000000000000000000000000000000000000000000',
      currentArray: null,
      bytes: 'abcdef0123456789',
      currentIndex: 0,
      typerInterval: null,
      currentActivity: null,
      resultReady: false
    }
  },
  computed: {
    ...mapGetters(['game', 'selectedGameId']),
    gameData() {
      return this.game(this.selectedGameId)
    },
    playerNumber() {
      const { addressP1 } = this.gameData
      return this.address === addressP1 ? 1 : 2
    },
    choice() {
      return this.playerNumber === 1
        ? this.choiceEnum[this.gameData.choiceP1]
        : this.choiceEnum[this.gameData.choiceP2]
    },
    secret() {
      return this.playerNumber === 1
        ? this.gameData.choiceSecretP1
        : this.gameData.choiceSecretP2
    },
    status() {
      const { stage, winner } = this.gameData
      const stageInt = parseInt(stage)
      switch (true) {
        case stageInt < 5:
          return 'Undecided'
        case this.stageEnum[stage] === 'Tied' ||
          (this.stageEnum[stage] === 'Paid' && winner === this.addressZero):
          return 'Tied'
        case stageInt > 5 && winner === this.address:
          return 'Winner'
        case stageInt > 5 && winner !== this.address:
          return 'Loser'
        default:
          return 'Undecided'
      }
    },
    result() {
      switch (true) {
        case this.playerNumber === 1 && this.status === 'Winner':
          return 'Player 1 Wins'
        case this.playerNumber === 1 && this.status === 'Loser':
          return 'Player 1 Loses'
        case this.playerNumber === 2 && this.status === 'Winner':
          return 'Player 2 Wins'
        case this.playerNumber === 2 && this.status === 'Loser':
          return 'Player 2 Loses'
        case this.status === 'Tied':
          return 'Tie'
        case this.status === 'Undecided':
          return 'Waiting'
        default:
          return 'The Programmer screwed up... what an idiot!'
      }
    },
    computedClass() {
      switch (true) {
        case this.status === 'Winner' && this.resultReady:
          return 'green--text'
        case this.status === 'Loser' && this.resultReady:
          return 'red--text'
        case this.status === 'Tied' && this.resultReady:
          return 'amber--text'
        default:
          return ''
      }
    }
  },
  methods: {
    randomByte() {
      return this.bytes.charAt(Math.floor(Math.random() * this.bytes.length))
    },
    replaceRand() {
      this.currentArray.splice(this.currentIndex, 1, this.randomByte())
    },
    replaceCorrectSecret() {
      this.currentArray.splice(
        this.currentIndex,
        1,
        this.secret[this.currentIndex]
      )
      this.currentIndex--
    },
    replaceCorrectChoice() {
      this.currentArray.splice(
        this.currentIndex,
        1,
        this.choice[this.currentIndex]
      )
      this.currentIndex--
    },
    typeResult() {
      this.currentArray.splice(
        this.currentIndex,
        1,
        this.result[this.currentIndex]
      )
      this.currentIndex++
    },
    deleteChar() {
      this.currentArray.splice(-1, 1)
      this.currentIndex--
    },

    emptyToSecret() {
      this.currentArray = this.emptyBytes32.split('')
      this.currentIndex = this.currentArray.length - 1
      this.currentActivity = 'emptyToSecret'
      return new Promise(res => {
        let i = 0
        this.typerInterval = setInterval(
          function() {
            i % this.tries === 0
              ? this.replaceCorrectSecret()
              : this.replaceRand()
            i++
            if (this.currentIndex < 0) {
              res(true)
              clearInterval(this.typerInterval)
            }
          }.bind(this),
          this.hashingInterval
        )
      })
    },
    secretToChoice() {
      this.currentArray = this.secret.split('')
      this.currentIndex = this.currentArray.length - 1
      this.currentActivity = 'emptyToChoice'

      return new Promise(res => {
        let i = 0
        this.typerInterval = setInterval(
          function() {
            switch (true) {
              case this.currentArray.length > this.choice.length:
                this.deleteChar()
                break
              case i % this.tries === 0:
                this.replaceCorrectChoice()
                break
              case i % this.tries !== 0:
                this.replaceRand()
                break
            }

            i++
            if (this.currentIndex < 0) {
              res(true)
              clearInterval(this.typerInterval)
            }
          }.bind(this),
          this.deletingInterval
        )
      })
    },
    deleteAll() {
      this.currentIndex = this.currentArray.length
      this.currentActivity = 'deleteAll'

      return new Promise(res => {
        this.typerInterval = setInterval(
          function() {
            this.deleteChar()

            if (this.currentIndex < 0) {
              res(true)
              clearInterval(this.typerInterval)
            }
          }.bind(this),
          this.deletingInterval
        )
      })
    },
    wait() {
      return new Promise(res => {
        setTimeout(
          function() {
            res(true)
          }.bind(this),
          this.waitTime
        )
      })
    },
    printResult() {
      this.currentArray = []
      this.currentIndex = 0
      this.currentActivity = 'printResult'
      return new Promise(res => {
        this.typerInterval = setInterval(
          function() {
            this.typeResult()

            if (this.currentIndex > this.result.length) {
              res(true)
              clearInterval(this.typerInterval)
            }
          }.bind(this),
          this.typingInterval
        )
      })
    },
    clearCurrentActivity() {
      this.currentActivity = null
      return true
    },
    setResultReady(ready) {
      this.resultReady = ready
      return true
    },
    startEmptyToSecret() {
      this.setResultReady(false)
      clearInterval(this.typerInterval)
      switch (true) {
        case this.currentActivity === null && this.secret === this.emptyBytes32:
          return this.secretToChoice()
        case this.currentActivity === null && this.secret !== this.emptyBytes32:
          return this.emptyToSecret().then(() => this.secretToChoice())
        case this.currentActivity === 'emptyToSecret':
          return
        default:
          return this.deleteAll()
            .then(() => this.emptyToSecret())
            .then(() => this.secretToChoice())
            .then(() => this.clearCurrentActivity())
      }
    },
    startEmptyToResult() {
      this.setResultReady(false)
      clearInterval(this.typerInterval)
      switch (true) {
        case this.currentActivity === null:
          return this.emptyToSecret()
            .then(() => this.secretToChoice())
            .then(() => this.setResultReady(true))
            .then(() => this.wait())
            .then(() => this.deleteAll())
            .then(() => this.printResult())
            .then(() => this.clearCurrentActivity())
        case this.currentActivity === 'emptyToChoice':
          return
        default:
          return this.deleteAll()
            .then(() => this.emptyToSecret())
            .then(() => this.secretToChoice())
            .then(() => this.setResultReady(true))
            .then(() => this.wait())
            .then(() => this.deleteAll())
            .then(() => this.printResult())
            .then(() => this.clearCurrentActivity())
      }
    }
  },
  watch: {
    gameData: {
      handler(newData, oldData) {
        const {
          stage,
          choiceSecretP1,
          choiceSecretP2,
          choiceP1,
          choiceP2
        } = newData
        const {
          stage: stageOrig,
          choiceSecretP1: choiceSecretP1Orig,
          choiceSecretP2: choiceSecretP2Orig,
          choiceP1: choiceP1Orig,
          choiceP2: choiceP2Orig
        } = oldData

        const shouldUpdate =
          stageOrig !== stage ||
          choiceSecretP1Orig !== choiceSecretP1 ||
          choiceSecretP2Orig !== choiceSecretP2 ||
          choiceP1Orig !== choiceP1 ||
          choiceP2Orig !== choiceP2

        if (parseInt(stage) > 0 && shouldUpdate) {
          if (parseInt(stage) < 5) {
            this.startEmptyToSecret()
          } else {
            this.startEmptyToResult()
          }
        }
      },
      deep: true
    }
  }
}
</script>
<style>
.char {
  display: inline-block;
  white-space: pre-line;
}
</style>
