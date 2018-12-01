const {
  setupContracts,
  addressZero,
  owner,
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
  createJoinedGame,
  createCommittedGame,
  createRevealedGame,
  testSettleBetWinner,
  testCancelGame,
  testStartGameTimeout,
  testTimeoutGame,
  testPause
} = require('./helpers/rps')
const { toBN } = require('web3-utils')

describe('when pausing the contract', async () => {
  contract('RockPaperScissors', () => {
    const betAmount = toBN(1e17)
    let contracts

    beforeEach('setup contracts', async () => {
      contracts = await setupContracts()
      testInitialization(contracts)
    })

    it('should createGame, but NOT when paused', async () => {
      const {
        bnk,
        tst: { address: tstAddress }
      } = contracts
      await testDepositTokens(bnk, tstAddress, betAmount, {
        from: tokenUser
      })
      await testCreateGame(contracts, addressZero, tstAddress, betAmount, {
        from: tokenUser
      })
      await testDepositTokens(bnk, tstAddress, betAmount, {
        from: tokenUser
      })
      await testPause(contracts, {
        from: owner
      })
      await assertRevert(
        testCreateGame(contracts, addressZero, tstAddress, betAmount, {
          from: tokenUser
        })
      )
    })

    it('should cancelGame, but NOT when paused', async () => {
      let gameId
      const {
        bnk,
        tst: { address: tstAddress }
      } = contracts
      await testDepositTokens(bnk, tstAddress, betAmount, {
        from: tokenUser
      })
      gameId = await testCreateGame(
        contracts,
        addressZero,
        tstAddress,
        betAmount,
        {
          from: tokenUser
        }
      )
      await testCancelGame(contracts, gameId, {
        from: tokenUser
      })
      await testDepositTokens(bnk, tstAddress, betAmount, {
        from: tokenUser
      })
      gameId = await testCreateGame(
        contracts,
        addressZero,
        tstAddress,
        betAmount,
        {
          from: tokenUser
        }
      )
      await testPause(contracts, {
        from: owner
      })
      await assertRevert(
        testCancelGame(contracts, gameId, {
          from: tokenUser
        })
      )
    })

    it('should joinGame, but NOT when paused', async () => {
      let gameId
      const {
        bnk,
        tst: { address: tstAddress }
      } = contracts
      await testDepositTokens(bnk, tstAddress, betAmount, {
        from: tokenUser
      })
      await testDepositTokens(bnk, tstAddress, betAmount, {
        from: ethUser
      })
      gameId = await testCreateGame(
        contracts,
        addressZero,
        tstAddress,
        betAmount,
        {
          from: tokenUser
        }
      )
      await testJoinGame(contracts, addressZero, gameId, {
        from: ethUser
      })
      await testDepositTokens(bnk, tstAddress, betAmount, {
        from: tokenUser
      })
      await testDepositTokens(bnk, tstAddress, betAmount, {
        from: ethUser
      })
      gameId = await testCreateGame(
        contracts,
        addressZero,
        tstAddress,
        betAmount,
        {
          from: tokenUser
        }
      )
      await testPause(contracts, {
        from: owner
      })
      await assertRevert(
        testJoinGame(contracts, addressZero, gameId, { from: ethUser })
      )
    })

    it('should commitChoice, but NOT when paused', async () => {
      let gameId
      gameId = await createJoinedGame(
        contracts,
        betAmount,
        tokenUser,
        ethUser,
        addressZero,
        addressZero
      )
      await testCommitChoice(contracts, gameId, choices.rock, {
        from: tokenUser
      })
      gameId = await createJoinedGame(
        contracts,
        betAmount,
        tokenUser,
        ethUser,
        addressZero,
        addressZero
      )
      await testPause(contracts, {
        from: owner
      })
      await assertRevert(
        testCommitChoice(contracts, gameId, choices.rock, {
          from: tokenUser
        })
      )
    })

    it('should revealChoice, but NOT when paused', async () => {
      const {
        gameId: firstGameId,
        p1Data: p1FirstGameData
      } = await createCommittedGame(
        contracts,
        betAmount,
        tokenUser,
        ethUser,
        choices.rock,
        choices.rock,
        addressZero,
        addressZero
      )
      await testRevealChoice(
        contracts,
        firstGameId,
        p1FirstGameData.choice,
        p1FirstGameData.sig,
        {
          from: p1FirstGameData.address
        }
      )
      const {
        gameId: secondGameId,
        p1Data: p1SecondGameData
      } = await createCommittedGame(
        contracts,
        betAmount,
        tokenUser,
        ethUser,
        choices.rock,
        choices.rock,
        addressZero,
        addressZero
      )
      await testPause(contracts, {
        from: owner
      })
      await assertRevert(
        testRevealChoice(
          contracts,
          secondGameId,
          p1SecondGameData.choice,
          p1SecondGameData.sig,
          {
            from: p1SecondGameData.address
          }
        )
      )
    })

    it('should startGameTimeout, but NOT when paused', async () => {
      let gameId
      gameId = await createJoinedGame(
        contracts,
        betAmount,
        tokenUser,
        ethUser,
        addressZero,
        addressZero
      )
      await testCommitChoice(contracts, gameId, choices.rock, {
        from: tokenUser
      })
      await testStartGameTimeout(contracts, gameId, {
        from: tokenUser
      })
      gameId = await createJoinedGame(
        contracts,
        betAmount,
        tokenUser,
        ethUser,
        addressZero,
        addressZero
      )
      await testCommitChoice(contracts, gameId, choices.rock, {
        from: tokenUser
      })
      await testPause(contracts, {
        from: owner
      })
      await assertRevert(
        testStartGameTimeout(contracts, gameId, {
          from: tokenUser
        })
      )
    })

    it('should timeoutGame, but NOT when paused', async () => {
      let gameId
      gameId = await createJoinedGame(
        contracts,
        betAmount,
        tokenUser,
        ethUser,
        addressZero,
        addressZero
      )
      await testCommitChoice(contracts, gameId, choices.rock, {
        from: tokenUser
      })
      await testStartGameTimeout(contracts, gameId, {
        from: tokenUser
      })
      await timeWarp(defaultTimeoutInSeconds.toNumber())
      await testTimeoutGame(contracts, gameId, {
        from: tokenUser
      })
      gameId = await createJoinedGame(
        contracts,
        betAmount,
        tokenUser,
        ethUser,
        addressZero,
        addressZero
      )
      await testCommitChoice(contracts, gameId, choices.rock, {
        from: tokenUser
      })
      await testStartGameTimeout(contracts, gameId, {
        from: tokenUser
      })
      await timeWarp(defaultTimeoutInSeconds.toNumber())
      await testPause(contracts, {
        from: owner
      })
      await assertRevert(
        testTimeoutGame(contracts, gameId, {
          from: tokenUser
        })
      )
    })

    it('should settleBet, but NOT when paused', async () => {
      let gameId
      gameId = await createRevealedGame(
        contracts,
        betAmount,
        tokenUser,
        ethUser,
        choices.rock,
        choices.scissors
      )
      await testSettleBetWinner(contracts, gameId, {
        from: tokenUser
      })
      gameId = await createRevealedGame(
        contracts,
        betAmount,
        tokenUser,
        ethUser,
        choices.rock,
        choices.scissors
      )
      await testPause(contracts, {
        from: owner
      })
      await assertRevert(
        testSettleBetWinner(contracts, gameId, {
          from: tokenUser
        })
      )
    })
  })
})
