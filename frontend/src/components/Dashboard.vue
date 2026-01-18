<template>
      <Spinner :visible="isLoading" />

  <div class="dashboard-page">
    <!-- Spinner appears when loading -->

    <div class="dashboard-container">
      <h1>{{ title }}</h1>
      <p class="subtitle">
        Welcome, <span class="username">{{ username }}</span>
      </p>

      <button v-if="props.canAdd" class="add-btn" @click="openAddModal">
        ➕ Add User
      </button>

      <UsersTable
        :users="users"
        @edit="openEditModal"
        @delete="handleDelete"
        :disableDelete="!props.canDelete"
      />

      <Modal
        v-if="showModal"
        :visible="showModal"
        :title="editingUser ? 'Edit User' : 'Add New User'"
        @close="closeModal"
        @confirm="handleSubmit"
      >
        <div class="modal-form">
          <input
            v-model="form.username"
            placeholder="Username"
            :disabled="!props.canAdd && !props.canEdit && !editingUser"
          />

          <div v-if="props.canAdd">
            <label>Roles:</label>
            <div class="roles-checkboxes">
              <label v-for="role in allRoles" :key="role">
                <input type="checkbox" :value="role" v-model="form.roles" />
                {{ role }}
              </label>
            </div>
          </div>

          <label>Status:</label>
          <select
            v-model="form.status"
            :disabled="!props.canAdd && !props.canEdit && !editingUser"
          >
            <option>Enabled</option>
            <option>Disabled</option>
            <option>Deleted</option>
          </select>
        </div>
      </Modal>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";
import UsersTable from "./UsersTable.vue";
import Modal from "./Modal.vue";
import Spinner from "./Spinner.vue";

const props = defineProps({
  title: { type: String, default: "Dashboard" },
  canAdd: { type: Boolean, default: false },
  canDelete: { type: Boolean, default: false },
  canEdit: { type: Boolean, default: false },
});

const store = useStore();
const username = computed(() => store.state.user.username);
const users = computed(() => store.getters["admin/users"]);
const isLoading = computed(() => store.getters["admin/isLoading"]);
const allRoles = ["User", "Editor", "Admin"];

const showModal = ref(false);
const editingUser = ref(null);
const form = ref({ username: "", roles: [], status: "Enabled" });

// Fetch users on mounted
onMounted(() => store.dispatch("admin/fetchUsers"));

// Modal functions
const openAddModal = () => {
  if (!props.canAdd) return;
  editingUser.value = null;
  form.value = { username: "", roles: ["User"], status: "Enabled" };
  showModal.value = true;
};

const openEditModal = (user) => {
  editingUser.value = user;
  form.value = {
    username: user.username,
    roles: [...user.roles],
    status: user.status,
  };
  showModal.value = true;
};

const closeModal = () => (showModal.value = false);

const handleSubmit = async () => {
  if (!form.value.username) return alert("Username is required");

  if (editingUser.value) {
    await store.dispatch("admin/updateUser", {
      id: editingUser.value.id,
      data: { ...form.value },
    });
  } else if (props.canAdd) {
    await store.dispatch("admin/addUser", form.value);
  }

  closeModal();
};

const handleDelete = (id) => {
  if (!props.canDelete) return;
  if (!confirm("Are you sure?")) return;
  store.dispatch("admin/deleteUser", id);
};
</script>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  padding: 3rem;
  background: linear-gradient(135deg, #f87171, #fbbf24);
}
.dashboard-container {
  background: #fff;
  border-radius: 16px;
  padding: 2rem;
  width: 100%;
  max-width: 950px;
  box-shadow: 0 15px 30px rgba(0,0,0,0.25);
}
h1 { font-size: 2.2rem; margin-bottom: 0.5rem; }
.subtitle { margin-bottom: 2rem; font-size: 1.2rem; }
.username { color: #2563eb; font-weight: 600; }
.add-btn {
  margin-bottom: 1rem;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  border: none;
  background: #2563eb;
  color: #fff;
  cursor: pointer;
  font-weight: 500;
}
.add-btn:hover { background: #1d4ed8; }
.modal-form { display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem; }
.modal-form input, .modal-form select { padding: 0.5rem; border-radius: 6px; border: 1px solid #ccc; }
.roles-checkboxes { display: flex; gap: 1rem; margin-bottom: 1rem; }
.roles-checkboxes label { display: flex; align-items: center; gap: 0.3rem; font-size: 0.95rem; }
</style>