import { toBN } from 'web3-utils'
import sha3 from 'crypto-js/sha3'

export default {
  methods: {
    weiToEthCurrencyFormat(wei) {
      return wei
        ? `Ξ${toBN(wei)
            .mul(this.decimalsAccuracy)
            .div(this.decimals18)
            .toNumber() / 1e5}`
        : 'Ξ0.0'
    },
    ethToWei(eth) {
      if (!eth) {
        return toBN(0)
      } else {
        const integer = Math.floor(eth)
        const decimals = eth - integer
        const decimalsLength = decimals.toString().replace('0.').length
        const raisedEth = eth * Math.pow(10, decimalsLength)
        const raisedBN = toBN(raisedEth)
        const correctedBN = raisedBN
          .mul(this.decimals18)
          .div(toBN(10).pow(toBN(decimalsLength)))
        return correctedBN
      }
    },
    weiToEth(wei) {
      return wei
        ? toBN(wei)
            .div(this.decimals18)
            .toNumber()
        : toBN(0).toNumber()
    },
    networkIdToName(id) {
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
    },
    shortenAddress(address) {
      return `${address
        .toLowerCase()
        .slice(0, 6)}...${address.toLowerCase().slice(-6)}`
    },
    isChecksumAddress(address) {
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
    },

    isAddress(address) {
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
        return this.isChecksumAddress(address)
      }
    }
  },
  computed: {
    addressZero: () => '0x' + '0'.repeat(40),
    bytes32Zero: () => '0x' + '0'.repeat(64),
    decimals18: () => toBN(10).pow(toBN(18)),
    decimalsAccuracy: () => toBN(10).pow(toBN(5))
  }
}
