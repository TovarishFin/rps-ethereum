const {
  setupContracts,
  initializeSupplementalProxies,
  addressZero,
  owner,
  ethUser,
  tokenUser,
  referrer,
  referrerAlt,
  gasPrice,
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
  testSettleBetTied,
  testCancelGame,
  testStartGameTimeout,
  testTimeoutGame
} = require('./helpers/rps')
const { toBN } = require('web3-utils')

describe('when deploying RockPaperScissors', () => {
  contract('RockPaperScissors', () => {
    let contracts

    beforeEach('setup contracts', async () => {
      contracts = await setupContracts()
      await initializeSupplementalProxies(contracts)
    })

    it('it should initialize with correct values', async () => {
      await testInitialization(contracts)
    })
  })
})

describe('when going through normal game flow', () => {
  const betAmount = toBN(1e17)
  let contracts
  let currentGameId
  let p1Data = {}
  let p2Data = {}

  before('setup contracts', async () => {
    contracts = await setupContracts()
    await initializeSupplementalProxies(contracts)
    await testInitialization(contracts)
  })

  it('should createGame', async () => {
    const {
      bnk,
      tst: { address: tstAddress }
    } = contracts

    await testDepositTokens(bnk, tstAddress, betAmount, {
      from: tokenUser,
      gasPrice
    })
    currentGameId = await testCreateGame(
      contracts,
      addressZero,
      tstAddress,
      betAmount,
      {
        from: tokenUser,
        gasPrice
      }
    )
  })

  it('should joinGame', async () => {
    const {
      bnk,
      tst: { address: tstAddress }
    } = contracts

    await testDepositTokens(bnk, tstAddress, betAmount, {
      from: ethUser,
      gasPrice
    })
    await testJoinGame(contracts, addressZero, currentGameId, {
      from: ethUser,
      gasPrice
    })
  })

  it('should commit first player choice', async () => {
    p1Data = await testCommitChoice(contracts, currentGameId, choices.rock, {
      from: tokenUser
    })
  })

  it('should commit second player choice', async () => {
    p2Data = await testCommitChoice(contracts, currentGameId, choices.paper, {
      from: ethUser
    })
  })

  it('should reveal first player choice', async () => {
    const { choice, sig } = p1Data
    await testRevealChoice(contracts, currentGameId, choice, sig, {
      from: tokenUser
    })
  })

  it('should reveal second player choice and determine winner', async () => {
    const { choice, sig } = p2Data
    await testRevealChoice(contracts, currentGameId, choice, sig, {
      from: ethUser
    })
  })
})

