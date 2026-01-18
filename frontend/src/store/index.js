import { createStore } from "vuex"
import user from "./user"
import admin from "./admin"

export default createStore({
	state: {
		// Define your state here
	},
	getters: {
		// Define your getters here
	},
	mutations: {
		// Define your mutations here
	},
	actions: {
		// Define your actions here
	},
	modules: {
		// Define your modules here
		user,
		admin
	},
})
