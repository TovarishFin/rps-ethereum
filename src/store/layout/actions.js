export const toggleDrawer = ({ commit }) => {
  commit('toggleDrawer')
}

export const setDrawer = ({ commit }, drawerOpen) => {
  commit('setDrawer', drawerOpen)
}

export const createNotification = ({ commit }, notificationMessage) => {
  commit('createNotification', notificationMessage)
}

export const setNotification = ({ commit }, notificationOpen) => {
  commit('setNotification', notificationOpen)
}

export const dismissNotification = ({ commit }) => {
  commit('dismissNotification')
}

export const setHideTokenDepositWarnings = ({ commit }, hide) => {
  commit('setHideTokenDepositWarnings', hide)
}

export const setHideEtherDepositWarnings = ({ commit }, hide) => {
  commit('setHideEtherDepositWarnings', hide)
}
