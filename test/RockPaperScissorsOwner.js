const {
  setupContracts,
  owner,
  tokenUser,
  assertRevert
} = require('./helpers/general')
const {
  testInitialization,
  testPause,
  testUnpause,
  testUpdateMinBet,
  testUpdateTimeout,
  testUpdateReferralFeePerMille,
  testUpdateFeePerMille
} = require('./helpers/rps')
const { toBN } = require('web3-utils')

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
