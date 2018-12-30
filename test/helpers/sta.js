const testInitializeStatistics = async (contracts, registry, config) => {
  const { sta } = contracts

  await sta.initialize(registry)

  const postRegistry = await sta.registry(registry, config)

  assert.equal(registry, postRegistry, 'postRegistry should match registry')
}

const testIncrementTotalPlayCount = async (contracts, config) => {
  const { sta } = contracts

  const preTotalPlayCount = await sta.totalPlayCount()

  await sta.incrementTotalPlayCount(config)

  const postTotalPlayCount = await sta.totalPlayCount()

  assert.equal(
    postTotalPlayCount.sub(preTotalPlayCount).toString(),
    '1',
    'totalPlayCount should be incremented by 1'
  )
}

const testIncrementTotalWinCount = async (contracts, config) => {
  const { sta } = contracts

  const preTotalWinCount = await sta.totalWinCount()

  await sta.incrementTotalWinCount(config)

  const postTotalWinCount = await sta.totalWinCount()

  assert.equal(
    postTotalWinCount.sub(preTotalWinCount).toString(),
    '1',
    'totalWinCount should be increment by 1'
  )
}

const testIncrementTotalWinVolume = async (
  contracts,
  incrementAmount,
  config
) => {
  const { sta } = contracts

  const preTotalWinVolume = await sta.totalWinVolume()

  await sta.incrementTotalWinVolume(incrementAmount, config)

  const postTotalWinVolume = await sta.totalWinVolume()

  assert.equal(
    postTotalWinVolume.sub(preTotalWinVolume).toString(),
    incrementAmount.toString(),
    'totalWinVolume should be incremented by incrementAmount'
  )
}

const testIncrementTotalReferralCount = async (contracts, config) => {
  const { sta } = contracts

  const preTotalReferralCount = await sta.totalReferralCount()

  await sta.incrementTotalReferralCount(config)

  const postTotalReferralCount = await sta.totalReferralCount()

  assert.equal(
    postTotalReferralCount.sub(preTotalReferralCount).toString(),
    '1',
    'totalReferralCount should be incremented by 1'
  )
}

const testIncrementTotalReferralVolume = async (
  contracts,
  incrementAmount,
  config
) => {
  const { sta } = contracts

  const preTotalReferralVolume = await sta.totalReferralVolume()

  await sta.incrementTotalReferralVolume(incrementAmount, config)

  const postTotalReferralVolume = await sta.totalReferralVolume()

  assert.equal(
    postTotalReferralVolume.sub(preTotalReferralVolume).toString(),
    incrementAmount.toString(),
    'totalReferralVolume should be incremented by incrementAmount'
  )
}

module.exports = {
  testInitializeStatistics,
  testIncrementTotalPlayCount,
  testIncrementTotalWinCount,
  testIncrementTotalWinVolume,
  testIncrementTotalReferralCount,
  testIncrementTotalReferralVolume
}
