const { setupContracts } = require('./helpers/rps')

describe('when using rps', () => {
  contract('RockPaperScissors', () => {
    let rps, bnk

    beforeEach('setup contracts', async () => {
      const contracts = await setupContracts()
      rps = contracts.rps
      bnk = contracts.bnk
    })

    it('should deploy correctly... i hope...', async () => {
      console.log('working.... hooray')
    })
  })
})
