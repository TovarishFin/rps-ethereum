const {
  setupContracts,
  addressZero,
  ethUser,
  tokenUser,
  assertRevert,
  timeWarp
} = require('./helpers/general')
const {
  defaultTimeoutInSeconds,
  choices,
  testInitialization,
  testJoinGame,
  testCommitChoice,
  testRevealChoice,
  testSettleBetTied,
  testCancelGame,
  testStartGameTimeout,
  testTimeoutGame,
  createRevealedGame
} = require('./helpers/rps')
const { toBN } = require('web3-utils')

describe('when a game is at tied stage', () => {
  contract('RockPaperScissors', () => {
    const betAmount = toBN(1e17)
    let contracts
    let gameId

    beforeEach('setup contracts', async () => {
      contracts = await setupContracts()
      await testInitialization(contracts)
      gameId = await createRevealedGame(
        contracts,
        betAmount,
        tokenUser,
        ethUser,
        choices.rock,
        choices.rock
      )
    })

    it('should NOT cancel game', async () => {
      await assertRevert(
        testCancelGame(contracts, gameId, {
          from: tokenUser
        })
      )
    })

    it('should NOT joinGame', async () => {
      await assertRevert(
        testJoinGame(contracts, addressZero, gameId, {
          from: tokenUser
        })
      )
    })

    it('should NOT commitChoice again for player 1', async () => {
      await assertRevert(
        testCommitChoice(contracts, gameId, choices.rock, {
          from: tokenUser
        })
      )
    })

    it('should NOT commitChoice again for player 2', async () => {
      await assertRevert(
        testCommitChoice(contracts, gameId, choices.rock, {
          from: tokenUser
        })
      )
    })

    it('should NOT revealChoice from player 1', async () => {
      const choice = choices.rock
      const sigParams = await web3.eth.abi.encodeParameters(
        ['uint256', 'uint256'],
        [gameId, choice]
      )
      const sig = await web3.eth.sign(sigParams, tokenUser)
      await assertRevert(
        testRevealChoice(contracts, gameId, choice, sig, {
          from: tokenUser
        })
      )
    })

    it('should NOT revealChoice from player 2', async () => {
      const choice = choices.rock
      const sigParams = await web3.eth.abi.encodeParameters(
        ['uint256', 'uint256'],
        [gameId, choice]
      )
      const sig = await web3.eth.sign(sigParams, tokenUser)
      await assertRevert(
        testRevealChoice(contracts, gameId, choice, sig, {
          from: ethUser
        })
      )
    })

    it('should NOT startGameTimeout', async () => {
      await assertRevert(
        testStartGameTimeout(contracts, gameId, {
          from: tokenUser
        })
      )
    })

    it('should NOT timeoutGame', async () => {
      await timeWarp(defaultTimeoutInSeconds.toNumber())
      await assertRevert(
        testTimeoutGame(contracts, gameId, {
          from: tokenUser
        })
      )
    })

    it('should settleBet as tied', async () => {
      await testSettleBetTied(contracts, gameId, {
        from: tokenUser
      })
    })
  })
})
