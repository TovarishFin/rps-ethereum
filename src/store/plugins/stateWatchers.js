const actionIdWatcher = store => {
  store.subscribe(async mutation => {
    switch (mutation.type) {
      case 'setCoinbaseTokenUsage':
        await store.dispatch('deleteTokenData')
        await store.dispatch('populateTokenData')
        break

      default:
        break
    }
  })
}

export default actionIdWatcher
