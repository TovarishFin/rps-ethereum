const Registry = artifacts.require('Registry')
const WrappedEther = artifacts.require('WrappedEther')
const Bank = artifacts.require('Bank')
const ContractProxy = artifacts.require('Proxy')
const RockPaperScissorsCore = artifacts.require('RockPaperScissorsCore')
const RockPaperScissorsManagement = artifacts.require(
  'RockPaperScissorsManagement'
)
const IRockPaperScissors = artifacts.require('IRockPaperScissors')

const chalk = require('chalk')
const { BN, toBN } = require('web3-utils')

const owner = accounts[0]
const ethUser = accounts[1]
const tokenUser = accounts[2]
const decimals18 = new BN(10).pow(new BN(18))
const bigZero = new BN(0)
const addressZero = `0x${'0'.repeat(40)}`
const bytes32Zero = '0x' + '00'.repeat(32)
const gasPrice = new BN(5e9)
const oneBlockDay = 60 * 60 * 24
const oneBlockWeek = oneBlockDay * 7
const oneBlockMonth = oneBlockDay * 30
const oneBlockYear = oneBlockMonth * 12

const assertRevert = async promise => {
  try {
    await promise
    assert.fail('Expected revert not received')
  } catch (error) {
    const revertFound = error.message.search('revert') >= 0
    assert(revertFound, `Expected "revert", got ${error} instead`)
  }
}

const waitForEvent = (contract, event, optTimeout) =>
  new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      clearTimeout(timeout)
      // eslint-disable-next-line no-console
      console.log(
        chalk.yellow(
          `⚠️  Timeout waiting for contractEvent ${event}. Ensure this is intended behavior...`
        )
      )
    }, optTimeout || 5000)

    const eventEmitter = contract.contract.events[event]()
    eventEmitter
      .on('data', data => {
        eventEmitter.unsubscribe()
        clearTimeout(timeout)
        resolve(data)
      })
      .on('changed', data => {
        clearTimeout()
        eventEmitter.unsubscribe()
        resolve(data)
      })
      .on('error', err => {
        eventEmitter.unsubscribe()
        reject(err)
      })
  })

const areInRange = (num1, num2, range) => {
  const bigNum1 = new BN(num1.toString())
  const bigNum2 = new BN(num2.toString())
  const bigRange = new BN(range.toString())

  if (bigNum1.eq(bigNum2)) {
    return true
  }

  const larger = bigNum1.gt(bigNum2) ? bigNum1 : bigNum2
  const smaller = bigNum1.lt(bigNum2) ? bigNum1 : bigNum2

  return larger.sub(smaller).lt(bigRange)
}

const getNowInSeconds = () => new BN(Date.now()).div(1000).floor(0)

const trimBytes32Array = bytes32Array =>
  bytes32Array.filter(bytes32 => bytes32 != bytes32Zero)

const getEtherBalance = address => {
  return new Promise((resolve, reject) => {
    web3.eth.getBalance(address, (err, res) => {
      if (err) {
        reject(err)
      }

      resolve(toBN(res))
    })
  })
}

const getTxInfo = txHash => {
  if (typeof txHash === 'object') {
    return txHash.receipt
  }

  return new Promise((resolve, reject) => {
    web3.eth.getTransactionReceipt(txHash, (err, res) => {
      if (err) {
        reject(err)
      }

      resolve(res)
    })
  })
}

const sendTransaction = args => {
  return new Promise(function(resolve, reject) {
    web3.eth.sendTransaction(args, (err, res) => {
      if (err) {
        reject(err)
      } else {
        resolve(res)
      }
    })
  })
}

const send = (method, params = []) =>
  web3.currentProvider.send(
    {
      id: new Date().getSeconds(),
      jsonrpc: '2.0',
      method,
      params
    },
    (err, res) => {
      if (err) {
        // eslint-disable-next-line no-console
        console.log(err)
        return
      }

      return res
    }
  )

// increases time through ganache evm command
const timeWarp = async (seconds, logResults) => {
  if (seconds > 0) {
    await send('evm_increaseTime', [seconds])
    const { timestamp: previousTimestamp } = await web3.eth.getBlock('latest')
    await send('evm_mine')
    const { timestamp: currentTimestamp } = await web3.eth.getBlock('latest')

    /* eslint-disable no-console */
    if (logResults) {
      console.log(`🏳️‍🌈🏳️‍🌈🏳️‍🌈🏳️‍🌈🏳️‍🌈🏳️‍🌈🛸  Warped ${seconds} seconds at new block`)
      console.log(`⏰  previous block timestamp: ${previousTimestamp}`)
      console.log(`⏱  current block timestamp: ${currentTimestamp}`)
    }
  } else {
    console.log('❌ Did not warp... 0 seconds was given as an argument')
    /* eslint-enable no-console */
  }
}

const getCurrentBlockTime = async () => {
  const { timestamp } = await web3.eth.getBlock('latest')
  return timestamp
}

const setupContracts = async () => {
  const reg = await Registry.new({
    from: owner
  })
  const weth = await WrappedEther.new({
    from: owner
  })
  const bnk = await Bank.new(reg.address, weth.address, {
    from: owner
  })
  const rpsCore = await RockPaperScissorsCore.new({
    from: owner
  })
  const rpsMan = await RockPaperScissorsManagement.new({
    from: owner
  })
  const rpsProxy = await ContractProxy.new(rpsCore.address, rpsMan.address, {
    from: owner
  })
  const rps = await IRockPaperScissors.at(rpsProxy.address, {
    from: owner
  })

  await rps.initialize(reg.address, toBN(1e17), 60, 1000, 2000, {
    from: owner
  })

  return {
    reg,
    weth,
    bnk,
    rps
  }
}

module.exports = {
  owner,
  ethUser,
  tokenUser,
  decimals18,
  bigZero,
  addressZero,
  bytes32Zero,
  gasPrice,
  assertRevert,
  waitForEvent,
  areInRange,
  getNowInSeconds,
  trimBytes32Array,
  getEtherBalance,
  getTxInfo,
  sendTransaction,
  timeWarp,
  getCurrentBlockTime,
  oneBlockDay,
  oneBlockWeek,
  oneBlockMonth,
  oneBlockYear,
  setupContracts
}
