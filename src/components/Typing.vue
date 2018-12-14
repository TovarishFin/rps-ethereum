<template>
  <span style="width: 200px;" :class="computedClass">
    <div
      class="char-container"
      :key="index"
      v-for="(char, index) in currentArray"
    >
      <p class="char display-1 mb-0">{{ char }}</p>
    </div>
  </span>
</template>

<script>
export default {
  props: {
    secret: String,
    choice: String,
    typingInterval: Number,
    hashingInterval: Number,
    deletingInterval: Number,
    waitTime: Number,
    tries: Number,
    commit: Boolean,
    reveal: Boolean,
    winner: Boolean,
    loser: Boolean,
    tie: Boolean,
    player1: Boolean,
    player2: Boolean
  },
  data() {
    return {
      emptyBytes32:
        '0x0000000000000000000000000000000000000000000000000000000000000000',
      currentArray: this.emptyBytes32,
      bytes: 'abcdef0123456789',
      currentIndex: 0,
      typerInterval: null,
      currentActivity: null
    }
  },
  computed: {
    result() {
      switch (true) {
        case this.player1 && this.winner:
          return 'Player 1 Wins'
        case this.player1 && this.loser:
          return 'Player 1 Loses'
        case this.player1 && this.tie:
          return 'Player 1 Ties'
        case this.player2 && this.winner:
          return 'Player 2 Wins'
        case this.player2 && this.loser:
          return 'Player 2 Loses'
        case this.player2 && this.tie:
          return 'Player 2 Ties'
        default:
          return 'The Programmer screwed up... what an idiot!'
      }
    },
    computedClass() {
      switch (true) {
        case this.winner && this.currentActivity === 'printResult':
          return 'winner'
        case this.loser && this.currentActivity === 'printResult':
          return 'loser'
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

      this.typerPromise = new Promise(res => {
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
      return this.typerPromise
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
    }
  },
  created() {
    this.currentArray = this.emptyBytes32.split('')
    if (this.commit) {
      this.emptyToSecret()
    } else if (this.reveal) {
      this.emptyToSecret()
        .then(() => this.secretToChoice())
        .then(() => this.wait())
        .then(() => this.deleteAll())
        .then(() => this.printResult())
    }
  }
}
</script>
<style>
.char-container {
  display: inline-block;
  margin: 10px;
  text-align: center;
}
.char {
  text-align: center;
}
.winner {
  color: green;
}
.loser {
  color: red;
}
</style>
