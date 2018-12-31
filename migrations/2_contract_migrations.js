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
const { toBN } = require('web3-utils')
const chalk = require('chalk')
const fs = require('fs')
const path = require('path')

const defaultMinBet = toBN(1e16)
const defaultTimeoutInSeconds = toBN(5) // 5 seconds... ONLY USED FOR TESTING!
const defaultReferralFeePerMille = toBN(25)
const defaultFeePerMille = toBN(50)

/* eslint-disable no-console */
/* eslint-disable security/detect-non-literal-fs-filename */
module.exports = (deployer, network, accounts) => {
  deployer
    .then(async () => {
      if (network == 'test') {
        global.accounts = accounts
        return
      } else {
        const owner = accounts[0]
        console.log(chalk.yellow('deploying Registry...'))
        await deployer.deploy(Registry, {
          from: owner
        })
        const reg = await Registry.deployed()
        console.log(chalk.cyan('Registry deployed'))

        console.log(chalk.yellow('deploying WrappedEther...'))
        await deployer.deploy(WrappedEther, {
          from: owner
        })
        const weth = await WrappedEther.deployed()
        console.log(chalk.cyan('WrappedEther deployed'))

        console.log(chalk.yellow('deploying Bank...'))
        await deployer.deploy(Bank, reg.address, weth.address, {
          from: owner
        })
        const bnk = await Bank.deployed()
        console.log(chalk.cyan('Bank deployed'))

        console.log(chalk.yellow('deploying placeholder contract...'))

        await deployer.deploy(Placeholder, {
          from: owner
        })
        const plc = await Placeholder.deployed()

        console.log(chalk.cyan('placeholder contract deployed'))

        console.log(
          chalk.yellow('setting up upgradeable Referrals Contract...')
        )

        const refMaster = await deployer.deploy(Referrals, {
          from: owner
        })
        const refProxy = await deployer.deploy(
          ContractProxy,
          refMaster.address,
          plc.address,
          {
            from: owner
          }
        )
        const ref = await Referrals.at(refProxy.address)
        await ref.initialize(reg.address, {
          from: owner
        })

        console.log(
          chalk.cyan('upgreadeable Referrals contract setup complete')
        )

        console.log(
          chalk.yellow('setting up upgradeable Statistics Contract...')
        )

        const staMaster = await deployer.deploy(Statistics, { from: owner })
        const staProxy = await deployer.deploy(
          ContractProxy,
          staMaster.address,
          plc.address,
          {
            from: owner
          }
        )
        const sta = await Statistics.at(staProxy.address)
        await sta.initialize(reg.address, {
          from: owner
        })

        console.log(
          chalk.cyan('upgreadeable Statistics contract setup complete')
        )

        console.log(chalk.yellow('deploying RockPaperScissorsCore (master)'))
        await deployer.deploy(RockPaperScissorsCore, {
          from: owner
        })
        const rpsCore = await RockPaperScissorsCore.deployed()
        console.log(chalk.cyan('RockPaperScissorsCore (master) deployed'))

        console.log(chalk.yellow('deploying RockPaperScissorsManagement...'))
        await deployer.deploy(RockPaperScissorsManagement, {
          from: owner
        })
        const rpsMan = await RockPaperScissorsManagement.deployed()
        console.log(chalk.cyan('RockPaperScissorsManagement deployed'))

        console.log(chalk.yellow('deploying ContractProxy (rps)...'))

        const rpsProxy = await deployer.deploy(
          ContractProxy,
          rpsCore.address,
          rpsMan.address,
          {
            from: owner
          }
        )
        console.log(chalk.cyan('ContractProxy (rps) deployed'))

        console.log(chalk.yellow('deploying TestToken...'))
        await deployer.deploy(TestToken, {
          from: owner
        })
        console.log(chalk.cyan('TestToken deployed'))

        console.log(chalk.yellow('updating registry entries...'))

        await reg.updateEntry('Bank', bnk.address, {
          from: owner
        })
        await reg.updateEntry('RockPaperScissors', rpsProxy.address, {
          from: owner
        })
        await reg.updateEntry('Statistics', staProxy.address, {
          from: owner
        })
        await reg.updateEntry('Referrals', refProxy.address, {
          from: owner
        })
        await reg.addGameContract(rpsProxy.address, {
          from: owner
        })

        console.log(chalk.cyan('registry updates complete'))

        console.log(chalk.yellow('initializing proxied contract...'))

        const rpsMasked = await IRockPaperScissors.at(rpsProxy.address)
        await rpsMasked.initialize(
          reg.address,
          defaultMinBet,
          defaultTimeoutInSeconds,
          defaultReferralFeePerMille,
          defaultFeePerMille,
          {
            from: owner
          }
        )

        console.log(chalk.cyan('proxy initialization complete'))

        console.log(
          chalk.yellow('masking multi proxy setup as single contract...')
        )
        const networkId = await web3.eth.net.getId()

        const iRpsBuildPath = path.join(
          __dirname,
          '../',
          'contractsBuild',
          'IRockPaperScissors.json'
        )
        const iRpsBuild = JSON.parse(fs.readFileSync(iRpsBuildPath))
        iRpsBuild.networks[networkId] = {}
        iRpsBuild.networks[networkId].address = rpsProxy.address

        fs.writeFileSync(iRpsBuildPath, JSON.stringify(iRpsBuild, null, 2))

        console.log('rps proxy address: ', rpsProxy.address)

        const iStatisticsBuildPath = path.join(
          __dirname,
          '../',
          'contractsBuild',
          'IStatistics.json'
        )
        const iStatisticsBuild = JSON.parse(
          fs.readFileSync(iStatisticsBuildPath)
        )
        iStatisticsBuild.networks[networkId] = {}
        iStatisticsBuild.networks[networkId].address = staProxy.address

        fs.writeFileSync(
          iStatisticsBuildPath,
          JSON.stringify(iStatisticsBuild, null, 2)
        )

        console.log('sta proxy address: ', staProxy.address)

        const iReferralsBuildPath = path.join(
          __dirname,
          '../',
          'contractsBuild',
          'IReferrals.json'
        )
        const iReferralsBuild = JSON.parse(fs.readFileSync(iReferralsBuildPath))
        iReferralsBuild.networks[networkId] = {}
        iReferralsBuild.networks[networkId].address = refProxy.address

        fs.writeFileSync(
          iReferralsBuildPath,
          JSON.stringify(iReferralsBuild, null, 2)
        )

        console.log('ref proxy address: ', refProxy.address)

        console.log(chalk.cyan('masking complete'))

        console.log(chalk.magenta('migration complete!'))
      }
    })
    .catch(err => {
      // eslint-disable-next-line no-console
      console.log('problem with test migration: ', err)
    })
}
