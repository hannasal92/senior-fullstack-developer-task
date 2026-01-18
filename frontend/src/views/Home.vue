<template>
  <div class="home">
    <div class="welcome-card">
      <h1>Home Page</h1>
      <p class="welcome-text">Welcome, <span class="username">{{ username }}</span>!</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue"
import { useStore } from "vuex"

const store = useStore()
// const username = computed(() => store.state.user.username)
const username = computed(() => localStorage.getItem("username"))
</script>

<style scoped>
.home {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  background: linear-gradient(135deg, #4ade80, #22d3ee); 
  padding: 2rem;
}

.welcome-card {
  background-color: #ffffff;
  padding: 3rem 2rem;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  text-align: center;
  max-width: 500px;
  width: 100%;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.welcome-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.25);
}

h1 {
  font-size: 2.5rem;
  color: #1f2937; 
  margin-bottom: 1rem;
  font-weight: 700;
}

.welcome-text {
  font-size: 1.5rem;
  color: #374151; 
}

.username {
  font-weight: 600;
  color: #2563eb; 
}
</style>