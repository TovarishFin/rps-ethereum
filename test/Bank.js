const {
  setupContracts,
  ethUser,
  gasPrice,
  assertRevert
} = require('./helpers/general')
const {
  setupBankStub,
  testConstructor,
  testDepositEth,
  testWithdrawEth,
  testAllocateEtherOf
} = require('./helpers/bnk')
const { toBN } = require('web3-utils')

describe('when deploying Bank', () => {
  contract('Bank', () => {
    let bnk, reg

    before('setup contracts', async () => {
      const contracts = await setupContracts()
      bnk = contracts.rps
      reg = contracts.reg
    })

    it('should start with the correct storage', async () => {
      await testConstructor(bnk, reg)
    })
  })
})

describe('when handling ether', () => {
  contract('Bank', () => {
    let bnk
    const depositAmount = toBN(1e17)

    before('setup contracts', async () => {
      bnk = await setupBankStub()
    })

    it('should NOT allow 0 eth deposits', async () => {
      await assertRevert(
        testDepositEth(bnk, {
          from: ethUser,
          value: 0,
          gasPrice
        })
      )
    })

    it('should deposit eth', async () => {
      await testDepositEth(bnk, {
        from: ethUser,
        value: depositAmount,
        gasPrice
      })
    })

    it('should withdraw partial ether balance', async () => {
      await testWithdrawEth(bnk, depositAmount.div(toBN(2)), {
        from: ethUser,
        gasPrice
      })
    })

    it('should NOT allow withdrawing more than ether balance', async () => {
      await assertRevert(
        testWithdrawEth(bnk, depositAmount, {
          from: ethUser,
          gasPrice
        })
      )
    })

    it('should allow withdrawing a users full balance', async () => {
      const userBalance = await bnk.etherBalanceOf(ethUser)
      await testWithdrawEth(bnk, userBalance, {
        from: ethUser,
        gasPrice
      })
    })

    it('should NOT allocateEtherOf when user does NOT have sufficient balance', async () => {
      const userBalance = await bnk.etherBalanceOf(ethUser)
      await assertRevert(
        testAllocateEtherOf(bnk, ethUser, userBalance.add(toBN(1)), {
          from: ethUser
        })
      )
    })

    it('should allocateEtherOf when user has sufficient balance', async () => {
      // deposit ether before testing allocation to ensure we have at least enough balance
      await testDepositEth(bnk, {
        from: ethUser,
        value: depositAmount,
        gasPrice
      })
      await testAllocateEtherOf(bnk, ethUser, depositAmount, {
        from: ethUser
      })
    })
  })
})
