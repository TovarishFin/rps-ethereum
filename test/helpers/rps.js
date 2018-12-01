const { addressZero, bytes32Zero, owner, areInRange } = require('./general')
const { testDepositTokens } = require('./bnk')
const { toBN, soliditySha3 } = require('web3-utils')

const defaultMinBet = toBN(1e17)
const defaultTimeoutInSeconds = toBN(1e3)
const defaultReferralFeePerMille = toBN(5)
const defaultFeePerMille = toBN(10)
const stages = {
  uninitialized: '0',
  created: '1',
  cancelled: '2',
  ready: '3',
  committed: '4',
  timingOut: '5',
  timedOut: '6',
  tied: '7',
  winnerDecided: '8',
  paid: '9'
}

const choices = {
  undecided: '0',
  rock: '1',
  paper: '2',
  scissors: '3'
}

const testGameIsEmpty = game => {
  const {
    addressP1,
    addressP2,
    winner,
    tokenAddress,
    bet,
    choiceP1,
    choiceP2,
    choiceSecretP1,
    choiceSecretP2,
    stage
  } = game
  assert.equal(addressP1, addressZero, 'addressP1 should be uninitialized')
  assert.equal(addressP2, addressZero, 'addressP2 should be uninitialized')
  assert.equal(winner, addressZero, 'winner should be uninitialized')
  assert.equal(
    tokenAddress,
    addressZero,
    'tokenAddress should be uninitialized'
  )
  assert(bet.isZero(), 'bet should be uninitialized')
  assert(choiceP1.isZero(), 'choiceP1 should be uninitialized')
  assert(choiceP2.isZero(), 'choiceP2 should be uninitialized')
  assert.equal(
    choiceSecretP1,
    bytes32Zero,
    'choiceSecretP1 should be uninitialized'
  )
  assert.equal(
    choiceSecretP2,
    bytes32Zero,
    'choiceSecretP2 should be uninitialized'
  )
  assert(stage.isZero(), 'stage should be uninitialized')
}

const testInitialization = async contracts => {
  const { rps, reg, rpsCore: defaultRpsCore, rpsMan: defaultRpsMan } = contracts

  await rps.initialize(
    reg.address,
    defaultMinBet,
    defaultTimeoutInSeconds,
    defaultReferralFeePerMille,
    defaultFeePerMille
  )

  const rpsCore = await rps.rpsCore()
  const rpsManagement = await rps.rpsManagement()
  const initialized = await rps.initialized()
  const registry = await rps.registry()
  const minBet = await rps.minBet()
  const timeoutInSeconds = await rps.timeoutInSeconds()
  const referralFeePerMille = await rps.referralFeePerMille()
  const feePerMille = await rps.feePerMille()

  assert.equal(
    rpsCore,
    defaultRpsCore.address,
    'rpsCore should be set to default value'
  )
  assert.equal(
    rpsManagement,
    defaultRpsMan.address,
    'rpsManagement should be set to default value'
  )
  assert.equal(
    initialized,
    true,
    'initialized should be set to true after initializing'
  )
  assert.equal(
    registry,
    reg.address,
    'registry should be set to default value '
  )
  assert.equal(
    minBet.toString(),
    defaultMinBet.toString(),
    'minBet should be set to default value'
  )
  assert.equal(
    timeoutInSeconds.toString(),
    defaultTimeoutInSeconds.toString(),
    'timeoutInSeconds should be set to default value'
  )
  assert.equal(
    referralFeePerMille.toString(),
    defaultReferralFeePerMille.toString(),
    'referralFeePerMille should be set to default value'
  )
  assert.equal(
    feePerMille.toString(),
    defaultFeePerMille.toString(),
    'feePerMille should be set to default value'
  )
}

