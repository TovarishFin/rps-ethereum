const Registry = artifacts.require('Registry')
const WrappedEther = artifacts.require('WrappedEther')
const TestToken = artifacts.require('TestToken')
const BankStub = artifacts.require('BankStub')
const ERC20 = artifacts.require('ERC20')
const { getEtherBalance, owner } = require('./general')
const { toBN } = require('web3-utils')

const setupBankStub = async () => {
  const reg = await Registry.new({
    from: owner
  })

  const weth = await WrappedEther.new({
    from: owner
  })

  const tst = await TestToken.new()

  const bnk = await BankStub.new(reg.address, weth.address, {
    from: owner
  })

  accounts.forEach(async account => {
    await tst.mint(account, toBN(5e18), {
      from: account
    })
    await tst.approve(bnk.address, toBN(5e18), {
      from: account
    })
  })

  return {
    bnk,
    reg,
    weth,
    tst
  }
}

const testConstructor = async (bnk, reg, weth) => {
  const bnkReg = await bnk.registry()
  const bnkWeth = await bnk.weth()

  assert.equal(
    bnkReg,
    reg.address,
    'bnk registry should match registry address'
  )
  assert.equal(
    bnkWeth,
    weth.address,
    'bnk weth should match WrappedEther address'
  )
}

const testDepositEth = async (bnk, weth, config) => {
  const { from: depositor, value: depositAmount, gasPrice } = config

  const preDepositorEthBalance = await getEtherBalance(depositor)
  const preWethEthBalance = await getEtherBalance(weth.address)
  const preBankWethBalance = await weth.balanceOf(bnk.address)
  const preDepositorWethBalance = await bnk.tokenBalanceOf(
    depositor,
    weth.address
  )

  const {
    receipt: { gasUsed }
  } = await bnk.depositEther(config)
  const gasCost = gasPrice.mul(toBN(gasUsed))

  const postDepositorEthBalance = await getEtherBalance(depositor)
  const postWethEthBalance = await getEtherBalance(weth.address)
  const postBankWethBalance = await weth.balanceOf(bnk.address)
  const postDepositorWethBalance = await bnk.tokenBalanceOf(
    depositor,
    weth.address
  )

  assert.equal(
    preDepositorEthBalance.sub(postDepositorEthBalance).toString(),
    depositAmount.add(gasCost).toString(),
    'depositor account eth balance should be decremented by depositAmount + gas costs'
  )
  assert.equal(
    postWethEthBalance.sub(preWethEthBalance).toString(),
    depositAmount.toString(),
    'weth eth balance should be incremented by depositAmount'
  )
  assert.equal(
    postBankWethBalance.sub(preBankWethBalance).toString(),
    depositAmount.toString(),
    'bank weth balance should be incremented by depositAmount'
  )
  assert.equal(
    postDepositorWethBalance.sub(preDepositorWethBalance).toString(),
    depositAmount.toString(),
    'weth tokenBalanceOf depositor should be incremented by depositAmount'
  )
}

const testDepositEthFor = async (bnk, weth, recipient, config) => {
  const { from: depositor, value: depositAmount, gasPrice } = config

  const preDepositorEthBalance = await getEtherBalance(depositor)
  const preWethEthBalance = await getEtherBalance(weth.address)
  const preBankWethBalance = await weth.balanceOf(bnk.address)
  const preRecipientWethBalance = await bnk.tokenBalanceOf(
    recipient,
    weth.address
  )

  const {
    receipt: { gasUsed }
  } = await bnk.depositEtherFor(recipient, config)
  const gasCost = gasPrice.mul(toBN(gasUsed))

  const postDepositorEthBalance = await getEtherBalance(depositor)
  const postWethEthBalance = await getEtherBalance(weth.address)
  const postBankWethBalance = await weth.balanceOf(bnk.address)
  const postRecipientWethBalance = await bnk.tokenBalanceOf(
    recipient,
    weth.address
  )

  assert.equal(
    preDepositorEthBalance.sub(postDepositorEthBalance).toString(),
    depositAmount.add(gasCost).toString(),
    'depositor account eth balance should be decremented by depositAmount + gas costs'
  )
  assert.equal(
    postWethEthBalance.sub(preWethEthBalance).toString(),
    depositAmount.toString(),
    'weth eth balance should be incremented by depositAmount'
  )
  assert.equal(
    postBankWethBalance.sub(preBankWethBalance).toString(),
    depositAmount.toString(),
    'bank weth balance should be incremented by depositAmount'
  )
  assert.equal(
    postRecipientWethBalance.sub(preRecipientWethBalance).toString(),
    depositAmount.toString(),
    'weth tokenBalanceOf depositor should be incremented by depositAmount'
  )
}

