<template>
  <nav class="navbar">
    <router-link
      v-if="!isLoggedIn"
      to="/"
      class="nav-link"
      active-class="active-link"
      exact
    >
      Login
    </router-link>

    <router-link
     v-if="isLoggedIn"
      to="/home"
      class="nav-link"
      active-class="active-link"
      exact
    >
      Home
    </router-link>

    <router-link
      v-if="isAdmin"
      to="/admin"
      class="nav-link"
      active-class="active-link"
      exact
    >
      Admin
    </router-link>

    <router-link
      v-if="isEditorOrAdmin"
      to="/editor"
      class="nav-link"
      active-class="active-link"
      exact
    >
      Editor
    </router-link>
  </nav>
</template>

<script setup>
import { computed } from "vue"
import { useStore } from "vuex"

const store = useStore()

const isLoggedIn = computed(() => !!localStorage.getItem("token"),)
const isAdmin = computed(() => localStorage.getItem("roles").includes("Admin"))
const isEditorOrAdmin = computed(() => {
  const roles = JSON.parse(localStorage.getItem("roles") || "[]")
  return roles.some(role => role === "Editor" || role === "Admin")
})
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 12px 24px;
  background-color: #1f2937;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  margin: 20px auto;
  max-width: 600px;
}

.nav-link {
  color: #f9fafb;
  text-decoration: none;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
  background-color: #374151;
}

.nav-link:hover {
  background-color: #2563eb;
  color: #ffffff;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
}

.active-link {
  background-color: #2563eb;
  color: #ffffff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  transform: translateY(-2px);
}

.nav-link:active {
  transform: translateY(0);
  box-shadow: none;
}
</style>