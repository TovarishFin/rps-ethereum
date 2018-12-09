import { isAddress, addressZero } from '@/utils/data'

const actionIdWatcher = store => {
  store.subscribe(async ({ type, payload }) => {
    switch (type) {
      case 'setCoinbaseTokenUsage':
        await store.dispatch('deleteTokenData')
        store.dispatch('populateTokenData')
        break

      case 'setSelectedTokenAddress':
        if (isAddress(payload) && payload !== addressZero) {
          store.dispatch('getTokenDataOf', payload)
        }

        break

      case 'setOpenGames':
        await store.dispatch('populateGames')

        break
      case 'setSelectedGameId':
        await store.dispatch('getGame', payload)
        break

      default:
        break
    }
  })
}

export default actionIdWatcher
