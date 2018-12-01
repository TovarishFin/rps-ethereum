export const setBank = (state, bank) => {
  state.bank = bank
}

export const setBankWs = (state, bankWs) => {
  state.bankWs = bankWs
}

export const setWethAddress = (state, wethAddress) => {
  state.wethAddress = wethAddress
}

export const setCoinbaseTokenUsage = (state, tokenUsage) => {
  state.coinbaseTokenUsage = tokenUsage
}

export const setCoinbaseTokenBalance = (state, { tokenAddress, balance }) => {
  state.coinbaseTokenBalance[tokenAddress] = balance
}

export const setCoinbaseAllocatedTokens = (state, { tokenAddress, amount }) => {
  state.coinbaseAllocatedTokens[tokenAddress] = amount
}