const testCreateGame = async (
  contracts,
  referrer,
  tokenAddress,
  tokenDeposit,
  config
) => {
  const { from: creator, value: etherDesposit } = config
  const { rps, bnk, weth } = contracts

  const preAllocatedTokens = await bnk.allocatedTokensOf(creator, tokenAddress)
  const preBankWethBalance = await bnk.tokenBalanceOf(creator, weth.address)
  const preLastGameId = await rps.lastGameId()
  const preGame = await rps.games(preLastGameId.add(toBN(1)))

  await rps.createGame(referrer, tokenAddress, tokenDeposit, config)

  const postAllocatedTokens = await bnk.allocatedTokensOf(creator, tokenAddress)
  const postBankWethBalance = await bnk.tokenBalanceOf(creator, weth.address)
  const postLastGameId = await rps.lastGameId()
  const postGame = await rps.games(preLastGameId.add(toBN(1)))
  const postReferredBy = await rps.referredBy(creator)

  if (tokenAddress == weth.address) {
    assert.equal(
      preBankWethBalance
        .add(etherDesposit)
        .sub(postBankWethBalance)
        .toString(),
      tokenDeposit.toString(),
      'creator bank weth balance should be incremented by deposit amount and decremented by tokenDeposit'
    )
  }

  assert.equal(
    postAllocatedTokens.sub(preAllocatedTokens).toString(),
    tokenDeposit.toString(),
    'allocatedTokensOf creator should be incremented by tokenDeposit'
  )
  assert.equal(
    postLastGameId.sub(preLastGameId).toString(),
    '1',
    'lastGameId should be incremented by 1'
  )
  testGameIsEmpty(preGame)
  assert.equal(
    postGame.addressP1,
    creator,
    'game addressP1 should be set to creator'
  )
  assert.equal(
    postGame.addressP2,
    addressZero,
    'game addressP2 should be set to uninitialized'
  )
  assert.equal(
    postGame.tokenAddress,
    tokenAddress,
    'game tokenAddress should be set to tokenAddress'
  )
  assert.equal(
    postGame.bet.toString(),
    tokenDeposit.toString(),
    'game bet should be set to tokenDesposit amount'
  )
  assert(postGame.choiceP1.isZero(), 'game choiceP1 should be uninitialized')
  assert(postGame.choiceP2.isZero(), 'game choiceP2 should be uninitialized')
  assert.equal(
    postGame.choiceSecretP1,
    bytes32Zero,
    'game choiceSecretP1 should be uninitialized'
  )
  assert.equal(
    postGame.choiceSecretP2,
    bytes32Zero,
    'game choiceSecretP2 should be uninitialized'
  )
  assert.equal(
    postGame.stage.toString(),
    stages.created,
    'game stage should be set to created'
  )
  assert.equal(
    postReferredBy,
    referrer,
    'creator referredBy referrer should be set'
  )

  return postLastGameId
}

const testJoinGame = async (contracts, referrer, gameId, config) => {
  const { from: joiner, value: etherDesposit } = config
  const { rps, bnk, weth } = contracts

  const preGame = await rps.games(gameId)
  const { tokenAddress, bet: betAmount } = preGame

  const preAllocatedTokens = await bnk.allocatedTokensOf(joiner, tokenAddress)
  const preBankWethBalance = await bnk.tokenBalanceOf(joiner, weth.address)

  await rps.joinGame(referrer, gameId, config)

  const postGame = await rps.games(gameId)
  const postAllocatedTokens = await bnk.allocatedTokensOf(joiner, tokenAddress)
  const postBankWethBalance = await bnk.tokenBalanceOf(joiner, weth.address)
  const postReferredBy = await rps.referredBy(joiner)

  if (tokenAddress == weth.address) {
    assert.equal(
      preBankWethBalance
        .add(etherDesposit)
        .sub(postBankWethBalance)
        .toString(),
      betAmount.toString(),
      'joiner bank weth balance should be incremented by deposit amount and decremented by betAmount'
    )
  }

  assert.equal(
    postAllocatedTokens.sub(preAllocatedTokens).toString(),
    betAmount.toString(),
    'allocatedTokensOf joiner should be incremented by betAmount'
  )
  assert.equal(
    postGame.addressP1,
    preGame.addressP1,
    'game addressP1 should remain unchanged'
  )
  assert.equal(
    postGame.addressP2,
    joiner,
    'game addressP2 should be set to joiner'
  )
  assert.equal(
    postGame.tokenAddress,
    preGame.tokenAddress,
    'game tokenAddress remain unchanged'
  )
  assert.equal(
    postGame.bet.toString(),
    preGame.bet.toString(),
    'game bet should remain unchanged'
  )
  assert(postGame.choiceP1.isZero(), 'game choiceP1 should be uninitialized')
  assert(postGame.choiceP2.isZero(), 'game choiceP2 should be uninitialized')
  assert.equal(
    postGame.choiceSecretP1,
    bytes32Zero,
    'game choiceSecretP1 should be uninitialized'
  )
  assert.equal(
    postGame.choiceSecretP2,
    bytes32Zero,
    'game choiceSecretP2 should be uninitialized'
  )
  assert.equal(
    postGame.stage.toString(),
    stages.ready,
    'game stage should be set to ready'
  )
  assert.equal(
    postReferredBy,
    referrer,
    'joiner referredBy referrer should be set'
  )
}

