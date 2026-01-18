import axios from "axios";

export default {
  namespaced: true,

  state: () => ({
    list: [],
    loading: false,
    loaded: false, // cache flag
    lastFetched: null, // optional: timestamp
  }),

  mutations: {
    SET_USERS(state, users) {
      state.list = users;
      state.loaded = true;
      state.lastFetched = Date.now();
    },

    ADD_USER(state, user) {
      state.list.push(user);
    },

    UPDATE_USER(state, updatedUser) {
      const index = state.list.findIndex(u => u.id === updatedUser.id);
      if (index !== -1) state.list[index] = updatedUser;
    },

    REMOVE_USER(state, id) {
      state.list = state.list.filter(u => u.id !== id);
    },

    SET_LOADING(state, value) {
      state.loading = value;
    },

    RESET_CACHE(state) {
      state.loaded = false;
      state.lastFetched = null;
    },
  },

actions: {
  async fetchUsers({ commit, state }) {
    // ✅ Return cached data if already loaded
    if (state.loaded && state.list.length) return;

    commit("SET_LOADING", true);
    try {
      const res = await axios.get("/api/users", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      commit("SET_USERS", res.data);
      commit("SET_LOADED", true); // mark as loaded
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      commit("SET_LOADING", false);
    }
  },

  async addUser({ commit }, userData) {
    commit("SET_LOADING", true);
    try {
      const res = await axios.post("/api/users/add", userData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      commit("ADD_USER", res.data);
    } catch (err) {
      console.error("Failed to add user", err);
    } finally {
      commit("SET_LOADING", false);
    }
  },

  async updateUser({ commit }, { id, data }) {
    commit("SET_LOADING", true);
    try {
      const res = await axios.patch(`/api/users/edit/${id}`, data, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      commit("UPDATE_USER", res.data);
    } catch (err) {
      console.error("Failed to update user", err);
    } finally {
      commit("SET_LOADING", false);
    }
  },

  async deleteUser({ commit }, id) {
    commit("SET_LOADING", true);
    try {
      await axios.delete(`/api/users/delete/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      commit("REMOVE_USER", id);
    } catch (err) {
      console.error("Failed to delete user", err);
    } finally {
      commit("SET_LOADING", false);
    }
  },

  resetCache({ commit }) {
    commit("RESET_CACHE");
  },
},

  getters: {
    users: (state) => state.list,
    isLoading: (state) => state.loading,
  },
};