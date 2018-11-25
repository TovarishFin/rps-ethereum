module.exports = (deployer, network, accounts) => {
  deployer
    .then(async () => {
      if (network == 'test') {
        global.accounts = accounts
        return
      } else {
        return
      }
    })
    .catch(err => {
      console.log('problem with test migration: ', err)
    })
}
