import axios from "axios";

export default {
  namespaced: true,

  state: () => ({
    pages: {},      // Cache pages: {1: [...], 2: [...]}
    total: 0,       // Total number of users
    loading: false,
  }),

  mutations: {
    SET_PAGE(state, { page, users, total }) {
      state.pages[page] = users;
      state.total = total;
    },

    SET_LOADING(state, value) {
      state.loading = value;
    },
  ADD_USER(state, user) {
    const limit = 5;

    if (!state.pages[1]) state.pages[1] = [];
    state.pages[1].unshift(user);

    let carryOver = null;
    for (let page = 1; state.pages[page]; page++) {
      if (carryOver) state.pages[page].unshift(carryOver);

      if (state.pages[page].length > limit) {
        carryOver = state.pages[page].pop();
        if (!state.pages[page + 1]) state.pages[page + 1] = [];
      } else {
        carryOver = null;
        break;
      }
    }

    state.total = Object.values(state.pages).reduce(
      (sum, p) => sum + p.length,
      0
    );
  },
  REMOVE_USER_FROM_PAGE(state, { id, curPage }) {
    if (!state.pages[curPage]) return;

    state.pages[curPage] = state.pages[curPage].filter(u => u.id !== id);

    let page = curPage;

    while (state.pages[page + 1] && state.pages[page + 1].length) {
      const movedUser = state.pages[page + 1].shift();
      state.pages[page].push(movedUser);

      if (state.pages[page + 1].length === 0) {
        delete state.pages[page + 1];
        break;
      }

      page++;
    }

    state.total--;

    if (state.pages[curPage] && state.pages[curPage].length === 0) {
      delete state.pages[curPage];
    }
  },

    UPDATE_USER_IN_PAGE(state, { id, user, page }) {
      if (state.pages[page]) {
        const index = state.pages[page].findIndex(u => u.id === user.id);
        if (index !== -1) state.pages[page][index] = user;
      }
    },
  },

  actions: {
    async fetchUsers({ commit, state }, { page = 1, limit = 5 }) {
      if (state.pages[page]) {
        return { users: state.pages[page], total: state.total };
      }

      commit("SET_LOADING", true);
      try {
        const res = await axios.get("/api/users", {
          params: { page, limit },
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        commit("SET_PAGE", { page, users: res.data.users, total: res.data.total });
        return { users: res.data.users, total: res.data.total };
      } catch (err) {
        console.error("Failed to fetch users", err);
        return { users: [], total: 0 };
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
        commit("ADD_USER", res.data); // <-- new user added to first page
      } catch (err) {
        console.error("Failed to add user", err);
        throw err
      } finally {
        commit("SET_LOADING", false);
      }
    },

    async updateUser({ commit }, { id, data, curPage }) {
        commit("SET_LOADING", true);
      try{
        const res = await axios.patch(`/api/users/edit/${id}`, data, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const obj = {
          id,
          user:data,
          page:curPage
        }
        commit("UPDATE_USER_IN_PAGE", obj);
      }
      catch(err){
        console.error("Failed to update user", err);
        throw err
      }finally {
        commit("SET_LOADING", false);

      }
    },

    async deleteUser({ commit }, { id, curPage }) {
      commit("SET_LOADING", true);
      try{
        await axios.delete(`/api/users/delete/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        commit("REMOVE_USER_FROM_PAGE", {id, curPage});
      }catch(err){
        console.error("Failed to delete user", err);
        throw err;
      }finally{
        commit("SET_LOADING", false);

      }

    },

    clearPages({ state }) {
      state.pages = {};
      state.total = 0;
    },
  },

  getters: {
    getPage: (state) => (page) => state.pages[page] || [],
    total: (state) => state.total,
    isLoading: (state) => state.loading,
  },
};