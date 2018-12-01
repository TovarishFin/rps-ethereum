import { pathOr } from 'ramda'
import { addressZero } from '@/utils/data'

export const bank = state => pathOr(null, ['bank'], state)

export const bankWs = state => pathOr(null, ['bankWs'], state)

export const wrappedEther = state => pathOr(null, ['wrappedEther'], state)

export const wrappedEtherWs = state => pathOr(null, ['wrappedEtherWs'], state)

export const testToken = state => pathOr(null, ['testToken'], state)

export const testTokenWs = state => pathOr(null, ['testTokenWs'], state)

export const wethAddress = state => pathOr(addressZero, ['wethAddress'], state)

export const coinbaseTokenUsage = state =>
  pathOr([], ['coinbaseTokenUsage'], state)

export const coinbaseTokenBalance = state => tokenAddress =>
  pathOr(0, ['coinbaseTokenBalance', tokenAddress], state)

export const coinbaseAllocatedTokens = state => tokenAddress =>
  pathOr(0, ['coinbaseAllocatedTokens', tokenAddress], state)
