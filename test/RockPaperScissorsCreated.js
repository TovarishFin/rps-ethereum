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
  testCreateGame,
  testJoinGame,
  testCommitChoice,
  testRevealChoice,
  testSettleBetWinner,
  testSettleBetTied,
  testCancelGame,
  testStartGameTimeout,
  testTimeoutGame
} = require('./helpers/rps')
const { toBN } = require('web3-utils')

describe('when a game is at created stage', () => {
  contract('RockPaperScissors', () => {
    const betAmount = toBN(1e17)
    let contracts
    let gameId

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
      gameId = await testCreateGame(
        contracts,
        addressZero,
        contracts.tst.address,
        betAmount,
        {
          from: tokenUser
        }
      )
    })

    it('should cancel game', async () => {
      await testCancelGame(contracts, gameId, {
        from: tokenUser
      })
    })

    it('should joinGame', async () => {
      await testJoinGame(contracts, addressZero, gameId, {
        from: ethUser
      })
    })

    it('should NOT commitChoice', async () => {
      await assertRevert(
        testCommitChoice(contracts, gameId, choices.rock, {
          from: tokenUser
        })
      )
    })

    it('should NOT revealChoice', async () => {
      const choice = choices.rock
      const sigParams = await web3.eth.abi.encodeParameters(
        ['uint256', 'uint256'],
        [gameId.toString(), choice]
      )
      const sig = await web3.eth.sign(sigParams, tokenUser)
      await assertRevert(
        testRevealChoice(contracts, gameId, choice, sig, {
          from: tokenUser
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