const testCommitChoice = async (contracts, gameId, choice, config) => {
  const { rps } = contracts
  const { from: committer } = config

  const sigParams = await web3.eth.abi.encodeParameters(
    ['uint256', 'uint256'],
    [gameId, choice]
  )
  const sig = await web3.eth.sign(sigParams, committer)
  const commitHash = soliditySha3(
    {
      t: 'uint256',
      v: gameId
    },
    {
      t: 'uint256',
      v: choice
    },
    {
      t: 'bytes',
      v: sig
    }
  )

  const preGame = await rps.games(gameId)

  await rps.commitChoice(gameId, commitHash, config)

  const postGame = await rps.games(gameId)

  if (committer == preGame.addressP1) {
    assert.equal(
      postGame.choiceSecretP1,
      commitHash,
      'game choiceSecretP1 should match commitHash'
    )
  } else if (committer == preGame.addressP2) {
    assert.equal(
      postGame.choiceSecretP2,
      commitHash,
      'game choiceSecretP2 should match commitHash'
    )
  } else {
    assert(false, 'commitChoice should throw if caller is NOT participant')
  }

  if (
    postGame.choiceSecretP1 == bytes32Zero ||
    postGame.choiceSecretP2 == bytes32Zero
  ) {
    assert.equal(
      postGame.stage.toString(),
      stages.ready,
      'stage should remain in ready when only one player has committed'
    )
  } else {
    assert.equal(
      postGame.stage.toString(),
      stages.committed,
      'stage should be committed after both players have committed'
    )
  }

  return { gameId, choice, commitHash, sig, address: committer }
}

const testRevealChoice = async (contracts, gameId, choice, sig, config) => {
  const { rps } = contracts
  const { from: revealer } = config

  await rps.revealChoice(gameId, choice, sig, config)

  const postGame = await rps.games(gameId)

  if (revealer == postGame.addressP1) {
    assert.equal(postGame.choiceP1, choice, 'game choiceP1 should match choice')
  } else if (revealer == postGame.addressP2) {
    assert.equal(postGame.choiceP2, choice, 'game choiceP2 should match choice')
  } else {
    assert(false, 'commitChoice should throw if caller is NOT participant')
  }

  if (
    postGame.choiceP1.toString() == choices.undecided ||
    postGame.choiceP2.toString() == choices.undecided
  ) {
    assert.equal(
      postGame.stage.toString(),
      stages.committed,
      'game stage should remain in committed'
    )
  } else {
    const computedWinner = computeWinner(postGame)
    assert.equal(
      postGame.winner,
      computedWinner,
      'game winner should match computedWinner'
    )
    assert(
      postGame.stage.toString() == stages.winnerDecided ||
        postGame.stage.toString() == stages.tied,
      'game stage should be either winnerDecided or tied after both players have revealed'
    )
  }
}

const computeWinner = game => {
  const { addressP1, choiceP1: choiceP1, addressP2, choiceP2 } = game
  const choiceP1Stringified = choiceP1.toString()
  const choiceP2Stringified = choiceP2.toString()

  switch (true) {
    case choiceP1Stringified == choices.rock &&
      choiceP2Stringified == choices.paper:
      return addressP2
    case choiceP1Stringified == choices.rock &&
      choiceP2Stringified == choices.scissors:
      return addressP1
    case choiceP1Stringified == choices.paper &&
      choiceP2Stringified == choices.rock:
      return addressP1
    case choiceP1Stringified == choices.paper &&
      choiceP2Stringified == choices.scissors:
      return addressP2
    case choiceP1Stringified == choices.scissors &&
      choiceP2Stringified == choices.rock:
      return addressP2
    case choiceP1Stringified == choices.scissors &&
      choiceP2Stringified == choices.paper:
      return addressP1
    case choiceP1Stringified == choiceP2Stringified:
      return addressZero
    default:
      assert(false, 'choices are invalid for determining winner!')
  }
}

