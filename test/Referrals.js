const {
  setupContracts,
  assertRevert,
  owner,
  other,
  stubGameContract,
  addressZero,
  referrer,
  referee
} = require('./helpers/general')
const { testInitializeReferrals, testSetReferral } = require('./helpers/ref')

describe('when using Referrals contract', () => {
  contract('Referrals', () => {
    let contracts

    before('setup contracts', async () => {
      contracts = await setupContracts()
      const { reg } = contracts
      // add stub to registry to allow for referral updates for testing
      await reg.addGameContract(stubGameContract, {
        from: owner
      })
    })

    it('should NOT initialize with invalid registry', async () => {
      await assertRevert(
        testInitializeReferrals(contracts, other, {
          from: owner
        })
      )
      await assertRevert(
        testInitializeReferrals(contracts, addressZero, {
          from: owner
        })
      )
    })

    it('should initialize with valid registry', async () => {
      const {
        reg: { address: regAddress }
      } = contracts
      await testInitializeReferrals(contracts, regAddress, { from: owner })
    })

    it('should NOT initialize again', async () => {
      const {
        reg: { address: regAddress }
      } = contracts
      await assertRevert(
        testInitializeReferrals(contracts, regAddress, {
          from: owner
        })
      )
    })

    it('should NOT setReferral as NOT gameContract', async () => {
      await assertRevert(
        testSetReferral(contracts, referee, referrer, { from: other })
      )
    })

    it('should setReferral as gameContract', async () => {
      await testSetReferral(contracts, referee, referrer, {
        from: stubGameContract
      })
    })
  })
})
