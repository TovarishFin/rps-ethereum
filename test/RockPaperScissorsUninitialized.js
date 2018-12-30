const {
  setupContracts,
  initializeSupplementalProxies,
  addressZero,
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
  testTimeoutGame
} = require('./helpers/rps')
const { toBN } = require('web3-utils')

describe('when a game is at uninitialized stage', async () => {
  contract('RockPaperScissors', () => {
    const uninitializedGameId = 666
    const betAmount = toBN(1e17)
    let contracts

    before('setup contracts', async () => {
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
    })

    it('should NOT cancelGame', async () => {
      await assertRevert(
        testCancelGame(contracts, uninitializedGameId, {
          from: tokenUser
        })
      )
    })

    it('should NOT joinGame', async () => {
      await assertRevert(
        testJoinGame(contracts, addressZero, uninitializedGameId, {
          from: tokenUser
        })
      )
    })

    it('should NOT commitChoice', async () => {
      await assertRevert(
        testCommitChoice(contracts, uninitializedGameId, choices.rock, {
          from: tokenUser
        })
      )
    })

    it('should NOT revealChoice', async () => {
      const choice = choices.rock
      const sigParams = await web3.eth.abi.encodeParameters(
        ['uint256', 'uint256'],
        [uninitializedGameId, choice]
      )
      const sig = await web3.eth.sign(sigParams, tokenUser)
      await assertRevert(
        testRevealChoice(contracts, uninitializedGameId, choice, sig, {
          from: tokenUser
        })
      )
    })

    it('should NOT startGameTimeout', async () => {
      await assertRevert(
        testStartGameTimeout(contracts, uninitializedGameId, {
          from: tokenUser
        })
      )
    })

    it('should NOT timeoutGame', async () => {
      await timeWarp(defaultTimeoutInSeconds.toNumber())
      await assertRevert(
        testTimeoutGame(contracts, uninitializedGameId, {
          from: tokenUser
        })
      )
    })

    it('should NOT settleBet', async () => {
      await assertRevert(
        testSettleBetWinner(contracts, uninitializedGameId, {
          from: tokenUser
        })
      )
      await assertRevert(
        testSettleBetTied(contracts, uninitializedGameId, {
          from: tokenUser
        })
      )
    })
  })
})
