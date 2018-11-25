const RockPaperScissors = artifacts.require('RockPaperScissors')
const Registry = artifacts.require('Registry')
const Bank = artifacts.require('Bank')
const Stats = artifacts.require('Stats')

const { owner } = require('./general')

const setupContracts = async () => {
  const reg = await Registry.new({
    from: owner
  })
  const sts = await Stats.new(reg.address, {
    from: owner
  })
  const bnk = await Bank.new(reg.address, {
    from: owner
  })
  const rps = await RockPaperScissors.new(reg.address, 1e17, 60, 1000, 2000, {
    from: owner
  })

  return {
    reg,
    sts,
    bnk,
    rps
  }
}

module.exports = {
  setupContracts
}