const computeFees = async (contracts, feePayer, betAmount) => {
  const { rps } = contracts

  const feePerMille = await rps.feePerMille()
  const referralFeePerMille = await rps.referralFeePerMille()
  const referrer = await rps.referredBy(feePayer)
  let referralFee = toBN(0)
  let ownerFee = betAmount.mul(feePerMille).div(toBN(1e3))
  let betAfterFee = toBN(0)

  if (referrer != addressZero) {
    referralFee = betAmount.mul(referralFeePerMille).div(toBN(1e3))
    ownerFee = ownerFee.sub(referralFee)
  }

  betAfterFee = betAmount.sub(ownerFee).sub(referralFee)

  return {
    betAfterFee,
    ownerFee,
    referralFee,
    referrer
  }
}

const createJoinedGame = async (
  contracts,
  betAmount,
  addressP1,
  addressP2,
  referrerP1 = addressZero,
  referrerP2 = addressZero
) => {
  const { bnk, tst } = contracts

  await testDepositTokens(bnk, tst.address, betAmount, {
    from: addressP1
  })
  await testDepositTokens(bnk, tst.address, betAmount, {
    from: addressP2
  })

  const gameId = await testCreateGame(
    contracts,
    referrerP1,
    tst.address,
    betAmount,
    {
      from: addressP1
    }
  )
  await testJoinGame(contracts, referrerP2, gameId, {
    from: addressP2
  })

  return gameId
}

const createCommittedGame = async (
  contracts,
  betAmount,
  addressP1,
  addressP2,
  choiceP1,
  choiceP2,
  referrerP1 = addressZero,
  referrerP2 = addressZero
) => {
  const { bnk, tst } = contracts

  await testDepositTokens(bnk, tst.address, betAmount, {
    from: addressP1
  })
  await testDepositTokens(bnk, tst.address, betAmount, {
    from: addressP2
  })

  const gameId = await testCreateGame(
    contracts,
    referrerP1,
    tst.address,
    betAmount,
    {
      from: addressP1
    }
  )
  await testJoinGame(contracts, referrerP2, gameId, {
    from: addressP2
  })
  const p1Data = await testCommitChoice(contracts, gameId, choiceP1, {
    from: addressP1
  })
  const p2Data = await testCommitChoice(contracts, gameId, choiceP2, {
    from: addressP2
  })

  return {
    gameId,
    p1Data,
    p2Data
  }
}

const createRevealedGame = async (
  contracts,
  betAmount,
  addressP1,
  addressP2,
  choiceP1,
  choiceP2,
  referrerP1 = addressZero,
  referrerP2 = addressZero
) => {
  const { bnk, tst } = contracts

  await testDepositTokens(bnk, tst.address, betAmount, {
    from: addressP1
  })
  await testDepositTokens(bnk, tst.address, betAmount, {
    from: addressP2
  })

  const gameId = await testCreateGame(
    contracts,
    referrerP1,
    tst.address,
    betAmount,
    {
      from: addressP1
    }
  )
  await testJoinGame(contracts, referrerP2, gameId, {
    from: addressP2
  })
  const p1Data = await testCommitChoice(contracts, gameId, choiceP1, {
    from: addressP1
  })
  const p2Data = await testCommitChoice(contracts, gameId, choiceP2, {
    from: addressP2
  })
  await testRevealChoice(contracts, p1Data.gameId, p1Data.choice, p1Data.sig, {
    from: p1Data.address
  })
  await testRevealChoice(contracts, p2Data.gameId, p2Data.choice, p2Data.sig, {
    from: p2Data.address
  })

  return gameId
}

