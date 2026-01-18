<template>
  <Dashboard title="Admin Dashboard" :canAdd="true" :canDelete="true" :isAdmin="true" />
</template>

<script setup>
import Dashboard from "../components/Dashboard.vue"
</script>
