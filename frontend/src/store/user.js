// store/user.js
import axios from "axios"

export default {
  namespaced: true,
  state: () => ({
    token: null,
    username: null,
    roles: [],
  }),
  getters: {
    isLoggedIn: (state) => !!localStorage.getItem("token"),
    isAdmin: (state) => localStorage.getItem("roles").includes("Admin"),
    isEditor: (state) => localStorage.getItem("roles").includes("Editor"),
  },
  mutations: {
    setUser(state, payload) {
      state.token = payload.token
      state.username = payload.username
      state.roles = payload.roles
    },
    clearUser(state) {
      state.token = null
      state.username = null
      state.roles = []
    },
  },
  actions: {
    async login({ commit }, username) {
      const response = await axios.post(`/api/users/login/${username}`)
      commit("setUser", {
        token: response.data.access_token,
        username: response.data.username,
        roles: response.data.roles,
      })
      // Optionally save to localStorage
      localStorage.setItem("token", response.data.access_token)
      localStorage.setItem("username", response.data.username)
      localStorage.setItem("roles", JSON.stringify(response.data.roles))
    },
    logout({ commit }) {
      commit("clearUser")
      localStorage.clear()
    },
    loadFromStorage({ commit }) {
      const token = localStorage.getItem("token")
      const username = localStorage.getItem("username")
      const roles = JSON.parse(localStorage.getItem("roles") || "[]")
      if (token && username) {
        commit("setUser", { token, username, roles })
      }
    },
  },
}