const testSettleBetWinner = async (contracts, gameId, config) => {
  const { rps, bnk } = contracts

  const {
    addressP1,
    addressP2,
    tokenAddress,
    bet,
    stage: preStage,
    winner
  } = await rps.games(gameId)
  const loser = winner == addressP1 ? addressP2 : addressP1
  const referrerP1 = await rps.referredBy(addressP1)
  const referrerP2 = await rps.referredBy(addressP2)

  const preOwnerTokenBankBalance = await bnk.tokenBalanceOf(owner, tokenAddress)
  const preReferrerP1TokenBankBalance = await bnk.tokenBalanceOf(
    referrerP1,
    tokenAddress
  )
  const preReferrerP2TokenBankBalance = await bnk.tokenBalanceOf(
    referrerP2,
    tokenAddress
  )
  const preWinnerTokenBankBalance = await bnk.tokenBalanceOf(
    winner,
    tokenAddress
  )
  const preWinnerAllocatedTokens = await bnk.allocatedTokensOf(
    winner,
    tokenAddress
  )
  const preLoserTokenBankBalance = await bnk.tokenBalanceOf(loser, tokenAddress)
  const preLoserAllocatedTokens = await bnk.allocatedTokensOf(
    loser,
    tokenAddress
  )

  await rps.settleBet(gameId, config)

  const { stage: postStage } = await rps.games(gameId)
  const {
    ownerFee: ownerFeeP1,
    referralFee: referralFeeP1,
    betAfterFee: betAfterFeeP1
  } = await computeFees(contracts, addressP1, bet)
  const {
    ownerFee: ownerFeeP2,
    referralFee: referralFeeP2,
    betAfterFee: betAfterFeeP2
  } = await computeFees(contracts, addressP2, bet)

  const postOwnerTokenBankBalance = await bnk.tokenBalanceOf(
    owner,
    tokenAddress
  )
  const postReferrerP1TokenBankBalance = await bnk.tokenBalanceOf(
    referrerP1,
    tokenAddress
  )
  const postReferrerP2TokenBankBalance = await bnk.tokenBalanceOf(
    referrerP2,
    tokenAddress
  )
  const postWinnerTokenBankBalance = await bnk.tokenBalanceOf(
    winner,
    tokenAddress
  )
  const postWinnerAllocatedTokens = await bnk.allocatedTokensOf(
    winner,
    tokenAddress
  )
  const postLoserTokenBankBalance = await bnk.tokenBalanceOf(
    loser,
    tokenAddress
  )
  const postLoserAllocatedTokens = await bnk.allocatedTokensOf(
    loser,
    tokenAddress
  )

  if (referrerP1 != referrerP2) {
    assert.equal(
      postReferrerP1TokenBankBalance
        .sub(preReferrerP1TokenBankBalance)
        .toString(),
      referralFeeP1.toString(),
      'referrerP1 token bank balance should be incremented by referral fee'
    )
    assert.equal(
      postReferrerP2TokenBankBalance
        .sub(preReferrerP2TokenBankBalance)
        .toString(),
      referralFeeP2.toString(),
      'referrerP2 token bank balance should be incremented by referral fee'
    )
  } else {
    assert.equal(
      postReferrerP1TokenBankBalance.toString(),
      postReferrerP2TokenBankBalance.toString(),
      'balance for the same referrer should match'
    )
    assert.equal(
      postReferrerP1TokenBankBalance
        .sub(preReferrerP1TokenBankBalance)
        .toString(),
      referralFeeP1.add(referralFeeP2).toString(),
      'referrer balance should be incremented by both referral fees'
    )
  }

  assert.equal(
    postOwnerTokenBankBalance.sub(preOwnerTokenBankBalance).toString(),
    ownerFeeP1.add(ownerFeeP2).toString(),
    'owner token bank balance should be incremented by both player owner fees'
  )
  assert.equal(
    postWinnerTokenBankBalance.sub(preWinnerTokenBankBalance).toString(),
    betAfterFeeP1.add(betAfterFeeP2).toString(),
    'winner token bank balance should be incremented by both players bets after fees'
  )
  assert.equal(
    preWinnerAllocatedTokens.sub(postWinnerAllocatedTokens).toString(),
    bet.toString(),
    'winner allocated tokens should be decremented by original bet amount'
  )
  assert.equal(
    preLoserTokenBankBalance.sub(postLoserTokenBankBalance).toString(),
    '0',
    'loser token bank balance should remain unchanged'
  )
  assert.equal(
    preLoserAllocatedTokens.sub(postLoserAllocatedTokens).toString(),
    bet.toString(),
    'loser allocated tokens should be decremented by bet amount'
  )
  assert(
    preStage.toString() == stages.winnerDecided ||
      preStage.toString() == stages.timedOut,
    'game stage should be in winnerDecided or timedOut before settling'
  )
  assert.equal(
    postStage.toString(),
    stages.paid,
    'game stage should be in paid after settling'
  )
}

