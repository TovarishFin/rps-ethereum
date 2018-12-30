const {
  setupContracts,
  initializeSupplementalProxies,
  addressZero,
  ethUser,
  tokenUser,
  assertRevert,
  timeWarp
} = require('./helpers/general')
const { testDepositTokens } = require('./helpers/bnk')
const {
  defaultTimeoutInSeconds,
  choices,
  testInitialization,
  testJoinGame,
  testCommitChoice,
  testRevealChoice,
  testSettleBetWinner,
  testSettleBetTied,
  testCancelGame,
  testStartGameTimeout,
  testTimeoutGame,
  createCommittedGame
} = require('./helpers/rps')
const { toBN } = require('web3-utils')

describe('when a game is at committed stage', () => {
  contract('RockPaperScissors', () => {
    const betAmount = toBN(1e17)
    let contracts
    let gameId
    let pData

    beforeEach('setup contracts', async () => {
      contracts = await setupContracts()
      await initializeSupplementalProxies(contracts)
      await testInitialization(contracts)
      await testDepositTokens(
        contracts.bnk,
        contracts.tst.address,
        betAmount.mul(toBN(5)),
        {
          from: tokenUser
        }
      )
      await testDepositTokens(
        contracts.bnk,
        contracts.tst.address,
        betAmount.mul(toBN(5)),
        {
          from: ethUser
        }
      )
      const gameData = await createCommittedGame(
        contracts,
        betAmount,
        tokenUser,
        ethUser,
        choices.rock,
        choices.rock,
        addressZero,
        addressZero
      )
      gameId = gameData.gameId
      pData = { p1Data: gameData.p1Data, p2Data: gameData.p2Data }
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

    it('should NOT commitChoice', async () => {
      await assertRevert(
        testCommitChoice(contracts, gameId, choices.rock, {
          from: tokenUser
        })
      )
    })

    it('should revealChoice for p1', async () => {
      const {
        p1Data: { choice, sig, address }
      } = pData
      await testRevealChoice(contracts, gameId, choice, sig, {
        from: address
      })
    })

    it('should revealChoice for p2', async () => {
      const {
        p2Data: { choice, sig, address }
      } = pData
      await testRevealChoice(contracts, gameId, choice, sig, {
        from: address
      })
    })

    it('should NOT startGameTimeout if neither have revealed', async () => {
      await assertRevert(
        testStartGameTimeout(contracts, gameId, {
          from: tokenUser
        })
      )
    })

    it('should startGameTimeout if one has already revealed', async () => {
      const {
        p1Data: { choice, sig, address }
      } = pData
      testRevealChoice(contracts, gameId, choice, sig, {
        from: address
      })
      await testStartGameTimeout(contracts, gameId, {
        from: tokenUser
      })
    })

    it('should NOT timeoutGame', async () => {
      await timeWarp(defaultTimeoutInSeconds.toNumber())
      await assertRevert(
        testTimeoutGame(contracts, gameId, {
          from: tokenUser
        })
      )
    })

    it('should NOT settleBet', async () => {
      await assertRevert(
        testSettleBetTied(contracts, gameId, {
          from: tokenUser
        })
      )
      await assertRevert(
        testSettleBetWinner(contracts, gameId, {
          from: tokenUser
        })
      )
    })
  })
})
