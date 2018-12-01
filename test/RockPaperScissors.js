const {
  setupContracts,
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
  testTimeoutGame,
  testPause,
  testUnpause,
  testUpdateMinBet,
  testUpdateTimeout,
  testUpdateReferralFeePerMille,
  testUpdateFeePerMille
} = require('./helpers/rps')
const { toBN } = require('web3-utils')

describe('when deploying RockPaperScissors', () => {
  contract('RockPaperScissors', () => {
    let contracts

    beforeEach('setup contracts', async () => {
      contracts = await setupContracts()
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

describe('when performing owner functions', async () => {
  contract('RockPaperScissors', () => {
    let contracts

    before('setup contracts', async () => {
      contracts = await setupContracts()
      await testInitialization(contracts)
    })

    it('should NOT pause if NOT owner', async () => {
      await assertRevert(testPause(contracts, { from: tokenUser }))
    })

    it('should pause', async () => {
      await testPause(contracts, {
        from: owner
      })
    })

    it('should NOT unpause if NOT owner', async () => {
      await assertRevert(testUnpause(contracts, { from: tokenUser }))
    })

    it('should unpause', async () => {
      await testUnpause(contracts, {
        from: owner
      })
    })

    it('should NOT update minBet if NOT owner', async () => {
      const newMinBet = toBN(1e16)
      await assertRevert(
        testUpdateMinBet(contracts, newMinBet, {
          from: tokenUser
        })
      )
    })

    it('should update minBet if owner', async () => {
      const newMinBet = toBN(1e16)
      await testUpdateMinBet(contracts, newMinBet, {
        from: owner
      })
    })

    it('should NOT updateTimeout if NOT owner', async () => {
      const newTimeout = 120
      await assertRevert(
        testUpdateTimeout(contracts, newTimeout, {
          from: tokenUser
        })
      )
    })

    it('should NOT updateTimeout if timeout less than 60s', async () => {
      const invalidTimeout = 5
      await assertRevert(
        testUpdateTimeout(contracts, invalidTimeout, {
          from: owner
        })
      )
    })

    it('should updateTimeout if owner and valid timeout', async () => {
      const newTimeout = 120
      await testUpdateTimeout(contracts, newTimeout, {
        from: owner
      })
    })

    it('should NOT update referralFeePerMille if NOT owner', async () => {
      const feePerMille = await contracts.rps.feePerMille()
      const newReferralFeePerMille = feePerMille.sub(toBN(1))
      await assertRevert(
        testUpdateReferralFeePerMille(contracts, newReferralFeePerMille, {
          from: tokenUser
        })
      )
    })

    it('should NOT updateReferralFeePerMille if referralFeePerMille more than feePerMille', async () => {
      const feePerMille = await contracts.rps.feePerMille()
      const newReferralFeePerMille = feePerMille.add(toBN(1))
      await assertRevert(
        testUpdateReferralFeePerMille(contracts, newReferralFeePerMille, {
          from: owner
        })
      )
    })

    it('should update referralFeePerMille if less than or equal to feePerMille and owner', async () => {
      const feePerMille = await contracts.rps.feePerMille()
      const newReferralFeePerMille = feePerMille.sub(toBN(1))
      await testUpdateReferralFeePerMille(contracts, newReferralFeePerMille, {
        from: owner
      })
    })

    it('should NOT updateFeePerMille if NOT owner', async () => {
      const referralFeePerMille = await contracts.rps.referralFeePerMille()
      const newFeePerMille = referralFeePerMille.add(toBN(1))

      await assertRevert(
        testUpdateFeePerMille(contracts, newFeePerMille, {
          from: tokenUser
        })
      )
    })

    it('should NOT updateFeePerMille if feePerMille less than referralFeePerMille', async () => {
      const referralFeePerMille = await contracts.rps.referralFeePerMille()
      const newFeePerMille = referralFeePerMille.sub(toBN(1))

      await assertRevert(
        testUpdateFeePerMille(contracts, newFeePerMille, {
          from: owner
        })
      )
    })

    it('should updateFeePerMille if greater than or equal to referralFeePerMille and owner', async () => {
      const referralFeePerMille = await contracts.rps.referralFeePerMille()
      const newFeePerMille = referralFeePerMille.add(toBN(1))

      await testUpdateFeePerMille(contracts, newFeePerMille, {
        from: owner
      })
    })
  })
})

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

describe('when a game is at uninitialized stage', async () => {
  contract('RockPaperScissors', () => {
    const uninitializedGameId = 666
    const betAmount = toBN(1e17)
    let contracts

    before('setup contracts', async () => {
      contracts = await setupContracts()
      await testInitialization(contracts)
      await testDepositTokens(contracts.bnk, contracts.tst.address, betAmount, {
        from: tokenUser
      })
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

/*
  what are the different case that we want to handle???
    check on stages
*/
