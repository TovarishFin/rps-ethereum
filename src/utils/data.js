import { BN } from 'web3-utils'
import sha3 from 'crypto-js/sha3'

export const isClient = () => typeof window === 'object' && window.document

export const addressZero = '0x' + '0'.repeat(40)

export const bytes32Zero = '0x' + '0'.repeat(64)

export const tokenZero = {
  name: 'Not Found',
  symbol: 'N/A',
  address: addressZero,
  balance: 0,
  depositedBalance: 0,
  allocatedBalance: 0
}

export const decimals18 = new BN(10).pow(new BN(18))

export const decimalsAccuracy = new BN(10).pow(new BN(5))

export const weiToEthCurrencyFormat = wei =>
  wei
    ? `Ξ${new BN(wei)
        .mul(decimalsAccuracy)
        .div(decimals18)
        .toNumber() / 1e5}`
    : 'Ξ0.0'

export const ethToWei = eth => {
  if (!eth) {
    return new BN(0)
  } else {
    const integer = Math.floor(eth)
    const decimals = eth - integer
    const decimalsLength = decimals.toString().replace('0.').length
    const raisedEth = eth * Math.pow(10, decimalsLength)
    const raisedBN = new BN(raisedEth)
    const correctedBN = raisedBN
      .mul(decimals18)
      .div(new BN(10).pow(new BN(decimalsLength)))
    return correctedBN
  }
}

export const weiToEth = wei =>
  wei ? new BN(wei).div(decimals18).toNumber() : new BN(0).toNumber()

export const networkIdToName = id => {
  switch (id) {
    case 3:
      return 'ropsten'
    case 4:
      return 'rinkeby'
    case 42:
      return 'kovan'
    case 1:
      return 'mainnet'
    default:
      return 'mainnet'
  }
}

export const shortenAddress = address =>
  `${address.toLowerCase().slice(0, 6)}...${address.toLowerCase().slice(-6)}`

const isChecksumAddress = function(address) {
  // Check each case
  address = address.replace('0x', '')
  const addressHash = sha3(address.toLowerCase())
  for (let i = 0; i < 40; i++) {
    // the nth letter should be uppercase if the nth digit of casemap is 1
    if (
      (parseInt(addressHash[i], 16) > 7 &&
        address[i].toUpperCase() !== address[i]) ||
      (parseInt(addressHash[i], 16) <= 7 &&
        address[i].toLowerCase() !== address[i])
    ) {
      return false
    }
  }

  return true
}

export const isAddress = function(address) {
  if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
    // check if it has the basic requirements of an address
    return false
  } else if (
    /^(0x)?[0-9a-f]{40}$/.test(address) ||
    /^(0x)?[0-9A-F]{40}$/.test(address)
  ) {
    // If it's all small caps or all all caps, return true
    return true
  } else {
    // Otherwise check each case
    return isChecksumAddress(address)
  }
}
