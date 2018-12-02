import Bank from '@/../contractsBuild/Bank'
import TestToken from '@/../contractsBuild/TestToken'
import WrappedEther from '@/../contractsBuild/WrappedEther'
import IERC20Extended from '@/../contractsBuild/IERC20Extended'
import { toBN } from 'web3-utils'

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

export const getTokenDataOf = async (
  { commit, getters, dispatch },
  tokenAddress
) => {
  const { web3Ws, bank, coinbase } = getters
  try {
    const erc20 = new web3Ws.eth.Contract(IERC20Extended.abi, tokenAddress)
    const data = await Promise.all([
      erc20.methods.name().call(),
      erc20.methods.symbol().call(),
      erc20.methods.balanceOf(coinbase).call(),
      bank.methods.tokenBalanceOf(coinbase, tokenAddress).call(),
      bank.methods.allocatedTokensOf(coinbase, tokenAddress).call()
    ])
    const tokenData = {
      name: data[0],
      symbol: data[1],
      balance: data[2],
      depositedBalance: data[3],
      allocatedBalance: data[4],
      address: tokenAddress
    }

    commit('setTokenDataOf', tokenData)
  } catch (err) {
    dispatch('createNotification', 'that is NOT valid ERC20 token address.')
  }
}

export const populateTokenData = async ({ dispatch, getters }) => {
  const { coinbaseTokenUsage } = getters
  const promises = []
  for (const tokenAddress of coinbaseTokenUsage) {
    promises.push(dispatch('getTokenDataOf', tokenAddress))
  }

  await Promise.all(promises)
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
    value: value.toString()
  })
}

export const depositEther = async ({ getters }, value) => {
  const { bank, coinbase } = getters
  await bank.methods.depositEther().send({
    from: coinbase,
    value: value.toString()
  })
}

export const withdrawEther = async ({ getters }, value) => {
  const { bank, coinbase } = getters
  await bank.methods.withdrawEther(value.toString()).send({
    from: coinbase
  })
}

export const depositTokens = async ({ getters }, { tokenAddress, value }) => {
  const { bank, coinbase } = getters
  await bank.methods.depositTokens(tokenAddress, value.toString()).send({
    from: coinbase
  })
}

export const withdrawTokens = async ({ getters }, { tokenAddress, value }) => {
  const { bank, coinbase } = getters
  await bank.methods.withdrawTokens(tokenAddress, value.toString()).send({
    from: coinbase
  })
}

export const batchDepositTokens = async (
  { getters },
  { tokenAddress, value }
) => {
  const { web3, bank, coinbase } = getters
  const erc20 = new web3.eth.Contract(IERC20Extended.abi, tokenAddress)
  const batch = new web3.BatchRequest()

  const approve = erc20.methods
    .approve(bank._address, value.toString())
    .send.request({ from: coinbase })
  const deposit = bank.methods
    .depositTokens(tokenAddress, value.toString())
    .send.request({ from: coinbase })

  await batch.add(deposit)
  await batch.add(approve)

  await batch.execute()
}

export const mintTestToken = async ({ getters }) => {
  const { testToken, coinbase } = getters
  await testToken.methods.mint(coinbase, toBN(5e18).toString()).send({
    from: coinbase
  })
}

//
// end contract setters
//

//
// start local state setters
//

export const setSelectedTokenAddress = ({ commit }, tokenAddress) => {
  commit('setSelectedTokenAddress', tokenAddress)
}

export const deleteTokenData = ({ commit }) => {
  commit('setTokenData', {})
}

//
// end local state setters
//
