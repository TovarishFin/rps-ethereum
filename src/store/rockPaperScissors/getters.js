import { pathOr } from 'ramda'
import { gameZero } from '@/utils/data'

export const rockPaperScissors = state =>
  pathOr(null, ['rockPaperScissors'], state)

export const rockPaperScissorsWs = state =>
  pathOr(null, ['rockPaperScissorsWs'], state)

export const paused = state => pathOr(false, ['paused'], state)

export const minBet = state => pathOr(false, ['minBet'], state)

export const timeoutInSeconds = state => pathOr(0, ['timeoutInSeconds'], state)

export const referralFeePerMille = state =>
  pathOr(0, ['referralFeePerMille'], state)

export const feePerMille = state => pathOr(0, ['feePerMille'], state)

export const totalPlayCount = state => pathOr(0, ['totalPlayCount'], state)

export const totalWinCount = state => pathOr(0, ['totalWinCount'], state)

export const totalWinVolume = state => pathOr(0, ['totalWinVolume'], state)

export const totalReferralVolume = state =>
  pathOr(0, ['totalReferralVolume'], state)

export const game = state => gameId =>
  pathOr(gameZero, ['games', gameId], state)

export const openGameIds = state => pathOr([], ['openGameIds'], state)

export const openGames = state =>
  openGameIds(state).map(gameId => game(state)(gameId))

export const selectedGameId = state => pathOr(0, ['selectedGameId'], state)

export const referrer = state => pathOr(null, ['referrer'], state)

export const choiceCommits = state => pathOr({}, ['choiceCommits'], state)

export const choiceCommit = state => gameId =>
  pathOr(null, ['choiceCommits', gameId], state)

export const gameTimedOut = state => gameId =>
  pathOr(false, ['games', gameId, 'timedOut'], state)

export const coinbaseActiveGames = state =>
  pathOr([], ['coinbaseActiveGames'], state)
