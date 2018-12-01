const Registry = artifacts.require('Registry')
const WrappedEther = artifacts.require('WrappedEther')
const TestToken = artifacts.require('TestToken')
const Bank = artifacts.require('Bank')
const ContractProxy = artifacts.require('Proxy')
const RockPaperScissorsCore = artifacts.require('RockPaperScissorsCore')
const RockPaperScissorsManagement = artifacts.require(
  'RockPaperScissorsManagement'
)
const { toBN } = require('web3-utils')
const chalk = require('chalk')
const fs = require('fs')
const path = require('path')

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
        await deployer.deploy(ContractProxy, rpsCore.address, rpsMan.address, {
          from: owner
        })
        const rpsProxy = await ContractProxy.deployed()
        console.log(chalk.cyan('ContractProxy (rps) deployed'))

        console.log(chalk.yellow('deploying TestToken...'))
        await deployer.deploy(TestToken, {
          from: owner
        })
        const tst = await TestToken.deployed()
        console.log(chalk.cyan('TestToken deployed'))

        console.log(chalk.yellow('updating registry entries...'))
        await reg.updateEntry('Bank', bnk.address)
        await reg.updateEntry('RockPaperScissors', rpsProxy.address)
        console.log(chalk.cyan('registry updates complete'))

        console.log(
          chalk.yellow(
            'minting tst, depositing eth, deposting tokens in bank...'
          )
        )
        for (const account of accounts) {
          const mintAmount = toBN(5e18)
          await tst.mint(account, mintAmount, { from: account })
          await tst.approve(bnk.address, mintAmount, { from: account })
          await bnk.depositTokens(tst.address, mintAmount, { from: account })
          await bnk.depositEther({ from: account, value: mintAmount })
        }

        console.log(chalk.cyan('minting/depositing complete'))

        console.log(
          chalk.yellow('masking multi proxy setup as single contract...')
        )

        const iRpsBuildPath = path.join(
          __dirname,
          '../',
          'contractsBuild',
          'IRockPaperScissors.json'
        )
        const iRpsBuild = JSON.parse(fs.readFileSync(iRpsBuildPath))
        const networkId = await web3.eth.net.getId()
        iRpsBuild.networks[networkId] = rpsProxy.address
        fs.writeFileSync(iRpsBuildPath, JSON.stringify(iRpsBuild, null, 2))

        console.log(chalk.cyan('masking complete'))

        console.log(chalk.magenta('migration complete!'))
      }
    })
    .catch(err => {
      // eslint-disable-next-line no-console
      console.log('problem with test migration: ', err)
    })
}
