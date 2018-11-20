export const toggleDrawer = ({ commit }) => {
  commit('toggleDrawer')
}

export const setDrawer = ({ commit }, payload) => {
  commit('setDrawer', payload)
}

export const createNotification = ({ commit }, payload) => {
  commit('createNotification', payload)
}

export const setNotification = ({ commit }, payload) => {
  commit('setNotification', payload)
}

export const dismissNotification = ({ commit }) => {
  commit('dismissNotification')
}
