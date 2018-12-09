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
    const mintAmount = toBN(20e18)
    const depositAmount = mintAmount.sub(toBN(5e18))
    await tst.mint(account, mintAmount, { from: account })
    console.log(chalk.cyan(`minting complete for address ${account}`))
    await tst.approve(bnk.address, depositAmount, { from: account })
    console.log(chalk.cyan(`approve complete for address ${account}`))
    await bnk.depositTokens(tst.address, depositAmount, {
      from: account
    })
    console.log(chalk.cyan(`deposit tokens complete for address ${account}`))
    await bnk.depositEther({ from: account, value: depositAmount })
    console.log(chalk.cyan(`deposit ether complete for address ${account}`))
  }

  console.log(chalk.magenta('minting/depositing complete'))

  callback()
}
