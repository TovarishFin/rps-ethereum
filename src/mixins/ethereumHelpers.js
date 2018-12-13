import { toBN } from 'web3-utils'
import sha3 from 'crypto-js/sha3'

const big18 = toBN(10).pow(toBN(18))

const ethFloatToWei = eth => {
  const ethStr = eth.toString()
  const [int, decimals] = ethStr.split('.')
  const safeDecimals = decimals.toString().slice(0, 18)

  const bigInt = toBN(int).mul(toBN(10).pow(toBN(18 + safeDecimals.length)))
  const bigDecimals = toBN(safeDecimals).mul(toBN(10).pow(toBN(18)))
  const lowerAmount = toBN(10).pow(toBN(safeDecimals.length))
  const adjusted = bigInt.add(bigDecimals).div(lowerAmount)

  return adjusted
}

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
      const ethStr = eth.toString()

      switch (true) {
        case !eth:
          return toBN(0)

        case ethStr.includes('.'):
          return ethFloatToWei(eth)

        case !ethStr.includes('.'):
          return toBN(eth).mul(big18)
        default:
          throw new Error('this shouldn not happen')
      }
    },
    // TODO: this doesn't seem to be giving correct values... fix it!!!
    weiToEth(wei) {
      const { div: valueDiv, mod: valueMod } = toBN(wei).divmod(this.decimals18)
      if (valueMod.toString() === '0') {
        return valueDiv.toString()
      } else {
        const divString = valueDiv.toString()
        const modString = valueMod.toString().replace(/[0]+$/, '')
        return divString + '.' + modString
      }
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
    decimalsAccuracy: () => toBN(10).pow(toBN(5)),
    stageEnum: () => ({
      '0': 'Uninitialized',
      '1': 'Created',
      '2': 'Cancelled',
      '3': 'Ready',
      '4': 'Committed',
      '5': 'Timing Out',
      '6': 'Timed Out',
      '7': 'Tied',
      '8': 'Winner Decided',
      '9': 'Paid'
    }),

    choiceEnum: () => ({
      '0': 'Undecided',
      '1': 'Rock',
      '2': 'Paper',
      '3': 'Scissors'
    })
  }
}