const testWithdrawEth = async (bnk, weth, withdrawAmount, config) => {
  const { from: withdrawer, gasPrice } = config

  const preWithdrawerEthBalance = await getEtherBalance(withdrawer)
  const preWethEthBalance = await getEtherBalance(weth.address)
  const preBankWethBalance = await weth.balanceOf(bnk.address)
  const preWithdrawerWethBalance = await bnk.tokenBalanceOf(
    withdrawer,
    weth.address
  )

  const {
    receipt: { gasUsed }
  } = await bnk.withdrawEther(withdrawAmount, config)
  const gasCost = gasPrice.mul(toBN(gasUsed))

  const postWithdrawerEthBalance = await getEtherBalance(withdrawer)
  const postWethEthBalance = await getEtherBalance(weth.address)
  const postBankWethBalance = await weth.balanceOf(bnk.address)
  const postWithdrawerWethBalance = await bnk.tokenBalanceOf(
    withdrawer,
    weth.address
  )

  assert.equal(
    postWithdrawerEthBalance.sub(preWithdrawerEthBalance).toString(),
    withdrawAmount.sub(gasCost).toString(),
    'withdrawer account eth balance should be incremented by withdrawAmount - gas costs'
  )
  assert.equal(
    preWethEthBalance.sub(postWethEthBalance).toString(),
    withdrawAmount.toString(),
    'weth eth balance should be decremented by withdrawAmount'
  )
  assert.equal(
    preBankWethBalance.sub(postBankWethBalance).toString(),
    withdrawAmount.toString(),
    'bank weth balance should be decremented by withdrawAmount'
  )
  assert.equal(
    preWithdrawerWethBalance.sub(postWithdrawerWethBalance).toString(),
    withdrawAmount.toString(),
    'weth tokenBalanceOf withdrawer should be decremented by withdrawAmount'
  )
}

const testDepositTokens = async (bnk, tokenAddress, value, config) => {
  const { from: depositor } = config
  const token = await ERC20.at(tokenAddress)

  const preDepositorBalance = await token.balanceOf(depositor)
  const preBankBalance = await token.balanceOf(bnk.address)
  const preDepositorBankBalance = await bnk.tokenBalanceOf(
    depositor,
    tokenAddress
  )

  await bnk.depositTokens(tokenAddress, value, config)

  const postDepositorBalance = await token.balanceOf(depositor)
  const postBankBalance = await token.balanceOf(bnk.address)
  const postDepositorBankBalance = await bnk.tokenBalanceOf(
    depositor,
    tokenAddress
  )

  assert.equal(
    preDepositorBalance.sub(postDepositorBalance).toString(),
    value.toString(),
    'depositor token balance should be decremented by value'
  )
  assert.equal(
    postBankBalance.sub(preBankBalance).toString(),
    value.toString(),
    'bank token balance should be incremented by value'
  )
  assert.equal(
    postDepositorBankBalance.sub(preDepositorBankBalance).toString(),
    value.toString(),
    'depositor token bank balance should be incremented by value'
  )
}

