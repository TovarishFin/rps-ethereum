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

export const dismissNotification = ({ commit, getters }) => {
  commit('removeNotification')
  const { messagesLength } = getters

  if (messagesLength) {
    commit('toggleNotification')
  }

  commit('toggleNotification')
}

export const setHideTokenDepositWarnings = ({ commit }, hide) => {
  commit('setHideTokenDepositWarnings', hide)
}

export const setHideEtherDepositWarnings = ({ commit }, hide) => {
  commit('setHideEtherDepositWarnings', hide)
}

export const setBankTabs = ({ commit }, tabIndex) => {
  commit('setBankTabs', tabIndex)
}

export const setAccountTabs = ({ commit }, tabIndex) => {
  commit('setAccountTabs', tabIndex)
}
