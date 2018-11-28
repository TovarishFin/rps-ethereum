const BankStub = artifacts.require('BankStub')
const Registry = artifacts.require('Registry')
const { getEtherBalance, owner } = require('./general')
const { toBN } = require('web3-utils')

const setupBankStub = async () => {
  const reg = await Registry.new({
    from: owner
  })

  const bnk = await BankStub.new(reg.address, {
    from: owner
  })

  return bnk
}

const testConstructor = async (bnk, reg) => {
  const bnkReg = await bnk.registry()

  assert.equal(
    bnkReg,
    reg.address,
    'bnk registry should match registry address'
  )
}

const testDepositEth = async (bnk, config) => {
  const { from: depositor, value: depositAmount, gasPrice } = config
  const preDepositorBalance = await getEtherBalance(depositor)
  const preContractBalance = await getEtherBalance(bnk.address)
  const preBalanceStorage = await bnk.etherBalanceOf(depositor)

  const {
    receipt: { gasUsed }
  } = await bnk.depositEther(config)
  const gasCost = gasPrice.mul(toBN(gasUsed))

  const postDepositorBalance = await getEtherBalance(depositor)
  const postContractBalance = await getEtherBalance(bnk.address)
  const postBalanceStorage = await bnk.etherBalanceOf(depositor)

  assert.equal(
    preDepositorBalance.sub(postDepositorBalance).toString(),
    depositAmount.add(gasCost).toString(),
    'depositor account balance should be decremented by depositAmount + gas costs'
  )
  assert.equal(
    postContractBalance.sub(preContractBalance).toString(),
    depositAmount.toString(),
    'contract balance should be incremented by depositAmount'
  )
  assert.equal(
    postBalanceStorage.sub(preBalanceStorage).toString(),
    depositAmount.toString(),
    'etherBalanceOf depositor storage should be incremented by depositAmount'
  )
}

const testWithdrawEth = async (bnk, withdrawAmount, config) => {
  const { from: withdrawer, gasPrice } = config
  const preWithdrawerBalance = await getEtherBalance(withdrawer)
  const preContractBalance = await getEtherBalance(bnk.address)
  const preBalanceStorage = await bnk.etherBalanceOf(withdrawer)

  const {
    receipt: { gasUsed }
  } = await bnk.withdrawEther(withdrawAmount, config)
  const gasCost = gasPrice.mul(toBN(gasUsed))

  const postWithdrawerBalance = await getEtherBalance(withdrawer)
  const postContractBalance = await getEtherBalance(bnk.address)
  const postBalanceStorage = await bnk.etherBalanceOf(withdrawer)

  assert.equal(
    postWithdrawerBalance.sub(preWithdrawerBalance).toString(),
    withdrawAmount.sub(gasCost).toString(),
    'withdrawer account balance should be incremented by withdrawAmount - gas costs'
  )
  assert.equal(
    preContractBalance.sub(postContractBalance).toString(),
    withdrawAmount.toString(),
    'contract balance should be decremented by withdrawAmount'
  )
  assert.equal(
    preBalanceStorage.sub(postBalanceStorage).toString(),
    withdrawAmount.toString(),
    'etherBalanceOf withdrawer storage should be decremented by withdrawAmount'
  )
}

const testAllocateEtherOf = async (
  bnk,
  fundsOwner,
  allocationAmount,
  config
) => {
  const preBalance = await bnk.etherBalanceOf(fundsOwner)
  const preAllocationAmount = await bnk.allocatedEtherOf(fundsOwner)

  await bnk.allocateEtherOf(fundsOwner, allocationAmount, config)

  const postBalance = await bnk.etherBalanceOf(fundsOwner)
  const postAllocationAmount = await bnk.allocatedEtherOf(fundsOwner)

  assert.equal(
    preBalance.sub(postBalance).toString(),
    allocationAmount.toString(),
    'etherBalanceOf fundsOwner storage should be decremented by allocationAmount'
  )
  assert.equal(
    postAllocationAmount.sub(preAllocationAmount).toString(),
    allocationAmount.toString(),
    'allocatedEtherOf fundsOwner should be incremented by allocationAmount'
  )
}

module.exports = {
  setupBankStub,
  testConstructor,
  testDepositEth,
  testWithdrawEth,
  testAllocateEtherOf
}
