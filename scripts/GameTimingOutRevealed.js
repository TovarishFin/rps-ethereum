const Bank = artifacts.require('Bank')
const TestToken = artifacts.require('TestToken')
const RockPaperScissors = artifacts.require('IRockPaperScissors')
const chalk = require('chalk')
const { toBN, soliditySha3 } = require('web3-utils')

/* eslint-disable no-console */

module.exports = async function(callback) {
  const accounts = await web3.eth.getAccounts()
  const creator = accounts[0]
  const joiner = accounts[1]
  const referrer = accounts[2]
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

  await rps.createGame(referrer, tst.address, betAmount, {
    from: creator
  })

  const gameId = await rps.lastGameId()

  console.log(chalk.cyan('game creation complete'))

  console.log(chalk.yellow('joining game as acc 2...'))

  await rps.joinGame(referrer, gameId, {
    from: joiner
  })

  console.log(chalk.cyan('game joined'))

  console.log(chalk.yellow('committing rock for acc 1 and paper for acc2...'))

  const choice1 = '1'
  const sigParams1 = await web3.eth.abi.encodeParameters(
    ['uint256', 'uint256'],
    [gameId, choice1]
  )
  const sig1 = await web3.eth.sign(sigParams1, creator)
  const commitHash1 = soliditySha3(
    { t: 'uint256', v: gameId },
    { t: 'uint256', v: choice1 },
    { t: 'bytes', v: sig1 }
  )
  await rps.commitChoice(gameId, commitHash1, {
    from: creator
  })

  const choice2 = '2'
  const sigParams2 = await web3.eth.abi.encodeParameters(
    ['uint256', 'uint256'],
    [gameId, choice2]
  )
  const sig2 = await web3.eth.sign(sigParams2, creator)
  const commitHash2 = soliditySha3(
    { t: 'uint256', v: gameId },
    { t: 'uint256', v: choice2 },
    { t: 'bytes', v: sig2 }
  )
  await rps.commitChoice(gameId, commitHash2, {
    from: joiner
  })

  console.log(chalk.cyan('commit of choices complete'))

  console.log(chalk.yellow('revealing rock for acc 1...'))

  await rps.revealChoice(gameId, choice1, sig1, {
    from: creator
  })

  console.log(chalk.cyan('reveal complete'))

  console.log(chalk.yellow('starting timeout as acc 1...'))

  await rps.startGameTimeout(gameId, {
    from: creator
  })

  console.log(chalk.cyan('timeout start complete'))

  console.log(chalk.magenta(`gameId is: ${gameId.toString()}`))

  callback()
}
