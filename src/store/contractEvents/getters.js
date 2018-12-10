import { pathOr } from 'ramda'

export const gamesLogs = state => pathOr({}, ['gamesLogs'], state)

export const gameLogs = state => gameId =>
  pathOr(null, ['gamesLogs', gameId], state)
