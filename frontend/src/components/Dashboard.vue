<template>
  <Spinner :visible="isLoading" />

  <div class="dashboard-page">
    <div class="dashboard-container">
      <h1>{{ title }}</h1>
      <p class="subtitle">
        Welcome, <span class="username">{{ username }}</span>
      </p>

      <!-- Add User Button -->
      <button v-if="props.canAdd" class="add-btn" @click="openAddModal">
        ➕ Add User
      </button>
      <div v-if="errorMsg" class="error-box">
        {{ errorMsg }}
      </div>
      <!-- Users Table -->
      <UsersTable
        :users="paginatedUsers"
        @edit="openEditModal"
        @delete="handleDelete"
        :disableDelete="!props.canDelete"
      />

      <!-- Pagination -->
      <div class="pagination" v-if="totalPages > 1">
        <button
          :disabled="currentPage === 1 || isLoading"
          @click="goToPage(currentPage - 1)"
        >
          Previous
        </button>

        <span>Page {{ currentPage }} of {{ totalPages }}</span>

        <button
          :disabled="currentPage === totalPages || isLoading"
          @click="goToPage(currentPage + 1)"
        >
          Next
        </button>
      </div>

      <!-- Add/Edit Modal -->
      <Modal
        v-if="showModal"
        :visible="showModal"
        :title="editingUser ? 'Edit User' : 'Add New User'"
        @close="closeModal"
        @confirm="handleSubmit"
      >
        <div v-if="errorMsgUsername" class="error-box">
          {{ errorMsgUsername }}
        </div>
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
import { ref, computed, watch } from "vue";
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
const username = computed(() => localStorage.getItem("username"));
const isLoading = computed(() => store.getters["admin/isLoading"]);
const allRoles = ["User", "Editor", "Admin"];

// Modal
const showModal = ref(false);
const editingUser = ref(null);
const form = ref({ username: "", roles: [], status: "Enabled" });
const errorMsg = ref(null);
const errorMsgUsername = ref(null);

// Pagination
const currentPage = ref(1);
const limit = 5;
const totalUsers = ref(0);
const totalPages = computed(() => Math.ceil(totalUsers.value / limit));
const paginatedUsers = ref([]);

// Fetch page from server or cache
const fetchPage = async (page = 1) => {
  currentPage.value = page;
  const { users, total } = await store.dispatch("admin/fetchUsers", { page, limit });
  paginatedUsers.value = users;
  totalUsers.value = total;
};

// Watch page change
watch(currentPage, (page) => fetchPage(page), { immediate: true });

// Modal functions
const openAddModal = () => {
  errorMsg.value = ""
  editingUser.value = null;
  form.value = { username: "", roles: ["User"], status: "Enabled" };
  showModal.value = true;
};

const openEditModal = (user) => {
  errorMsg.value = ""
  editingUser.value = user;
  form.value = { id: user.id, username: user.username, roles: [...user.roles], status: user.status };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  errorMsgUsername.value = "";
};

const handleSubmit = async () => {
  if (!form.value.username){
    errorMsgUsername.value = "username required"
    return;
  }
  const curPage = currentPage.value ;
  try{
    if (editingUser.value) {
      await store.dispatch("admin/updateUser", { id: editingUser.value.id, data: { ...form.value }, curPage});
    } else if (props.canAdd) {
      await store.dispatch("admin/addUser", form.value);
    }
    currentPage.value = 1;
    await fetchPage(1); // refresh first page
  }catch(err){
    if(editingUser.value){
      errorMsg.value = `fail to edit username ${form.value.username}`

    }else if(props.canAdd){
      errorMsg.value = `fail to add user ${form.value.username}`
    }
  }
    closeModal();

};

  const handleDelete = async (id) => {
    const curPage = currentPage.value;
    errorMsg.value = ""
    if (!confirm("Are you sure?")) return;

    try {
      await store.dispatch("admin/deleteUser", { id, curPage });
      fetchPage(currentPage.value);
    } catch (error) {
      errorMsg.value = "fail to delete user"
    }
  };

const goToPage = (page) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
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
.error-box {
  margin-bottom: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  background: #fee2e2;
  color: #991b1b;
  font-weight: 500;
}
.modal-form { display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem; }
.modal-form input, .modal-form select { padding: 0.5rem; border-radius: 6px; border: 1px solid #ccc; }
.roles-checkboxes { display: flex; gap: 1rem; margin-bottom: 1rem; }
.roles-checkboxes label { display: flex; align-items: center; gap: 0.3rem; font-size: 0.95rem; }

.pagination { display: flex; justify-content: center; gap: 1rem; margin-top: 1rem; }
.pagination button { padding: 0.5rem 1rem; border-radius: 6px; border: none; background: #2563eb; color: #fff; cursor: pointer; }
.pagination button:disabled { background: #cbd5e1; cursor: not-allowed; }
</style>