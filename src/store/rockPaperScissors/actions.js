import RockPaperScissors from '@/../contractsBuild/IRockPaperScissors'
import { toBN, soliditySha3 } from 'web3-utils'
import { addressZero } from '@/utils/data'

//
// start contract state setup functions
//

export const setupRockPaperScissors = async ({ getters, commit }) => {
  const { web3, networkId } = getters
  const rockPaperScissors = await new web3.eth.Contract(
    RockPaperScissors.abi,
    RockPaperScissors.networks[networkId].address
  )

  commit('setRockPaperScissors', rockPaperScissors)
}

export const setupRockPaperScissorsWs = async ({ getters, commit }) => {
  const { web3Ws, networkId } = getters
  const rockPaperScissorsWs = await new web3Ws.eth.Contract(
    RockPaperScissors.abi,
    RockPaperScissors.networks[networkId].address
  )

  commit('setRockPaperScissorsWs', rockPaperScissorsWs)
}

//
// end contract state setup functions
//

//
// start contract state getters
//

export const getPaused = async ({ getters, commit }) => {
  const { rockPaperScissorsWs } = getters
  const paused = await rockPaperScissorsWs.methods.paused().call()

  commit('setPaused', paused)
}

export const getMinBet = async ({ getters, commit }) => {
  const { rockPaperScissorsWs } = getters
  const paused = await rockPaperScissorsWs.methods.minBet().call()

  commit('setMinBet', paused)
}

export const getTimeoutInSeconds = async ({ getters, commit }) => {
  const { rockPaperScissorsWs } = getters
  const timeoutInSeconds = await rockPaperScissorsWs.methods
    .timeoutInSeconds()
    .call()

  commit('setTimeoutInSeconds', timeoutInSeconds)
}

export const getReferralFeePerMille = async ({ getters, commit }) => {
  const { rockPaperScissorsWs } = getters
  const referralFeePerMille = await rockPaperScissorsWs.methods
    .referralFeePerMille()
    .call()

  commit('setReferralFeePerMille', referralFeePerMille)
}

export const getFeePerMille = async ({ getters, commit }) => {
  const { rockPaperScissorsWs } = getters
  const feePerMille = await rockPaperScissorsWs.methods.feePerMille().call()

  commit('setFeePerMille', feePerMille)
}

export const getTotalPlayCount = async ({ getters, commit }) => {
  const { rockPaperScissorsWs } = getters
  const totalPlayCount = await rockPaperScissorsWs.methods
    .totalPlayCount()
    .call()

  commit('setTotalPlayCount', totalPlayCount)
}

export const getTotalWinCount = async ({ getters, commit }) => {
  const { rockPaperScissorsWs } = getters
  const totalWinCount = await rockPaperScissorsWs.methods.totalWinCount().call()

  commit('setTotalWinCount', totalWinCount)
}

export const getTotalWinVolume = async ({ getters, commit }) => {
  const { rockPaperScissorsWs } = getters
  const totalWinVolume = await rockPaperScissorsWs.methods
    .totalWinVolume()
    .call()

  commit('setTotalWinVolume', totalWinVolume)
}

export const getTotalReferralVolume = async ({ getters, commit }) => {
  const { rockPaperScissorsWs } = getters
  const totalReferralVolume = await rockPaperScissorsWs.methods
    .totalReferralVolume()
    .call()

  commit('setTotalReferralVolume', totalReferralVolume)
}

export const getGame = async ({ getters, commit }, gameId) => {
  const { rockPaperScissorsWs } = getters
  const game = await rockPaperScissorsWs.methods.games(gameId).call()
  game.gameId = gameId

  commit('setGame', { gameId, game })
}

export const getOpenGames = async ({ getters, commit }) => {
  const { rockPaperScissorsWs } = getters
  const openGameIds = await rockPaperScissorsWs.methods.allOpenGames().call()

  commit('setOpenGames', openGameIds)
}

export const populateGames = async ({ getters, dispatch }) => {
  const { openGameIds } = getters
  const promises = []
  for (const gameId of openGameIds) {
    promises.push(dispatch('getGame', gameId))
  }

  await Promise.all(promises)
}

//
// end contract state getters
//

//
// start player contract state setters
//

export const createGame = async (
  { getters },
  { referrer = addressZero, tokenAddress, value }
) => {
  const { rockPaperScissors, coinbase } = getters
  await rockPaperScissors.methods
    .createGame(referrer, tokenAddress, value)
    .send({
      from: coinbase,
      value: toBN(value)
    })
}

