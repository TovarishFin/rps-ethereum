import { isAddress } from '@/utils/data'

const actionIdWatcher = store => {
  store.subscribe(async ({ type, payload }) => {
    switch (type) {
      case 'setCoinbaseTokenUsage':
        await store.dispatch('deleteTokenData')
        store.dispatch('populateTokenData')
        break

      case 'setSelectedTokenAddress':
        if (isAddress(payload)) {
          store.dispatch('getTokenDataOf', payload)
        }

        break

      default:
        break
    }
  })
}

export default actionIdWatcher
