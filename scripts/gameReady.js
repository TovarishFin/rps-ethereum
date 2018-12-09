const Bank = artifacts.require('Bank')
const TestToken = artifacts.require('TestToken')
const RockPaperScissors = artifacts.require('IRockPaperScissors')
const chalk = require('chalk')
const { toBN } = require('web3-utils')
const { addressZero } = require('./helpers')

/* eslint-disable no-console */

module.exports = async function(callback) {
  const accounts = await web3.eth.getAccounts()
  const creator = accounts[0]
  const joiner = accounts[1]
  const bnk = await Bank.deployed()
  const tst = await TestToken.deployed()
  const rps = await RockPaperScissors.deployed()
  const betAmount = toBN(1e18)

  console.log(chalk.yellow('minting/depsoiting funds for game...'))

  await tst.mint(creator, betAmount, { from: creator })
  await tst.approve(bnk.address, betAmount, { from: creator })
  await bnk.depositTokens(tst.address, betAmount, {
    from: creator
  })

  await tst.mint(joiner, betAmount, { from: joiner })
  await tst.approve(bnk.address, betAmount, { from: joiner })
  await bnk.depositTokens(tst.address, betAmount, {
    from: joiner
  })

  console.log(chalk.cyan('minting/depsoiting funds for game complete'))

  console.log(chalk.yellow('creating game as acc 1...'))

  await rps.createGame(addressZero, tst.address, betAmount, {
    from: creator
  })

  const gameId = await rps.lastGameId()

  console.log(chalk.cyan('game creation complete'))

  console.log(chalk.yellow('joining game as acc 2...'))

  await rps.joinGame(addressZero, gameId, {
    from: joiner
  })

  console.log(chalk.cyan('game joined'))

  console.log(chalk.magenta(`gameId is: ${gameId.toString()}`))

  callback()
}
