import Bank from '@/../contractsBuild/Bank'
import TestToken from '@/../contractsBuild/TestToken'
import WrappedEther from '@/../contractsBuild/WrappedEther'
import IERC20 from '@/../contractsBuild/IERC20'

//
// start setup related
//

export const setupBank = async ({ commit, getters }) => {
  const { web3, networkId } = getters
  const bank = new web3.eth.Contract(Bank.abi, Bank.networks[networkId].address)

  commit('setBank', bank)
}

export const setupBankWs = async ({ commit, getters }) => {
  const { web3Ws, networkId } = getters

  const bank = new web3Ws.eth.Contract(
    Bank.abi,
    Bank.networks[networkId].address
  )

  commit('setBankWs', bank)
}

export const setupWrappedEther = async ({ commit, getters }) => {
  const { web3, networkId } = getters
  const weth = new web3.eth.Contract(
    WrappedEther.abi,
    WrappedEther.networks[networkId].address
  )

  commit('setWrappedEther', weth)
}

export const setupWrappedEtherWs = async ({ commit, getters }) => {
  const { web3Ws, networkId } = getters

  const weth = new web3Ws.eth.Contract(
    WrappedEther.abi,
    WrappedEther.networks[networkId].address
  )

  commit('setWrappedEtherWs', weth)
}

export const setupTestToken = async ({ commit, getters }) => {
  const { web3, networkId } = getters
  const testToken = new web3.eth.Contract(
    TestToken.abi,
    TestToken.networks[networkId].address
  )

  commit('setTestToken', testToken)
}

export const setupTestTokenWs = async ({ commit, getters }) => {
  const { web3Ws, networkId } = getters

  const testToken = new web3Ws.eth.Contract(
    TestToken.abi,
    TestToken.networks[networkId].address
  )

  commit('setTestTokenWs', testToken)
}

//
// end setup related
//

//
// start contract getters
//

export const getWethAddress = async ({ commit, getters }) => {
  const { bank } = getters
  const wethAddress = await bank.methods.weth().call()
  commit('setWethAddress', wethAddress)
}

export const getCoinbaseTokenUsage = async ({ commit, getters }) => {
  const { bank, coinbase } = getters
  const usage = await bank.methods.getAllUsedTokens(coinbase).call()
  commit('setCoinbaseTokenUsage', usage)
}

export const getCoinbaseTokenBalance = async (
  { commit, getters },
  tokenAddress
) => {
  const { bank, coinbase } = getters
  const balance = await bank.methods
    .tokenBalanceOf(coinbase, tokenAddress)
    .call()
  commit('setCoinbaseTokenBalance', { tokenAddress, balance })
}

export const getCoinbaseAllocatedTokens = async (
  { commit, getters },
  tokenAddress
) => {
  const { bank, coinbase } = getters
  const amount = await bank.methods
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
  const { bank, coinbase } = getters
  await bank.methods.depositEtherFor(userAddress).send({
    from: coinbase,
    value
  })
}

export const depositEther = async ({ getters }, value) => {
  const { bank, coinbase } = getters
  await bank.methods.depositEther().send({
    from: coinbase,
    value
  })
}

export const withdrawEther = async ({ getters }, value) => {
  const { bank, coinbase } = getters
  await bank.methods.withdrawEther(value).send({
    from: coinbase
  })
}

export const depositTokens = async ({ getters }, { tokenAddress, value }) => {
  const { bank, coinbase } = getters
  await bank.methods.depositTokens(tokenAddress, value).send({
    from: coinbase
  })
}

export const withdrawTokens = async ({ getters }, { tokenAddress, value }) => {
  const { bank, coinbase } = getters
  await bank.methods.withdrawTokens(tokenAddress, value).send({
    from: coinbase
  })
}

export const batchDepositTokens = async (
  { getters },
  { tokenAddress, value }
) => {
  const { web3, bank, coinbase } = getters
  const erc20 = new web3.eth.Contract(IERC20.abi, tokenAddress)
  const batch = new web3.BatchRequest()

  const approve = erc20.methods
    .approve(bank._address, value)
    .send.request({ from: coinbase })
  const deposit = bank.methods
    .depositTokens(tokenAddress, value)
    .send.request({ from: coinbase })

  await batch.add(deposit)
  await batch.add(approve)

  await batch.execute()
}

//
// end contract setters
//
