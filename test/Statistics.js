const {
  setupContracts,
  assertRevert,
  owner,
  other,
  stubGameContract,
  addressZero
} = require('./helpers/general')
const {
  testInitializeStatistics,
  testIncrementTotalPlayCount,
  testIncrementTotalWinCount,
  testIncrementTotalWinVolume,
  testIncrementTotalReferralCount,
  testIncrementTotalReferralVolume
} = require('./helpers/sta')
const { toBN } = require('web3-utils')

describe('when using Statistics contract', () => {
  contract('Statistics', () => {
    let contracts
    const incrementAmount = toBN(1e18)

    before('setup contract', async () => {
      contracts = await setupContracts()
      const { reg } = contracts
      // add stub to registry to allow for statistics updates in testing
      await reg.addGameContract(stubGameContract, {
        from: owner
      })
    })

    it('should NOT initialize with invalid registry', async () => {
      await assertRevert(
        testInitializeStatistics(contracts, other, {
          from: owner
        })
      )
      await assertRevert(
        testInitializeStatistics(contracts, addressZero, {
          from: owner
        })
      )
    })

    it('should initialize with valid registry', async () => {
      const {
        reg: { address: regAddress }
      } = contracts
      await testInitializeStatistics(contracts, regAddress, {
        from: owner
      })
    })

    it('should NOT initialize again', async () => {
      const {
        reg: { address: regAddress }
      } = contracts
      await assertRevert(
        testInitializeStatistics(contracts, regAddress, {
          from: owner
        })
      )
    })

    it('should NOT incrementTotalPlayCount as NOT gameContract', async () => {
      await assertRevert(
        testIncrementTotalPlayCount(contracts, { from: other })
      )
    })

    it('should NOT incrementTotalWinCount as NOT gameContract', async () => {
      await assertRevert(testIncrementTotalWinCount(contracts, { from: other }))
    })

    it('should NOT incrementTotalWinVolume as NOT gameContract', async () => {
      await assertRevert(
        testIncrementTotalWinVolume(contracts, incrementAmount, {
          from: other
        })
      )
    })

    it('should NOT incrementTotalReferralCount as NOT gameContract', async () => {
      await assertRevert(
        testIncrementTotalReferralCount(contracts, {
          from: other
        })
      )
    })

    it('should NOT incrementTotalReferralVolume as NOT gameContract', async () => {
      await assertRevert(
        testIncrementTotalReferralVolume(contracts, incrementAmount, {
          from: other
        })
      )
    })

    it('should incrementTotalPlayCount as gameContract', async () => {
      testIncrementTotalPlayCount(contracts, {
        from: stubGameContract
      })
    })

    it('should incrementTotalWinCount as gameContract', async () => {
      testIncrementTotalWinCount(contracts, {
        from: stubGameContract
      })
    })

    it('should incrementTotalWinVolume as gameContract', async () => {
      testIncrementTotalWinVolume(contracts, incrementAmount, {
        from: stubGameContract
      })
    })

    it('should incrementTotalReferralCount as gameContract', async () => {
      testIncrementTotalReferralCount(contracts, {
        from: stubGameContract
      })
    })

    it('should incrementTotalReferralVolume as gameContract', async () => {
      testIncrementTotalReferralVolume(contracts, incrementAmount, {
        from: stubGameContract
      })
    })
  })
})
