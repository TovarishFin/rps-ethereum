import Bank from '@/../contractsBuild/Bank'

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