const testSettleBetTied = async (contracts, gameId, config) => {
  const { rps, bnk } = contracts

  const {
    addressP1,
    addressP2,
    tokenAddress,
    bet,
    stage: preStage,
    winner
  } = await rps.games(gameId)
  const referrerP1 = await rps.referredBy(addressP1)
  const referrerP2 = await rps.referredBy(addressP2)

  const preOwnerTokenBankBalance = await bnk.tokenBalanceOf(owner, tokenAddress)
  const preReferrerP1TokenBankBalance = await bnk.tokenBalanceOf(
    referrerP1,
    tokenAddress
  )
  const preReferrerP2TokenBankBalance = await bnk.tokenBalanceOf(
    referrerP2,
    tokenAddress
  )
  const preAddressP1TokenBankBalance = await bnk.tokenBalanceOf(
    addressP1,
    tokenAddress
  )
  const preAddressP1AllocatedTokens = await bnk.allocatedTokensOf(
    addressP1,
    tokenAddress
  )
  const preAddressP2TokenBankBalance = await bnk.tokenBalanceOf(
    addressP2,
    tokenAddress
  )
  const preAddressP2AllocatedTokens = await bnk.allocatedTokensOf(
    addressP2,
    tokenAddress
  )

  await rps.settleBet(gameId, config)

  const { stage: postStage } = await rps.games(gameId)
  const {
    ownerFee: ownerFeeP1,
    referralFee: referralFeeP1,
    betAfterFee: betAfterFeeP1
  } = await computeFees(contracts, addressP1, bet)
  const {
    ownerFee: ownerFeeP2,
    referralFee: referralFeeP2,
    betAfterFee: betAfterFeeP2
  } = await computeFees(contracts, addressP2, bet)

  const postOwnerTokenBankBalance = await bnk.tokenBalanceOf(
    owner,
    tokenAddress
  )
  const postReferrerP1TokenBankBalance = await bnk.tokenBalanceOf(
    referrerP1,
    tokenAddress
  )
  const postReferrerP2TokenBankBalance = await bnk.tokenBalanceOf(
    referrerP2,
    tokenAddress
  )
  const postAddressP1TokenBankBalance = await bnk.tokenBalanceOf(
    addressP1,
    tokenAddress
  )
  const postAddressP1AllocatedTokens = await bnk.allocatedTokensOf(
    addressP1,
    tokenAddress
  )
  const postAddressP2TokenBankBalance = await bnk.tokenBalanceOf(
    addressP2,
    tokenAddress
  )
  const postAddressP2AllocatedTokens = await bnk.allocatedTokensOf(
    addressP2,
    tokenAddress
  )

  assert.equal(
    postOwnerTokenBankBalance.sub(preOwnerTokenBankBalance).toString(),
    ownerFeeP1.add(ownerFeeP2).toString(),
    'owner token bank balance should be incremented by both player owner fees'
  )

  if (referrerP1 != referrerP2) {
    assert.equal(
      postReferrerP1TokenBankBalance
        .sub(preReferrerP1TokenBankBalance)
        .toString(),
      referralFeeP1.toString(),
      'referrerP1 token bank balance should be incremented by referral fee'
    )
    assert.equal(
      postReferrerP2TokenBankBalance
        .sub(preReferrerP2TokenBankBalance)
        .toString(),
      referralFeeP2.toString(),
      'referrerP2 token bank balance should be incremented by referral fee'
    )
  } else {
    assert.equal(
      postReferrerP1TokenBankBalance.toString(),
      postReferrerP2TokenBankBalance.toString(),
      'balance for the same referrer should match'
    )
    assert.equal(
      postReferrerP1TokenBankBalance
        .sub(preReferrerP1TokenBankBalance)
        .toString(),
      referralFeeP1.add(referralFeeP2).toString(),
      'referrer balance should be incremented by both referral fees'
    )
  }

  assert.equal(
    postAddressP1TokenBankBalance.sub(preAddressP1TokenBankBalance).toString(),
    betAfterFeeP1.toString(),
    'tokenBalanceOf addressP1 should be incremented by betAfterFeeP1'
  )
  assert.equal(
    preAddressP1AllocatedTokens.sub(postAddressP1AllocatedTokens).toString(),
    bet.toString(),
    'allocatedTokensOf addressP1 should be decremented by bet amount'
  )
  assert.equal(
    postAddressP2TokenBankBalance.sub(preAddressP2TokenBankBalance).toString(),
    betAfterFeeP2.toString(),
    'tokenBalanceOf addressP2 should be incremented by betAfterFeeP2'
  )
  assert.equal(
    preAddressP2AllocatedTokens.sub(postAddressP2AllocatedTokens).toString(),
    bet.toString(),
    'allocatedTokensOf addressP2 should be decremented by bet amount'
  )
  assert.equal(winner, addressZero, 'winner should be addressZero')
  assert.equal(
    preStage.toString(),
    stages.tied,
    'game stage should be in winnerDecided before settling'
  )
  assert.equal(
    postStage.toString(),
    stages.paid,
    'game stage should be in paid after settling'
  )
}

