import { createRouter, createWebHistory } from "vue-router"
import store from "../store"

const routes = [
  {
    path: "/",
    name: "Login",
    component: () => import("../views/Login.vue"),
    meta: { guestOnly: true },
  },
  {
    path: "/home",
    name: "Home",
    component: () => import("../views/Home.vue"),
    meta: { requiresAuth: true }, 
  },
  {
    path: "/admin",
    name: "Admin",
    component: () => import("../views/AdminView.vue"),
    meta: { requiresAuth: true, requiresRole: "Admin" },
  },
  {
    path: "/editor",
    name: "Editor",
    component: () => import("../views/EditorView.vue"),
    meta: { requiresAuth: true, requiresRole: ["Editor", "Admin"] },
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/home",
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token")
  const roles = localStorage.getItem("roles")

  if (to.meta.guestOnly && token) return next("/home")

  if (to.meta.requiresAuth && !token) return next("/")

  if (to.meta.requiresRole) {
    const allowedRoles = Array.isArray(to.meta.requiresRole)
      ? to.meta.requiresRole
      : [to.meta.requiresRole]

    const hasRole = allowedRoles.some(role => roles.includes(role))
    if (!hasRole) return next("/home") 
  }

  next()
})

export default router