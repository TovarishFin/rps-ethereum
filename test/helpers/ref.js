const testInitializeReferrals = async (contracts, registry, config) => {
  const { ref } = contracts

  await ref.initialize(registry, config)

  const postRegistry = await ref.registry()

  assert.equal(registry, postRegistry, 'postRegistry should match registry')
}

const testSetReferral = async (contracts, referee, referrer, config) => {
  const { ref } = contracts

  await ref.setReferral(referee, referrer, config)

  const postReferrer = await ref.getReferral(referee)

  assert.equal(referrer, postReferrer, 'postReferrer should match referrer')
}

module.exports = {
  testInitializeReferrals,
  testSetReferral
}