describe('when handling unhappy paths', async () => {
  contract('RockPaperScissors', () => {
    let contracts
    const depositAmount = toBN(1e17)

    beforeEach('setup contracts', async () => {
      contracts = await setupContracts()
      await initializeSupplementalProxies(contracts)
      await testInitialization(contracts)
      await testDepositTokens(
        contracts.bnk,
        contracts.tst.address,
        depositAmount,
        {
          from: tokenUser
        }
      )
    })

    it('should NOT cancel an unjoined game if NOT creator', async () => {
      const gameId = await testCreateGame(
        contracts,
        addressZero,
        contracts.tst.address,
        depositAmount,
        {
          from: tokenUser
        }
      )
      await assertRevert(
        testCancelGame(contracts, gameId, {
          from: ethUser
        })
      )
    })

    it('should cancel an unjoined game', async () => {
      const gameId = await testCreateGame(
        contracts,
        addressZero,
        contracts.tst.address,
        depositAmount,
        {
          from: tokenUser
        }
      )
      await testCancelGame(contracts, gameId, {
        from: tokenUser
      })
    })

    it('should NOT start partially committed game timeout from non-player', async () => {
      const gameId = await createJoinedGame(
        contracts,
        depositAmount,
        tokenUser,
        ethUser
      )

      await testCommitChoice(contracts, gameId, choices.rock, {
        from: ethUser
      })
      await assertRevert(
        testStartGameTimeout(contracts, gameId, {
          from: owner
        })
      )
    })

    it('should NOT start ready game timeout if neither player has committed', async () => {
      const gameId = await createJoinedGame(
        contracts,
        depositAmount,
        tokenUser,
        ethUser
      )
      await assertRevert(
        testStartGameTimeout(contracts, gameId, {
          from: tokenUser
        })
      )
    })

    it('should start partially committed game timeout in commit phase', async () => {
      const gameId = await createJoinedGame(
        contracts,
        depositAmount,
        tokenUser,
        ethUser
      )
      await testCommitChoice(contracts, gameId, choices.rock, {
        from: ethUser
      })
      await testStartGameTimeout(contracts, gameId, {
        from: ethUser
      })
    })

    it('should NOT timeout partially commited game if timeout has NOT passed', async () => {
      const gameId = await createJoinedGame(
        contracts,
        depositAmount,
        tokenUser,
        ethUser
      )
      await testCommitChoice(contracts, gameId, choices.rock, {
        from: ethUser
      })
      await testStartGameTimeout(contracts, gameId, {
        from: ethUser
      })
      await assertRevert(
        testTimeoutGame(contracts, gameId, {
          from: ethUser
        })
      )
    })

    it('should NOT timeout partially committed game if NOT player', async () => {
      const gameId = await createJoinedGame(
        contracts,
        depositAmount,
        tokenUser,
        ethUser
      )
      await testCommitChoice(contracts, gameId, choices.rock, {
        from: ethUser
      })
      await testStartGameTimeout(contracts, gameId, {
        from: ethUser
      })
      await timeWarp(defaultTimeoutInSeconds.toNumber())
      await assertRevert(
        testTimeoutGame(contracts, gameId, {
          from: owner
        })
      )
    })

    it('should NOT timeout partially committed game if startGameTimeout was NOT called', async () => {
      const gameId = await createJoinedGame(
        contracts,
        depositAmount,
        tokenUser,
        ethUser
      )
      await testCommitChoice(contracts, gameId, choices.rock, {
        from: ethUser
      })
      await timeWarp(defaultTimeoutInSeconds.toNumber())
      await assertRevert(
        testTimeoutGame(contracts, gameId, {
          from: ethUser
        })
      )
    })

    it('should NOT timeout committed game if committ is made after startTiemout', async () => {
      const gameId = await createJoinedGame(
        contracts,
        depositAmount,
        tokenUser,
        ethUser
      )
      await testCommitChoice(contracts, gameId, choices.rock, {
        from: ethUser
      })
      await testStartGameTimeout(contracts, gameId, {
        from: ethUser
      })
      await timeWarp(defaultTimeoutInSeconds.toNumber())
      await testCommitChoice(contracts, gameId, choices.rock, {
        from: tokenUser
      })
      await assertRevert(
        testTimeoutGame(contracts, gameId, {
          from: ethUser
        })
      )
    })

    it('should timeout partially committed game if timeout has passed', async () => {
      const gameId = await createJoinedGame(
        contracts,
        depositAmount,
        tokenUser,
        ethUser
      )
      await testCommitChoice(contracts, gameId, choices.rock, {
        from: ethUser
      })
      await testStartGameTimeout(contracts, gameId, {
        from: ethUser
      })
      await timeWarp(defaultTimeoutInSeconds.toNumber())
      await testTimeoutGame(contracts, gameId, {
        from: ethUser
      })
    })

    it('should NOT start partially revealed game timeout from non-player', async () => {
      const {
        gameId,
        p2Data: { choice, sig, address }
      } = await createCommittedGame(
        contracts,
        depositAmount,
        tokenUser,
        ethUser,
        choices.rock,
        choices.rock
      )
      await testRevealChoice(contracts, gameId, choice, sig, {
        from: address,
        gasPrice
      })
      await assertRevert(
        testStartGameTimeout(contracts, gameId, { from: owner })
      )
    })

    it('should NOT start committed game timeout if neither have revealed', async () => {
      const { gameId } = await createCommittedGame(
        contracts,
        depositAmount,
        tokenUser,
        ethUser,
        choices.rock,
        choices.rock
      )
      await assertRevert(
        testStartGameTimeout(contracts, gameId, {
          from: ethUser
        })
      )
    })

    it('should start partially revealed game timeout in reveal phase', async () => {
      const {
        gameId,
        p2Data: { choice, sig, address }
      } = await createCommittedGame(
        contracts,
        depositAmount,
        tokenUser,
        ethUser,
        choices.rock,
        choices.rock
      )
      await testRevealChoice(contracts, gameId, choice, sig, {
        from: address,
        gasPrice
      })
      await testStartGameTimeout(contracts, gameId, { from: ethUser })
    })

    it('should NOT timeout partially revealed game if timeout has NOT passed', async () => {
      const {
        gameId,
        p2Data: { choice, sig, address }
      } = await createCommittedGame(
        contracts,
        depositAmount,
        tokenUser,
        ethUser,
        choices.rock,
        choices.rock
      )
      await testRevealChoice(contracts, gameId, choice, sig, {
        from: address,
        gasPrice
      })
      await testStartGameTimeout(contracts, gameId, { from: ethUser })
      await assertRevert(
        testTimeoutGame(contracts, gameId, {
          from: ethUser
        })
      )
    })

    it('should NOT timeout partially revealed game if NOT player', async () => {
      const {
        gameId,
        p2Data: { choice, sig, address }
      } = await createCommittedGame(
        contracts,
        depositAmount,
        tokenUser,
        ethUser,
        choices.rock,
        choices.rock
      )
      await testRevealChoice(contracts, gameId, choice, sig, {
        from: address,
        gasPrice
      })
      await testStartGameTimeout(contracts, gameId, { from: ethUser })
      await timeWarp(defaultTimeoutInSeconds.toNumber())
      await assertRevert(
        testTimeoutGame(contracts, gameId, {
          from: owner
        })
      )
    })

    it('should NOT timeout partially revealed game if startGameTimeout was NOT called', async () => {
      const {
        gameId,
        p2Data: { choice, sig, address }
      } = await createCommittedGame(
        contracts,
        depositAmount,
        tokenUser,
        ethUser,
        choices.rock,
        choices.rock
      )
      await testRevealChoice(contracts, gameId, choice, sig, {
        from: address,
        gasPrice
      })
      await timeWarp(defaultTimeoutInSeconds.toNumber())
      await assertRevert(
        testTimeoutGame(contracts, gameId, {
          from: ethUser
        })
      )
    })

    it('should NOT timeout revealed game if reveal is made after startTiemout', async () => {
      const {
        gameId,
        p1Data: { choice: choiceP1, sig: sigP1, address: addressP1 },
        p2Data: { choice: choiceP2, sig: sigP2, address: addressP2 }
      } = await createCommittedGame(
        contracts,
        depositAmount,
        tokenUser,
        ethUser,
        choices.rock,
        choices.rock
      )
      await testRevealChoice(contracts, gameId, choiceP1, sigP1, {
        from: addressP1,
        gasPrice
      })
      await testStartGameTimeout(contracts, gameId, { from: addressP1 })
      await timeWarp(defaultTimeoutInSeconds.toNumber())
      await testRevealChoice(contracts, gameId, choiceP2, sigP2, {
        from: addressP2
      })
      await assertRevert(
        testTimeoutGame(contracts, gameId, {
          from: addressP1,
          gasPrice
        })
      )
    })

    it('should timeout partially revealed game if timeout has passed', async () => {
      const {
        gameId,
        p2Data: { choice, sig, address }
      } = await createCommittedGame(
        contracts,
        depositAmount,
        tokenUser,
        ethUser,
        choices.rock,
        choices.rock
      )
      await testRevealChoice(contracts, gameId, choice, sig, {
        from: address,
        gasPrice
      })
      await testStartGameTimeout(contracts, gameId, { from: ethUser })
      await timeWarp(defaultTimeoutInSeconds.toNumber())
      await testTimeoutGame(contracts, gameId, {
        from: ethUser
      })
    })

    it('should allow timeout to be called during both commit and reveal stages', async () => {
      const gameId = await createJoinedGame(
        contracts,
        depositAmount,
        tokenUser,
        ethUser
      )
      const {
        choice: choiceP1,
        sig: sigP1,
        address: addressP1
      } = await testCommitChoice(contracts, gameId, choices.rock, {
        from: tokenUser
      })
      await testStartGameTimeout(contracts, gameId, {
        from: tokenUser
      })
      await testCommitChoice(contracts, gameId, choices.rock, {
        from: ethUser
      })
      await testRevealChoice(contracts, gameId, choiceP1, sigP1, {
        from: addressP1
      })
      await testStartGameTimeout(contracts, gameId, {
        from: addressP1
      })
      await timeWarp(defaultTimeoutInSeconds.toNumber())
      await testTimeoutGame(contracts, gameId, {
        from: addressP1
      })
    })

    it('should NOT allow timeout to be called second time if timeout has NOT occurred', async () => {
      const gameId = await createJoinedGame(
        contracts,
        depositAmount,
        tokenUser,
        ethUser
      )
      const {
        choice: choiceP1,
        sig: sigP1,
        address: addressP1
      } = await testCommitChoice(contracts, gameId, choices.rock, {
        from: tokenUser
      })
      await testStartGameTimeout(contracts, gameId, {
        from: tokenUser
      })
      await testCommitChoice(contracts, gameId, choices.rock, {
        from: ethUser
      })
      await testRevealChoice(contracts, gameId, choiceP1, sigP1, {
        from: addressP1
      })
      await testStartGameTimeout(contracts, gameId, {
        from: addressP1
      })
      await assertRevert(
        testTimeoutGame(contracts, gameId, {
          from: addressP1
        })
      )
    })
  })
})

