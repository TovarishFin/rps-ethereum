export const toggleDrawer = state => {
  state.drawerOpen = !state.drawerOpen
}

export const setDrawer = (state, payload) => {
  state.drawerOpen = payload
}

export const createNotification = (state, payload) => {
  state.notificationMessage = payload
  state.notificationOpen = true
}

export const setNotification = (state, payload) => {
  state.notificationOpen = payload
}

export const dismissNotification = state => {
  state.notificationOpen = false
  state.notificationMessage = ''
}
