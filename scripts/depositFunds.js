const Bank = artifacts.require('Bank')
const TestToken = artifacts.require('TestToken')
const chalk = require('chalk')
const { toBN } = require('web3-utils')

/* eslint-disable no-console */

module.exports = async function(callback) {
  const accounts = await web3.eth.getAccounts()

  const bnk = await Bank.deployed()

  const tst = await TestToken.deployed()

  console.log(
    chalk.yellow('minting tst, depositing eth, deposting tokens in bank...')
  )
  for (const account of accounts) {
    const mintAmount = toBN(5e18)
    const deplositAmount = mintAmount.sub(toBN(2e18))
    await tst.mint(account, mintAmount, { from: account })
    await tst.approve(bnk.address, deplositAmount, { from: account })
    await bnk.depositTokens(tst.address, deplositAmount, {
      from: account
    })
    await bnk.depositEther({ from: account, value: mintAmount })
  }

  console.log(chalk.cyan('minting/depositing complete'))

  callback()
}
