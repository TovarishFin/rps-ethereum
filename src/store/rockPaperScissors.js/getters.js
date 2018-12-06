import { pathOr } from 'ramda'

export const rockPaperScissors = state =>
  pathOr(null, ['rockPaperScissors'], state)

export const rockPaperScissorsWs = state =>
  pathOr(null, ['rockPaperScissorsWsZ'], state)

export const paused = state => pathOr(false, ['paused'], state)

export const timeoutInSeconds = state => pathOr(0, ['timeoutInSeconds'], state)

export const referralFeePerMille = state =>
  pathOr(0, ['referralFeePerMille'], state)

export const feePerMille = state => pathOr(0, ['feePerMille'], state)

export const totalPlayCount = state => pathOr(0, ['totalPlayCount'], state)

export const totalWinCount = state => pathOr(0, ['totalWinCount'], state)

export const totalReferralVolume = state =>
  pathOr(0, ['totalReferralVolume'], state)

export const game = state => gameId => pathOr(null, ['games', gameId], state)

export const openGames = state => pathOr([], ['openGames'], state)