const testCancelGame = async (contracts, gameId, config) => {
  const { from: canceller } = config
  const { rps, bnk } = contracts
  const referrer = await rps.referredBy(canceller)

  const {
    stage: preStage,
    tokenAddress,
    addressP1,
    addressP2,
    bet
  } = await rps.games(gameId)
  const preTokenBankBalance = await bnk.tokenBalanceOf(canceller, tokenAddress)
  const preAllocatedTokens = await bnk.allocatedTokensOf(
    canceller,
    tokenAddress
  )
  const preOwnerTokenBankBalance = await bnk.tokenBalanceOf(owner, tokenAddress)
  const preReferrerTokenBankBalance = await bnk.tokenBalanceOf(
    referrer,
    tokenAddress
  )

  await rps.cancelGame(gameId, config)

  const {
    ownerFee: ownerFee,
    referralFee: referralFee,
    betAfterFee: betAfterFee
  } = await computeFees(contracts, addressP1, bet)
  const { stage: postStage } = await rps.games(gameId)
  const postTokenBankBalance = await bnk.tokenBalanceOf(canceller, tokenAddress)
  const postAllocatedTokens = await bnk.allocatedTokensOf(
    canceller,
    tokenAddress
  )
  const postOwnerTokenBankBalance = await bnk.tokenBalanceOf(
    owner,
    tokenAddress
  )
  const postReferrerTokenBankBalance = await bnk.tokenBalanceOf(
    referrer,
    tokenAddress
  )

  assert.equal(
    preStage.toString(),
    stages.created,
    'preStage should be cancelled'
  )
  assert.equal(
    postStage.toString(),
    stages.cancelled,
    'postStage should be cancelled'
  )
  assert.equal(
    postTokenBankBalance.sub(preTokenBankBalance).toString(),
    betAfterFee.toString(),
    'tokenBalanceOf canceller should be incremented by betAfterFee'
  )
  assert.equal(
    preAllocatedTokens.sub(postAllocatedTokens).toString(),
    bet.toString(),
    'allocatedTokensOf canceller should be decremented by bet amount'
  )
  assert.equal(
    postOwnerTokenBankBalance.sub(preOwnerTokenBankBalance).toString(),
    ownerFee.toString(),
    'tokenBalanceOf owner should be incremented by ownerFee'
  )
  assert.equal(
    postReferrerTokenBankBalance.sub(preReferrerTokenBankBalance).toString(),
    referralFee.toString(),
    'tokenBalanceOf referrer should be incremented by referralFee'
  )
  assert.equal(
    addressP2,
    addressZero,
    'addressP2 should be uninitialized (no one should have joined)'
  )
  assert.equal(
    addressP1,
    canceller,
    'only addressP2 should be able to cancel the game'
  )
}

const testStartGameTimeout = async (contracts, gameId, config) => {
  const { rps } = contracts

  const { stage: preStage } = await rps.games(gameId)

  const {
    receipt: { blockNumber }
  } = await rps.startGameTimeout(gameId, config)
  const { timestamp } = await web3.eth.getBlock(blockNumber)

  const postTimeout = await rps.timingOutGames(gameId)
  const { stage: postStage } = await rps.games(gameId)

  assert(
    areInRange(postTimeout, defaultTimeoutInSeconds.add(toBN(timestamp)), 5)
  )
  assert(
    preStage.toString() == stages.ready ||
      preStage.toString() == stages.committed,
    'preStage should be either ready or committed'
  )
  assert.equal(
    postStage.toString(),
    stages.timingOut,
    'postStage should be timingOut'
  )
}

