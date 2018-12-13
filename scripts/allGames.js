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
  let gameId
  let choice1
  let sigParams1
  let sig1
  let commitHash1
  let choice2
  let sigParams2
  let sig2
  let commitHash2

  //
  // start created
  //

  console.log(chalk.yellow('minting/depsoiting funds for game...'))

  await tst.mint(creator, betAmount, { from: creator })
  await tst.approve(bnk.address, betAmount, { from: creator })
  await bnk.depositTokens(tst.address, betAmount, { from: creator })

  console.log(chalk.cyan('minting/depsoiting funds for game complete'))

  console.log(chalk.yellow('creating game...'))

  await rps.createGame(referrer, tst.address, betAmount, { from: creator })
  gameId = await rps.lastGameId()

  console.log(chalk.cyan('game creation complete'))

  console.log(chalk.magenta(`gameId is: ${gameId.toString()}`))

  //
  // end created
  //

  //
  // start cancelled
  //

  console.log(chalk.yellow('minting/depsoiting funds for game...'))

  await tst.mint(creator, betAmount, { from: creator })
  await tst.approve(bnk.address, betAmount, { from: creator })
  await bnk.depositTokens(tst.address, betAmount, { from: creator })

  console.log(chalk.cyan('minting/depsoiting funds for game complete'))

  console.log(chalk.yellow('creating game...'))

  await rps.createGame(referrer, tst.address, betAmount, { from: creator })

  gameId = await rps.lastGameId()

  console.log(chalk.cyan('game creation complete'))

  console.log(chalk.yellow('cancelling game...'))

  await rps.cancelGame(gameId, { from: creator })

  console.log(chalk.cyan('game cancellation complete'))

  console.log(chalk.magenta(`gameId is: ${gameId.toString()}`))

  //
  // end cancelled
  //

  //
  // start ready
  //

  console.log(chalk.yellow('minting/depsoiting funds for game...'))

  await tst.mint(creator, betAmount, { from: creator })
  await tst.approve(bnk.address, betAmount, { from: creator })
  await bnk.depositTokens(tst.address, betAmount, { from: creator })

  await tst.mint(joiner, betAmount, { from: joiner })
  await tst.approve(bnk.address, betAmount, { from: joiner })
  await bnk.depositTokens(tst.address, betAmount, { from: joiner })

  console.log(chalk.cyan('minting/depsoiting funds for game complete'))

  console.log(chalk.yellow('creating game as acc 1...'))

  await rps.createGame(referrer, tst.address, betAmount, { from: creator })

  gameId = await rps.lastGameId()

  console.log(chalk.cyan('game creation complete'))

  console.log(chalk.yellow('joining game as acc 2...'))

  await rps.joinGame(referrer, gameId, { from: joiner })

  console.log(chalk.cyan('game joined'))

  console.log(chalk.magenta(`gameId is: ${gameId.toString()}`))

  //
  // end ready
  //

  //
  // start committed
  //

  console.log(chalk.yellow('minting/depsoiting funds for game...'))

  await tst.mint(creator, betAmount, { from: creator })
  await tst.approve(bnk.address, betAmount, { from: creator })
  await bnk.depositTokens(tst.address, betAmount, { from: creator })

  await tst.mint(joiner, betAmount, { from: joiner })
  await tst.approve(bnk.address, betAmount, { from: joiner })
  await bnk.depositTokens(tst.address, betAmount, { from: joiner })

  console.log(chalk.cyan('minting/depsoiting funds for game complete'))

  console.log(chalk.yellow('creating game as acc 1...'))

  await rps.createGame(referrer, tst.address, betAmount, { from: creator })

  gameId = await rps.lastGameId()

  console.log(chalk.cyan('game creation complete'))

  console.log(chalk.yellow('joining game as acc 2...'))

  await rps.joinGame(referrer, gameId, { from: joiner })

  console.log(chalk.cyan('game joined'))

  console.log(chalk.yellow('committing rock for acc 1 and paper for acc2...'))

  choice1 = '1'
  sigParams1 = await web3.eth.abi.encodeParameters(
    ['uint256', 'uint256'],
    [gameId, choice1]
  )
  sig1 = await web3.eth.sign(sigParams1, creator)
  commitHash1 = soliditySha3(
    { t: 'uint256', v: gameId },
    { t: 'uint256', v: choice1 },
    { t: 'bytes', v: sig1 }
  )
  await rps.commitChoice(gameId, commitHash1, { from: creator })

  choice2 = '2'
  sigParams2 = await web3.eth.abi.encodeParameters(
    ['uint256', 'uint256'],
    [gameId, choice2]
  )
  sig2 = await web3.eth.sign(sigParams2, creator)
  commitHash2 = soliditySha3(
    { t: 'uint256', v: gameId },
    { t: 'uint256', v: choice2 },
    { t: 'bytes', v: sig2 }
  )
  await rps.commitChoice(gameId, commitHash2, { from: joiner })

  console.log('commit of choices complete')

  console.log(chalk.magenta(`gameId is: ${gameId.toString()}`))

  //
  // end committed
  //

  //
  // start tied
  //

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

  gameId = await rps.lastGameId()

  console.log(chalk.cyan('game creation complete'))

  console.log(chalk.yellow('joining game as acc 2...'))

  await rps.joinGame(referrer, gameId, {
    from: joiner
  })

  console.log(chalk.cyan('game joined'))

  console.log(chalk.yellow('committing rock for acc 1 and rock for acc2...'))

  choice1 = '1'
  sigParams1 = await web3.eth.abi.encodeParameters(
    ['uint256', 'uint256'],
    [gameId, choice1]
  )
  sig1 = await web3.eth.sign(sigParams1, creator)
  commitHash1 = soliditySha3(
    { t: 'uint256', v: gameId },
    { t: 'uint256', v: choice1 },
    { t: 'bytes', v: sig1 }
  )
  await rps.commitChoice(gameId, commitHash1, {
    from: creator
  })

  choice2 = '1'
  sigParams2 = await web3.eth.abi.encodeParameters(
    ['uint256', 'uint256'],
    [gameId, choice2]
  )
  sig2 = await web3.eth.sign(sigParams2, creator)
  commitHash2 = soliditySha3(
    { t: 'uint256', v: gameId },
    { t: 'uint256', v: choice2 },
    { t: 'bytes', v: sig2 }
  )
  await rps.commitChoice(gameId, commitHash2, {
    from: joiner
  })

  console.log(chalk.cyan('commit of choices complete'))

  console.log(chalk.yellow('revealing rock for acc 1 and rock for acc 2...'))

  await rps.revealChoice(gameId, choice1, sig1, {
    from: creator
  })

  await rps.revealChoice(gameId, choice2, sig2, {
    from: joiner
  })

  console.log(chalk.cyan('revaling complete'))

  console.log(chalk.magenta(`gameId is: ${gameId.toString()}`))

  //
  // end tied
  //

  //
  // start winner decided
  //

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

  gameId = await rps.lastGameId()

  console.log(chalk.cyan('game creation complete'))

  console.log(chalk.yellow('joining game as acc 2...'))

  await rps.joinGame(referrer, gameId, {
    from: joiner
  })

  console.log(chalk.cyan('game joined'))

  console.log(chalk.yellow('committing rock for acc 1 and paper for acc2...'))

  choice1 = '1'
  sigParams1 = await web3.eth.abi.encodeParameters(
    ['uint256', 'uint256'],
    [gameId, choice1]
  )
  sig1 = await web3.eth.sign(sigParams1, creator)
  commitHash1 = soliditySha3(
    { t: 'uint256', v: gameId },
    { t: 'uint256', v: choice1 },
    { t: 'bytes', v: sig1 }
  )
  await rps.commitChoice(gameId, commitHash1, {
    from: creator
  })

  choice2 = '2'
  sigParams2 = await web3.eth.abi.encodeParameters(
    ['uint256', 'uint256'],
    [gameId, choice2]
  )
  sig2 = await web3.eth.sign(sigParams2, creator)
  commitHash2 = soliditySha3(
    { t: 'uint256', v: gameId },
    { t: 'uint256', v: choice2 },
    { t: 'bytes', v: sig2 }
  )
  await rps.commitChoice(gameId, commitHash2, {
    from: joiner
  })

  console.log(chalk.cyan('commit of choices complete'))

  console.log(chalk.yellow('revealing rock for acc 1 and paper for acc 2...'))

  await rps.revealChoice(gameId, choice1, sig1, {
    from: creator
  })

  await rps.revealChoice(gameId, choice2, sig2, {
    from: joiner
  })

  console.log(chalk.cyan('revaling complete'))

  console.log(chalk.magenta(`gameId is: ${gameId.toString()}`))

  //
  // end winner decided
  //

  //
  // start paid
  //

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

  gameId = await rps.lastGameId()

  console.log(chalk.cyan('game creation complete'))

  console.log(chalk.yellow('joining game as acc 2...'))

  await rps.joinGame(referrer, gameId, {
    from: joiner
  })

  console.log(chalk.cyan('game joined'))

  console.log(chalk.yellow('committing rock for acc 1 and paper for acc2...'))

  choice1 = '1'
  sigParams1 = await web3.eth.abi.encodeParameters(
    ['uint256', 'uint256'],
    [gameId, choice1]
  )
  sig1 = await web3.eth.sign(sigParams1, creator)
  commitHash1 = soliditySha3(
    { t: 'uint256', v: gameId },
    { t: 'uint256', v: choice1 },
    { t: 'bytes', v: sig1 }
  )
  await rps.commitChoice(gameId, commitHash1, {
    from: creator
  })

  choice2 = '2'
  sigParams2 = await web3.eth.abi.encodeParameters(
    ['uint256', 'uint256'],
    [gameId, choice2]
  )
  sig2 = await web3.eth.sign(sigParams2, creator)
  commitHash2 = soliditySha3(
    { t: 'uint256', v: gameId },
    { t: 'uint256', v: choice2 },
    { t: 'bytes', v: sig2 }
  )
  await rps.commitChoice(gameId, commitHash2, {
    from: joiner
  })

  console.log(chalk.cyan('commit of choices complete'))

  console.log(chalk.yellow('revealing rock for acc 1 and paper for acc 2...'))

  await rps.revealChoice(gameId, choice1, sig1, {
    from: creator
  })

  await rps.revealChoice(gameId, choice2, sig2, {
    from: joiner
  })

  console.log(chalk.cyan('revaling complete'))

  console.log(chalk.yellow('settling bet...'))

  await rps.settleBet(gameId, {
    from: joiner
  })

  console.log(chalk.cyan('bet settlement complete'))

  console.log(chalk.magenta(`gameId is: ${gameId.toString()}`))

  //
  // end paid
  //

  //
  // start timing out committed
  //

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

  gameId = await rps.lastGameId()

  console.log(chalk.cyan('game creation complete'))

  console.log(chalk.yellow('joining game as acc 2...'))

  await rps.joinGame(referrer, gameId, {
    from: joiner
  })

  console.log(chalk.cyan('game joined'))

  console.log(chalk.yellow('committing rock for acc 1'))

  choice1 = '1'
  sigParams1 = await web3.eth.abi.encodeParameters(
    ['uint256', 'uint256'],
    [gameId, choice1]
  )
  sig1 = await web3.eth.sign(sigParams1, creator)
  commitHash1 = soliditySha3(
    { t: 'uint256', v: gameId },
    { t: 'uint256', v: choice1 },
    { t: 'bytes', v: sig1 }
  )
  await rps.commitChoice(gameId, commitHash1, {
    from: creator
  })

  console.log('commit of choice complete')

  console.log(chalk.yellow('starting timeout as acc 1'))

  await rps.startGameTimeout(gameId, {
    from: creator
  })

  console.log(chalk.cyan('timeout start complete'))

  console.log(chalk.magenta(`gameId is: ${gameId.toString()}`))

  //
  // end timing out committed
  //

  //
  // start timing out revealed
  //

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

  gameId = await rps.lastGameId()

  console.log(chalk.cyan('game creation complete'))

  console.log(chalk.yellow('joining game as acc 2...'))

  await rps.joinGame(referrer, gameId, {
    from: joiner
  })

  console.log(chalk.cyan('game joined'))

  console.log(chalk.yellow('committing rock for acc 1 and paper for acc2...'))

  choice1 = '1'
  sigParams1 = await web3.eth.abi.encodeParameters(
    ['uint256', 'uint256'],
    [gameId, choice1]
  )
  sig1 = await web3.eth.sign(sigParams1, creator)
  commitHash1 = soliditySha3(
    { t: 'uint256', v: gameId },
    { t: 'uint256', v: choice1 },
    { t: 'bytes', v: sig1 }
  )
  await rps.commitChoice(gameId, commitHash1, {
    from: creator
  })

  choice2 = '2'
  sigParams2 = await web3.eth.abi.encodeParameters(
    ['uint256', 'uint256'],
    [gameId, choice2]
  )
  sig2 = await web3.eth.sign(sigParams2, creator)
  commitHash2 = soliditySha3(
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

  //
  // end timing out revealed
  //

  //
  // start timed out
  //

  console.log(chalk.yellow('minting/depsoiting funds for game...'))

  await tst.mint(creator, betAmount, { from: creator })
  await tst.approve(bnk.address, betAmount, { from: creator })
  await bnk.depositTokens(tst.address, betAmount, { from: creator })

  await tst.mint(joiner, betAmount, { from: joiner })
  await tst.approve(bnk.address, betAmount, { from: joiner })
  await bnk.depositTokens(tst.address, betAmount, { from: joiner })

  console.log(chalk.cyan('minting/depsoiting funds for game complete'))

  console.log(chalk.yellow('creating game as acc 1...'))

  await rps.createGame(referrer, tst.address, betAmount, { from: creator })

  gameId = await rps.lastGameId()

  console.log(chalk.cyan('game creation complete'))

  console.log(chalk.yellow('joining game as acc 2...'))

  await rps.joinGame(referrer, gameId, { from: joiner })

  console.log(chalk.cyan('game joined'))

  console.log(chalk.yellow('committing rock for acc 1'))

  choice1 = '1'
  sigParams1 = await web3.eth.abi.encodeParameters(
    ['uint256', 'uint256'],
    [gameId, choice1]
  )
  sig1 = await web3.eth.sign(sigParams1, creator)
  commitHash1 = soliditySha3(
    { t: 'uint256', v: gameId },
    { t: 'uint256', v: choice1 },
    { t: 'bytes', v: sig1 }
  )
  await rps.commitChoice(gameId, commitHash1, { from: creator })

  console.log('commit of choice complete')

  console.log(chalk.yellow('starting timeout as acc 1'))

  await rps.startGameTimeout(gameId, { from: creator })

  console.log(chalk.cyan('timeout start complete'))

  console.log(chalk.yellow('waiting for 5 seconds before timing out...'))

  setTimeout(async () => {
    try {
      await rps.timeoutGame(gameId, { from: creator })
    } catch (err) {
      console.log(
        chalk.red(
          'timeout failed... this is likely due to the timeout being too high... redploy contracts with lower timeout and try again.'
        )
      )
    }

    console.log(chalk.magenta(`gameId is: ${gameId.toString()}`))

    callback()
  }, 5000)

  //
  // end timed out
  //
}
