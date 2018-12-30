const Registry = artifacts.require('Registry')
const WrappedEther = artifacts.require('WrappedEther')
const TestToken = artifacts.require('TestToken')
const Bank = artifacts.require('Bank')
const Statistics = artifacts.require('Statistics')
const Referrals = artifacts.require('Referrals')
const Placeholder = artifacts.require('Placeholder')
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
const referrer = accounts[3]
const referrerAlt = accounts[4]
const stubGameContract = accounts[5]
const other = accounts[6]
const referee = accounts[7]
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
    throw new Error('Expected error not received')
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
  const bigNum1 = toBN(num1.toString())
  const bigNum2 = toBN(num2.toString())
  const bigRange = toBN(range.toString())

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
      id: 'a' + new Date().getSeconds(),
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
  const plc = await Placeholder.new({
    from: owner
  })
  const refMaster = await Referrals.new(reg.address, {
    from: owner
  })
  const refProxy = await ContractProxy.new(refMaster.address, plc.address, {
    from: owner
  })
  const ref = await Referrals.at(refProxy.address)
  const staMaster = await Statistics.new(reg.address, {
    from: owner
  })
  const staProxy = await ContractProxy.new(staMaster.address, plc.address, {
    from: owner
  })
  const sta = await Statistics.at(staProxy.address, plc.address)
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
  const tst = await TestToken.new({
    from: owner
  })

  await reg.updateEntry('Bank', bnk.address)
  await reg.updateEntry('RockPaperScissors', rps.address)
  await reg.updateEntry('Statistics', sta.address)
  await reg.updateEntry('Referrals', ref.address)
  await reg.addGameContract(rpsProxy.address)

  for (const account of accounts) {
    await tst.mint(account, toBN(5e18), { from: account })
    await tst.approve(bnk.address, toBN(5e18), { from: account })
  }

  return {
    reg,
    weth,
    tst,
    bnk,
    rps,
    rpsCore,
    rpsMan,
    rpsProxy,
    ref,
    sta
  }
}

const initializeSupplementalProxies = async (
  contracts,
  config = { from: owner }
) => {
  const { sta, ref, reg } = contracts
  await sta.initialize(reg.address, config)
  await ref.initialize(reg.address, config)
}

module.exports = {
  referee,
  other,
  stubGameContract,
  owner,
  ethUser,
  tokenUser,
  referrer,
  referrerAlt,
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
  setupContracts,
  initializeSupplementalProxies
}
