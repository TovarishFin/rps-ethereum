const {
  owner,
  ethUser,
  tokenUser,
  gasPrice,
  assertRevert
} = require('./helpers/general')
const {
  setupBankStub,
  testConstructor,
  testDepositEth,
  testDepositEthFor,
  testWithdrawEth,
  testDepositTokens,
  testWithdrawTokens,
  testAllocateTokensOf,
  testDeAllocateTokensOf,
  testTransferAllocatedTokensOf
} = require('./helpers/bnk')
const { toBN } = require('web3-utils')

describe('when deploying Bank', () => {
  contract('Bank', () => {
    let bnk, reg, weth

    before('setup contracts', async () => {
      const contracts = await setupBankStub()
      bnk = contracts.bnk
      reg = contracts.reg
      weth = contracts.weth
    })

    it('should start with the correct storage', async () => {
      await testConstructor(bnk, reg, weth)
    })
  })
})

describe('when handling ether', () => {
  contract('Bank', () => {
    let bnk, weth
    const depositAmount = toBN(1e17)

    before('setup contracts', async () => {
      const contracts = await setupBankStub()
      bnk = contracts.bnk
      weth = contracts.weth
    })

    it('should NOT allow 0 eth deposits', async () => {
      await assertRevert(
        testDepositEth(bnk, weth, {
          from: ethUser,
          value: 0,
          gasPrice
        })
      )
    })

    it('should deposit eth', async () => {
      await testDepositEth(bnk, weth, {
        from: ethUser,
        value: depositAmount,
        gasPrice
      })
    })

    it('should withdraw partial ether balance', async () => {
      await testWithdrawEth(bnk, weth, depositAmount.div(toBN(2)), {
        from: ethUser,
        gasPrice
      })
    })

    it('should NOT allow withdrawing more than ether balance', async () => {
      await assertRevert(
        testWithdrawEth(bnk, weth, depositAmount, {
          from: ethUser,
          gasPrice
        })
      )
    })

    it('should allow withdrawing a users full ether balance', async () => {
      const userBalance = await bnk.tokenBalanceOf(ethUser, weth.address)
      await testWithdrawEth(bnk, weth, userBalance, {
        from: ethUser,
        gasPrice
      })
    })

    it('should NOT depositEthFor another address when deposit is 0', async () => {
      await assertRevert(
        testWithdrawEth(bnk, weth, 0, {
          from: ethUser,
          gasPrice
        })
      )
    })

    it('should depositEthFor another address', async () => {
      const recipient = tokenUser
      await testDepositEthFor(bnk, weth, recipient, {
        from: ethUser,
        value: depositAmount,
        gasPrice
      })
    })
  })
})

describe('when handling tokens', () => {
  contract('Bank', () => {
    const depositAmount = toBN(1e17)
    let bnk, tst

    before('setup contracts', async () => {
      const contracts = await setupBankStub()
      bnk = contracts.bnk
      tst = contracts.tst
    })

    it('should depositTokens', async () => {
      await testDepositTokens(bnk, tst.address, depositAmount, {
        from: tokenUser
      })
    })

    it('should withdraw partial token balance', async () => {
      await testWithdrawTokens(bnk, tst.address, depositAmount.div(toBN(2)), {
        from: tokenUser
      })
    })

    it('should NOT allow withdrawing more than token balance', async () => {
      await assertRevert(
        testWithdrawTokens(bnk, tst.address, depositAmount, {
          from: tokenUser
        })
      )
    })

    it('should allow withdrawing a users full token balance', async () => {
      const bankTokenBalance = await bnk.tokenBalanceOf(tokenUser, tst.address)
      await testWithdrawTokens(bnk, tst.address, bankTokenBalance, {
        from: tokenUser
      })
    })

    it('should NOT allocateTokensOf user when insufficient balance', async () => {
      await assertRevert(
        testAllocateTokensOf(bnk, tokenUser, tst.address, depositAmount, {
          from: owner
        })
      )
    })

    it('should allocateTokensOf user when sufficient balance', async () => {
      await testDepositTokens(bnk, tst.address, depositAmount, {
        from: tokenUser
      })
      await testAllocateTokensOf(bnk, tokenUser, tst.address, depositAmount, {
        from: owner
      })
    })

    it('should deAllocateTokensOf user when sufficient allocation', async () => {
      await testDeAllocateTokensOf(bnk, tokenUser, tst.address, depositAmount, {
        from: owner
      })
    })

    it('should NOT deAllocateTokensOf user when insufficient allocation', async () => {
      await assertRevert(
        testDeAllocateTokensOf(bnk, tokenUser, tst.address, depositAmount, {
          from: owner
        })
      )
    })

    it('should testTransferAllocatedTokensOf fundsOwner to recipient', async () => {
      await testAllocateTokensOf(bnk, tokenUser, tst.address, depositAmount, {
        from: owner
      })
      await testTransferAllocatedTokensOf(
        bnk,
        tokenUser,
        tst.address,
        ethUser,
        depositAmount,
        {
          from: owner
        }
      )
    })

    it('should NOT testTransferAllocatedTokensOf fundsOwner to recipient when insufficient allocation', async () => {
      await assertRevert(
        testTransferAllocatedTokensOf(
          bnk,
          tokenUser,
          tst.address,
          ethUser,
          depositAmount,
          {
            from: owner
          }
        )
      )
    })
  })
})
