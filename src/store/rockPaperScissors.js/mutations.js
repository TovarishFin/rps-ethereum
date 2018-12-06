export const setRockPaperScissors = (state, rockPaperScissors) => {
  state.rockPaperScissors = rockPaperScissors
}

export const setRockPaperScissorsWs = (state, rockPaperScissorsWs) => {
  state.rockPaperScissorsWs = rockPaperScissorsWs
}

export const setPaused = (state, paused) => {
  state.paused = paused
}

export const setTimeoutInSeconds = (state, timeoutInSeconds) => {
  state.timeoutInSeconds = timeoutInSeconds
}

export const setReferralFeePerMille = (state, referralFeePerMille) => {
  state.referralFeePerMille = referralFeePerMille
}

export const setFeePerMille = (state, feePerMille) => {
  state.feePerMille = feePerMille
}

export const setTotalPlayCount = (state, totalPlayCount) => {
  state.totalPlayCount = totalPlayCount
}

export const setTotalWinCount = (state, totalWinCount) => {
  state.totalWinCount = totalWinCount
}

export const setTotalReferralVolume = (state, totalReferralVolume) => {
  state.totalReferralVolume = totalReferralVolume
}

export const setGame = (state, { gameId, game }) => {
  state.games = { ...state.games, [gameId]: game }
}

export const setOpenGames = (state, openGames) => {
  state.openGames = openGames
}
