import { addressZero } from '../../utils/data'

export default {
  coinbase: addressZero,
  currentBlock: 0,
  network: '',
  networkId: 0,
  coinbaseReady: false,
  web3Ready: false,
  web3: null,
  web3Ws: null,
  ethReady: false
}
