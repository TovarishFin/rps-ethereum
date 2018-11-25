const RockPaperScissorsCore = artifacts.require('RockPaperScissorsCore')
const RockPaperScissorsManagement = artifacts.require(
  'RockPaperScissorsManagement'
)
const IRockPaperScissors = artifacts.require('IRockPaperScissors')
const Registry = artifacts.require('Registry')
const Bank = artifacts.require('Bank')
const ContractProxy = artifacts.require('Proxy')

const { owner } = require('./general')

const setupContracts = async () => {
  const reg = await Registry.new({
    from: owner
  })
  const bnk = await Bank.new(reg.address, {
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

  await rps.initialize(reg.address, 1e17, 60, 1000, 2000, { from: owner })

  return {
    reg,
    bnk,
    rps
  }
}

module.exports = {
  setupContracts
}
