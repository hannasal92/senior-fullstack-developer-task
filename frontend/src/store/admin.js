import axios from "axios"

export default {
  namespaced: true,

  state: () => ({
    list: [],
    loading: false,
  }),

  mutations: {
    SET_USERS(state, users) {
      state.list = users
    },

    ADD_USER(state, user) {
      state.list.push(user)
    },

    UPDATE_USER(state, updatedUser) {
      const index = state.list.findIndex(u => u.id === updatedUser.id)
      if (index !== -1) {
        state.list[index] = updatedUser
      }
    },

    REMOVE_USER(state, id) {
      state.list = state.list.filter(u => u.id !== id)
    },

    SET_LOADING(state, value) {
      state.loading = value
    },
  },

  actions: {
    async fetchUsers({ commit, rootState }) {
      commit("SET_LOADING", true)

      const res = await axios.get("/api/users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      commit("SET_USERS", res.data)
      commit("SET_LOADING", false)
    },

    async addUser({ commit, rootState }, userData) {
      const res = await axios.post("/api/users/add", userData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      commit("ADD_USER", res.data)
    },

    async updateUser({ commit, rootState }, { id, data }) {
      const res = await axios.patch(`/api/users/edit/${id}`, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      commit("UPDATE_USER", res.data)
    },

    async deleteUser({ commit, rootState }, id) {
      await axios.delete(`/api/users/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      commit("REMOVE_USER", id)
    },
  },

  getters: {
    users: (state) => state.list,
    isLoading: (state) => state.loading,
  },
}