<template>
  <div v-if="visible" class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <h2>{{ title }}</h2>
      <slot></slot>
      <div class="modal-actions">
        <button @click="close">Cancel</button>
        <button @click="confirm">Confirm</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from "vue"

const props = defineProps({
  visible: Boolean,
  title: String,
})

const emit = defineEmits(["close", "confirm"])

const close = () => emit("close")
const confirm = () => emit("confirm")
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 15px 30px rgba(0,0,0,0.25);
  text-align: center;
}

.modal-actions {
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.modal-actions button {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
}

.modal-actions button:first-child {
  background: #ccc;
  color: #000;
}

.modal-actions button:last-child {
  background: #2563eb;
  color: #fff;
}
</style>