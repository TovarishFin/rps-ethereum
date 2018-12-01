import Bank from '@/../contractsBuild/Bank'

//
// start setup related
//

export const setupBank = async ({ commit, getters }) => {
  const { web3, networkId } = getters
  const bnk = new web3.eth.Contract(Bank.abi, Bank.networks[networkId].address)

  commit('setBank', bnk)
}

export const setupBankWs = async ({ commit, getters }) => {
  const { web3Ws, networkId } = getters

  const bnk = new web3Ws.eth.Contract(
    Bank.abi,
    Bank.networks[networkId].address
  )

  commit('setBankWs', bnk)
}

//
// end setup related
//

//
// start contract getters
//

export const getWethAddress = async ({ commit, getters }) => {
  const { bnk } = getters
  const wethAddress = await bnk.methods.weth().call()
  commit('setWethAddress', wethAddress)
}

export const getCoinbaseTokenUsage = async ({ commit, getters }) => {
  const { bnk, coinbase } = getters
  const usage = await bnk.methods.getAllUsedTokens(coinbase).call()
  commit('setCoinbaseTokenUsage', usage)
}

export const getCoinbaseTokenBalance = async (
  { commit, getters },
  tokenAddress
) => {
  const { bnk, coinbase } = getters
  const balance = await bnk.methods
    .tokenBalanceOf(coinbase, tokenAddress)
    .call()
  commit('setCoinbaseTokenBalance', { tokenAddress, balance })
}

export const getCoinbaseAllocatedTokens = async (
  { commit, getters },
  tokenAddress
) => {
  const { bnk, coinbase } = getters
  const amount = await bnk.methods
    .allocatedTokensOf(coinbase, tokenAddress)
    .call()
  commit('setCoinbaseAllocatedTokens', { tokenAddress, amount })
}

//
// end contract getters
//

//
// start contract setters
//

export const depositEtherFor = async ({ getters }, { userAddress, value }) => {
  const { bnk, coinbase } = getters
  await bnk.methods.depositEtherFor(userAddress).send({
    from: coinbase,
    value
  })
}

export const depositEther = async ({ getters }, value) => {
  const { bnk, coinbase } = getters
  await bnk.methods.depositEther().send({
    from: coinbase,
    value
  })
}

export const withdrawEther = async ({ getters }, value) => {
  const { bnk, coinbase } = getters
  await bnk.methods.withdrawEther(value).send({
    from: coinbase
  })
}

export const depositTokens = async ({ getters }, { tokenAddress, value }) => {
  const { bnk, coinbase } = getters
  await bnk.methods.depositTokens(tokenAddress, value).send({
    from: coinbase
  })
}

export const withdrawTokens = async ({ getters }, { tokenAddress, value }) => {
  const { bnk, coinbase } = getters
  await bnk.methods.withdrawTokens(tokenAddress, value).send({
    from: coinbase
  })
}

//
// end contract setters
//