const testTimeoutGame = async (contracts, gameId, config) => {
  const { rps } = contracts

  const {
    stage: preStage,
    winner: preWinner,
    choiceSecretP1,
    choiceSecretP2,
    choiceP1,
    choiceP2,
    addressP1,
    addressP2
  } = await rps.games(gameId)
  const timeout = await rps.timingOutGames(gameId)

  const {
    receipt: { blockNumber }
  } = await rps.timeoutGame(gameId, config)
  const { timestamp } = await web3.eth.getBlock(blockNumber)

  const { stage: postStage, winner: postWinner } = await rps.games(gameId)
  let expectedWinner

  switch (true) {
    case choiceSecretP1 == bytes32Zero:
      expectedWinner = addressP2
      break
    case choiceSecretP2 == bytes32Zero:
      expectedWinner = addressP1
      break
    case choiceP1 == choices.undecided:
      expectedWinner = addressP2
      break
    case choiceP2 == choices.undecided:
      expectedWinner = addressP1
      break
    default:
      throw new Error(
        'should not be able to timeout due to all commits and reveals being preset'
      )
  }

  assert.equal(
    preStage.toString(),
    stages.timingOut,
    'preStage should be timingOut'
  )
  assert.equal(
    postStage.toString(),
    stages.timedOut,
    'postStage should be timedOut'
  )
  assert(
    timeout.lte(toBN(timestamp)),
    'timeout should be less than current block timestamp'
  )
  assert.equal(preWinner, addressZero, 'preWinner should be addressZero')
  assert.equal(
    postWinner,
    expectedWinner,
    'postWinner should match expected winner'
  )
}

const testPause = async (contracts, config) => {
  const { rps } = contracts

  const prePaused = await rps.paused()

  await rps.pause(config)

  const postPaused = await rps.paused()

  assert(!prePaused, 'prePaused should be false')
  assert(postPaused, 'postPaused should be true')
}

const testUnpause = async (contracts, config) => {
  const { rps } = contracts

  const prePaused = await rps.paused()

  await rps.unpause(config)

  const postPaused = await rps.paused()

  assert(prePaused, 'prePaued should be true')
  assert(!postPaused, 'postPaused should be false')
}

const testUpdateMinBet = async (contracts, minBet, config) => {
  const { rps } = contracts

  await rps.updateMinBet(minBet, config)

  const postMinBet = await rps.minBet()

  assert.equal(
    postMinBet.toString(),
    minBet.toString(),
    'postMinBet should match minBet'
  )
}

const testUpdateTimeout = async (contracts, timeout, config) => {
  const { rps } = contracts

  await rps.updateTimeout(timeout, config)

  const postTimeout = await rps.timeoutInSeconds()

  assert.equal(
    postTimeout.toString(),
    timeout.toString(),
    'postTimeout should match timeout'
  )
}

const testUpdateReferralFeePerMille = async (
  contracts,
  referralFeePerMille,
  config
) => {
  const { rps } = contracts

  await rps.updateReferralFeePerMille(referralFeePerMille, config)

  const postReferralFeePerMille = await rps.referralFeePerMille()

  assert.equal(
    postReferralFeePerMille.toString(),
    referralFeePerMille.toString(),
    'postReferralFeePerMille should match referralFeePerMille'
  )
}

const testUpdateFeePerMille = async (contracts, feePerMille, config) => {
  const { rps } = contracts

  await rps.updateFeePerMille(feePerMille, config)

  const postFeePerMille = await rps.feePerMille()

  assert.equal(
    postFeePerMille.toString(),
    feePerMille.toString(),
    'postFeePerMille should match feePerMille'
  )
}

module.exports = {
  stages,
  choices,
  testGameIsEmpty,
  defaultMinBet,
  defaultTimeoutInSeconds,
  defaultReferralFeePerMille,
  defaultFeePerMille,
  testInitialization,
  testCreateGame,
  testJoinGame,
  testCommitChoice,
  testRevealChoice,
  computeWinner,
  computeFees,
  testSettleBetWinner,
  testSettleBetTied,
  createJoinedGame,
  createCommittedGame,
  createRevealedGame,
  testCancelGame,
  testStartGameTimeout,
  testTimeoutGame,
  testPause,
  testUnpause,
  testUpdateMinBet,
  testUpdateTimeout,
  testUpdateReferralFeePerMille,
  testUpdateFeePerMille
}
