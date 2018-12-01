export const setBank = (state, bank) => {
  state.bank = bank
}

export const setBankWs = (state, bankWs) => {
  state.bankWs = bankWs
}

export const setWrappedEther = (state, wrappedEther) => {
  state.wrappedEther = wrappedEther
}

export const setWrappedEtherWs = (state, wrappedEtherWs) => {
  state.wrappedEtherWs = wrappedEtherWs
}

export const setTestToken = (state, testToken) => {
  state.testToken = testToken
}

export const setTestTokenWs = (state, testTokenWs) => {
  state.testTokenWs = testTokenWs
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