export const cancelGame = async ({ getters }, gameId) => {
  const { rockPaperScissors, coinbase } = getters
  await rockPaperScissors.methods.cancelGame(gameId).send({
    from: coinbase
  })
}

// TODO: double check... we probably don't need value in config!!!
export const joinGame = async (
  { getters },
  { referrer = addressZero, gameId, value }
) => {
  const { rockPaperScissors, coinbase } = getters
  await rockPaperScissors.methods.joinGame(referrer, gameId).send({
    from: coinbase,
    value: toBN(value)
  })
}

export const commitChoice = async ({ getters, commit }, { gameId, choice }) => {
  const { rockPaperScissors, coinbase, web3Ws } = getters
  const sigParams = await web3Ws.eth.abi.encodeParameters(
    ['uint256', 'uint256'],
    [gameId, choice]
  )
  const sig = await web3Ws.eth.sign(sigParams, coinbase)
  const commitHash = soliditySha3(
    { t: 'uint256', v: gameId },
    { t: 'uint256', v: choice },
    { t: 'bytes', v: sig }
  )
  await rockPaperScissors.methods.commitChoice(gameId, commitHash).send({
    from: coinbase
  })

  const choiceCommit = {
    gameId,
    choice,
    sigParams,
    sig,
    commitHash
  }

  commit('setCommit', { choiceCommit, gameId })
}

export const revealChoice = async ({ getters }, { gameId, choice, sig }) => {
  const { rockPaperScissors, coinbase } = getters
  await rockPaperScissors.methods.revealChoice(gameId, choice, sig).send({
    from: coinbase
  })
}

export const rebuildAndRevealChoice = async (
  { getters },
  { gameId, choice }
) => {
  const { coinbase, web3Ws } = getters
  const sigParams = await web3Ws.eth.abi.encodeParameters(
    ['uint256', 'uint256'],
    [gameId, choice]
  )
  const sig = await web3Ws.eth.sign(sigParams, coinbase)

  await revealChoice({ getters }, { gameId, choice, sig })
}

export const startGameTimeout = async ({ getters }, gameId) => {
  const { rockPaperScissors, coinbase } = getters
  await rockPaperScissors.methods.startGameTimeout(gameId).send({
    from: coinbase
  })
}

export const timeoutGame = async ({ getters }, gameId) => {
  const { rockPaperScissors, coinbase } = getters
  await rockPaperScissors.methods.timeoutGame(gameId).send({
    from: coinbase
  })
}

export const settleBet = async ({ getters }, gameId) => {
  const { rockPaperScissors, coinbase } = getters
  await rockPaperScissors.methods.settleBet(gameId).send({
    from: coinbase
  })
}

//
// end player contract state setters
//

//
// start owner contract state setters
//

export const pause = async ({ getters }) => {
  const { rockPaperScissors, coinbase } = getters
  await rockPaperScissors.methods.pause().send({
    from: coinbase
  })
}

export const unpause = async ({ getters }) => {
  const { rockPaperScissors, coinbase } = getters
  await rockPaperScissors.methods.unpause().send({
    from: coinbase
  })
}

export const updateMinBet = async ({ getters }, newMinBet) => {
  const { rockPaperScissors, coinbase } = getters
  await rockPaperScissors.methods.newMinBet(newMinBet).send({
    from: coinbase
  })
}

export const updateTimeout = async ({ getters }, newTimeoutInSeconds) => {
  const { rockPaperScissors, coinbase } = getters
  await rockPaperScissors.methods
    .newTimeoutInSeconds(newTimeoutInSeconds)
    .send({
      from: coinbase
    })
}

export const updateReferralFeePerMille = async (
  { getters },
  newReferralFeePerMille
) => {
  const { rockPaperScissors, coinbase } = getters
  await rockPaperScissors.methods
    .newReferralFeePerMille(newReferralFeePerMille)
    .send({
      from: coinbase
    })
}

export const updateFeePerMille = async ({ getters }, newFeePerMille) => {
  const { rockPaperScissors, coinbase } = getters
  await rockPaperScissors.methods.newFeePerMille(newFeePerMille).send({
    from: coinbase
  })
}

//
// end owner contract state setters
//

//
// start local state setters
//

export const setSelectedGameId = ({ commit }, gameId) => {
  commit('setSelectedGameId', gameId)
}

//
// end local state setters
//
