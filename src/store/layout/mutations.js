export const toggleDrawer = state => {
  state.drawerOpen = !state.drawerOpen
}

export const setDrawer = (state, drawerOpen) => {
  state.drawerOpen = drawerOpen
}

export const createNotification = (state, notificationMessage) => {
  state.notificationMessages = [
    ...state.notificationMessages,
    notificationMessage
  ]
  state.notificationOpen = true
}

export const setNotification = (state, notificationOpen) => {
  state.notificationOpen = notificationOpen
}

export const removeNotification = state => {
  state.notificationMessages = [...state.notificationMessages.splice(1)]
}

export const toggleNotification = state => {
  state.notificationOpen = !state.notificationOpen
}

export const setHideTokenDepositWarnings = (state, hide) => {
  state.hideTokenDepositWarnings = hide
}

export const setHideEtherDepositWarnings = (state, hide) => {
  state.hideEtherDepositWarnings = hide
}
