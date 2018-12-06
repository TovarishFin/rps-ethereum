export const toggleDrawer = state => {
  state.drawerOpen = !state.drawerOpen
}

export const setDrawer = (state, drawerOpen) => {
  state.drawerOpen = drawerOpen
}

export const createNotification = (state, notificationMessage) => {
  state.notificationMessage = notificationMessage
  state.notificationOpen = true
}

export const setNotification = (state, notificationOpen) => {
  state.notificationOpen = notificationOpen
}

export const dismissNotification = state => {
  state.notificationOpen = false
  state.notificationMessage = ''
}

export const setHideTokenDepositWarnings = (state, hide) => {
  state.hideTokenDepositWarnings = hide
}

export const setHideEtherDepositWarnings = (state, hide) => {
  state.hideEtherDepositWarnings = hide
}