describe('when settling bets', () => {
  contract('RockPaperScissors', async () => {
    const betAmount = toBN(1e17)
    let contracts

    beforeEach('setup contracts', async () => {
      contracts = await setupContracts()
      await initializeSupplementalProxies(contracts)
      await testInitialization(contracts)
    })

    it('should settle a winning bet', async () => {
      const gameId = await createRevealedGame(
        contracts,
        betAmount,
        tokenUser,
        ethUser,
        choices.rock,
        choices.paper
      )

      await testSettleBetWinner(contracts, gameId, {
        from: tokenUser
      })
    })

    it('should settle a winning bet with one referrer', async () => {
      const gameId = await createRevealedGame(
        contracts,
        betAmount,
        tokenUser,
        ethUser,
        choices.rock,
        choices.paper,
        referrer,
        addressZero
      )
      await testSettleBetWinner(contracts, gameId, {
        from: tokenUser
      })
    })

    it('should settle a winning bet with two different referrers', async () => {
      const gameId = await createRevealedGame(
        contracts,
        betAmount,
        tokenUser,
        ethUser,
        choices.rock,
        choices.paper,
        referrer,
        referrerAlt
      )
      await testSettleBetWinner(contracts, gameId, {
        from: tokenUser
      })
    })

    it('should settle a winning bet with same referrer for both players', async () => {
      const gameId = await createRevealedGame(
        contracts,
        betAmount,
        tokenUser,
        ethUser,
        choices.rock,
        choices.paper,
        referrer,
        referrer
      )
      await testSettleBetWinner(contracts, gameId, {
        from: tokenUser
      })
    })

    it('should settle a tied bet', async () => {
      const gameId = await createRevealedGame(
        contracts,
        betAmount,
        tokenUser,
        ethUser,
        choices.rock,
        choices.rock
      )

      await testSettleBetTied(contracts, gameId, {
        from: ethUser
      })
    })

    it('should settle a tied bet with one referrer', async () => {
      const gameId = await createRevealedGame(
        contracts,
        betAmount,
        tokenUser,
        ethUser,
        choices.rock,
        choices.rock,
        referrer,
        addressZero
      )

      await testSettleBetTied(contracts, gameId, {
        from: ethUser
      })
    })

    it('should settle a tied bet with two different referrers', async () => {
      const gameId = await createRevealedGame(
        contracts,
        betAmount,
        tokenUser,
        ethUser,
        choices.rock,
        choices.rock,
        referrer,
        referrerAlt
      )

      await testSettleBetTied(contracts, gameId, {
        from: ethUser
      })
    })

    it('should settle a winning bet with same referrer for both players', async () => {
      const gameId = await createRevealedGame(
        contracts,
        betAmount,
        tokenUser,
        ethUser,
        choices.rock,
        choices.rock,
        referrer,
        referrer
      )
      await testSettleBetTied(contracts, gameId, {
        from: ethUser
      })
    })

    it('should settle a timed out bet', async () => {
      const {
        gameId,
        p1Data: { choice: choiceP1, sig: sigP1, address: addressP1 }
      } = await createCommittedGame(
        contracts,
        betAmount,
        tokenUser,
        ethUser,
        choices.rock,
        choices.rock
      )
      await testRevealChoice(contracts, gameId, choiceP1, sigP1, {
        from: addressP1
      })
      await testStartGameTimeout(contracts, gameId, {
        from: addressP1
      })
      await timeWarp(defaultTimeoutInSeconds.toNumber())
      await testTimeoutGame(contracts, gameId, {
        from: addressP1
      })
      await testSettleBetWinner(contracts, gameId, {
        from: addressP1
      })
    })

    it('should settle a timed out bet with one referrer', async () => {
      const {
        gameId,
        p1Data: { choice: choiceP1, sig: sigP1, address: addressP1 }
      } = await createCommittedGame(
        contracts,
        betAmount,
        tokenUser,
        ethUser,
        choices.rock,
        choices.rock,
        referrer,
        addressZero
      )
      await testRevealChoice(contracts, gameId, choiceP1, sigP1, {
        from: addressP1
      })
      await testStartGameTimeout(contracts, gameId, {
        from: addressP1
      })
      await timeWarp(defaultTimeoutInSeconds.toNumber())
      await testTimeoutGame(contracts, gameId, {
        from: addressP1
      })
      await testSettleBetWinner(contracts, gameId, {
        from: addressP1
      })
    })

    it('should settle a timed out bet with two different referrers', async () => {
      const {
        gameId,
        p1Data: { choice: choiceP1, sig: sigP1, address: addressP1 }
      } = await createCommittedGame(
        contracts,
        betAmount,
        tokenUser,
        ethUser,
        choices.rock,
        choices.rock,
        referrer,
        referrerAlt
      )
      await testRevealChoice(contracts, gameId, choiceP1, sigP1, {
        from: addressP1
      })
      await testStartGameTimeout(contracts, gameId, {
        from: addressP1
      })
      await timeWarp(defaultTimeoutInSeconds.toNumber())
      await testTimeoutGame(contracts, gameId, {
        from: addressP1
      })
      await testSettleBetWinner(contracts, gameId, {
        from: addressP1
      })
    })

    it('should settle a timed out bet with same referrer for both players', async () => {
      const {
        gameId,
        p1Data: { choice: choiceP1, sig: sigP1, address: addressP1 }
      } = await createCommittedGame(
        contracts,
        betAmount,
        tokenUser,
        ethUser,
        choices.rock,
        choices.rock,
        referrer,
        referrer
      )
      await testRevealChoice(contracts, gameId, choiceP1, sigP1, {
        from: addressP1
      })
      await testStartGameTimeout(contracts, gameId, {
        from: addressP1
      })
      await timeWarp(defaultTimeoutInSeconds.toNumber())
      await testTimeoutGame(contracts, gameId, {
        from: addressP1
      })
      await testSettleBetWinner(contracts, gameId, {
        from: addressP1
      })
    })
  })
})

describe('when handling referrals', async () => {
  contract('RockPaperScissors', () => {
    const betAmount = toBN(1e17)
    let contracts
    let gameId

    before('setup contracts', async () => {
      contracts = await setupContracts()
      await initializeSupplementalProxies(contracts)
      await testInitialization(contracts)
    })

    it('should createGame with referral', async () => {
      const {
        bnk,
        tst: { address: tstAddress }
      } = contracts
      await testDepositTokens(bnk, tstAddress, betAmount, {
        from: tokenUser,
        gasPrice
      })
      gameId = await testCreateGame(
        contracts,
        referrer,
        tstAddress,
        betAmount,
        {
          from: tokenUser,
          gasPrice
        }
      )
    })

    it('should joinGame with referral', async () => {
      const {
        bnk,
        tst: { address: tstAddress }
      } = contracts
      await testDepositTokens(bnk, tstAddress, betAmount, {
        from: ethUser,
        gasPrice
      })
      await testJoinGame(contracts, referrer, gameId, {
        from: ethUser,
        gasPrice
      })
    })
  })
})