const testWithdrawTokens = async (bnk, tokenAddress, value, config) => {
  const { from: withdrawer } = config
  const token = await ERC20.at(tokenAddress)

  const preDepositorBalance = await token.balanceOf(withdrawer)
  const preBankBalance = await token.balanceOf(bnk.address)
  const preDepositorBankBalance = await bnk.tokenBalanceOf(
    withdrawer,
    tokenAddress
  )

  await bnk.withdrawTokens(tokenAddress, value, config)

  const postDepositorBalance = await token.balanceOf(withdrawer)
  const postBankBalance = await token.balanceOf(bnk.address)
  const postDepositorBankBalance = await bnk.tokenBalanceOf(
    withdrawer,
    tokenAddress
  )

  assert.equal(
    postDepositorBalance.sub(preDepositorBalance).toString(),
    value.toString(),
    'withdrawer token balance should be incremented by value'
  )
  assert.equal(
    preBankBalance.sub(postBankBalance).toString(),
    value.toString(),
    'bank token balance should be decremented by value'
  )
  assert.equal(
    preDepositorBankBalance.sub(postDepositorBankBalance).toString(),
    value.toString(),
    'withdrawer token bank balance should be decremented by value'
  )
}

const testAllocateTokensOf = async (
  bnk,
  fundsOwner,
  tokenAddress,
  allocationAmount,
  config
) => {
  const preTokenBalance = await bnk.tokenBalanceOf(fundsOwner, tokenAddress)
  const preAllocatedTokens = await bnk.allocatedTokensOf(
    fundsOwner,
    tokenAddress
  )

  await bnk.allocateTokensOf(fundsOwner, tokenAddress, allocationAmount, config)

  const postTokenBalance = await bnk.tokenBalanceOf(fundsOwner, tokenAddress)
  const postAllocatedTokens = await bnk.allocatedTokensOf(
    fundsOwner,
    tokenAddress
  )

  assert.equal(
    preTokenBalance.sub(postTokenBalance).toString(),
    allocationAmount.toString(),
    'tokenBalanceOf fundsOwner should be decremented by allocationAmount'
  )
  assert.equal(
    postAllocatedTokens.sub(preAllocatedTokens).toString(),
    allocationAmount.toString(),
    'allocatedTokensOf fundsOwner should be incremented by allocationAmount'
  )
}

const testDeAllocateTokensOf = async (
  bnk,
  fundsOwner,
  tokenAddress,
  deAllocationAmount,
  config
) => {
  const preTokenBalance = await bnk.tokenBalanceOf(fundsOwner, tokenAddress)
  const preAllocatedTokens = await bnk.allocatedTokensOf(
    fundsOwner,
    tokenAddress
  )

  await bnk.deAllocateTokensOf(
    fundsOwner,
    tokenAddress,
    deAllocationAmount,
    config
  )

  const postTokenBalance = await bnk.tokenBalanceOf(fundsOwner, tokenAddress)
  const postAllocatedTokens = await bnk.allocatedTokensOf(
    fundsOwner,
    tokenAddress
  )

  assert.equal(
    postTokenBalance.sub(preTokenBalance).toString(),
    deAllocationAmount.toString(),
    'tokenBalanceOf fundsOwner should be incremented by allocationAmount'
  )
  assert.equal(
    preAllocatedTokens.sub(postAllocatedTokens).toString(),
    deAllocationAmount.toString(),
    'allocatedTokensOf fundsOwner should be decremented by allocationAmount'
  )
}

const testTransferAllocatedTokensOf = async (
  bnk,
  fundsOwner,
  tokenAddress,
  recipient,
  transferAmount,
  config
) => {
  const preAllocatedBalance = await bnk.allocatedTokensOf(
    fundsOwner,
    tokenAddress
  )
  const preRecipientBalance = await bnk.tokenBalanceOf(recipient, tokenAddress)

  await bnk.transferAllocatedTokensOf(
    fundsOwner,
    tokenAddress,
    recipient,
    transferAmount,
    config
  )

  const postAllocatedBalance = await bnk.allocatedTokensOf(
    fundsOwner,
    tokenAddress
  )
  const postRecipientBalance = await bnk.tokenBalanceOf(recipient, tokenAddress)

  assert.equal(
    preAllocatedBalance.sub(postAllocatedBalance).toString(),
    transferAmount.toString(),
    'allocatedTokensOf fundsOwner should be decremented by transferAmount'
  )
  assert.equal(
    postRecipientBalance.sub(preRecipientBalance).toString(),
    transferAmount.toString(),
    'tokenBalanceOf recipient should be incremented by transferAmount'
  )
}

module.exports = {
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
}
